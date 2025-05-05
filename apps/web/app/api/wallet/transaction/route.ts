import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      type,
      email, 
      bank,
      accountHolderName, 
      accountNumber,
      ifscCode,
      recipientEmail, 
      description, 
    } = await req.json();


    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    
    const decimalAmount = new Decimal(numericAmount);

    
    const transactionType = type.toUpperCase();

    if (transactionType === "DEPOSIT" || transactionType === "WITHDRAW") {
      
      const user = await prisma.user.findUnique({
        where: { email },
        include: { wallet: true },
      });

      if (!user || !user.wallet) {
        return NextResponse.json(
          { error: "User or wallet not found" },
          { status: 404 },
        );
      }

      
      if (transactionType === "DEPOSIT") {
        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              type: transactionType,
              amount: decimalAmount,
              userId: user.id,
              bankName: bank,
              accountNumber,
              ifscCode,
            },
          }),
          prisma.wallet.update({
            where: { id: user.wallet.id },
            data: { balance: { increment: decimalAmount } },
          }),
        ]);
      } else { 
        if (user.wallet.balance.lessThan(decimalAmount)) {
          return NextResponse.json(
            { error: "Insufficient funds" },
            { status: 400 },
          );
        }

        await prisma.$transaction([
          prisma.transaction.create({
            data: {
              type: transactionType,
              amount: decimalAmount,
              userId: user.id,
              bankName: bank,
              accountNumber,
              ifscCode,
            },
          }),
          prisma.wallet.update({
            where: { id: user.wallet.id },
            data: { balance: { decrement: decimalAmount } },
          }),
        ]);
      }
    } else if (transactionType === "TRANSFER") {
      
      if (!recipientEmail) {
        return NextResponse.json(
          { error: "Recipient email is required for transfers" },
          { status: 400 },
        );
      }

      const sender = await prisma.user.findUnique({
        where: { email },
        include: { wallet: true },
      });

      const recipient = await prisma.user.findUnique({
        where: { email: recipientEmail },
        include: { wallet: true },
      });

      if (!sender || !sender.wallet) {
        return NextResponse.json(
          { error: "Sender or sender's wallet not found" },
          { status: 404 },
        );
      }

      if (!recipient || !recipient.wallet) {
        return NextResponse.json(
          { error: "Recipient or recipient's wallet not found" },
          { status: 404 },
        );
      }

      if (sender.wallet.balance.lessThan(decimalAmount)) {
        return NextResponse.json(
          { error: "Insufficient funds" },
          { status: 400 },
        );
      }

      await prisma.$transaction([
        
        prisma.wallet.update({
          where: { id: sender.wallet.id },
          data: { balance: { decrement: decimalAmount } },
        }),
        
        prisma.wallet.update({
          where: { id: recipient.wallet.id },
          data: { balance: { increment: decimalAmount } },
        }),

        prisma.transaction.create({
          data: {
            type: transactionType,
            amount: decimalAmount,
            userId: sender.id,
            sourceWalletId: sender.wallet.id,
            targetWalletId: recipient.wallet.id,
            description: description,
          },
        }),
      ]);
    } else {
      return NextResponse.json(
        { error: "Invalid transaction type" },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Transaction successful" });
  } catch (error: any) {
    console.error("Transaction error:", error.message);
    return NextResponse.json(
      { error: "Transaction failed" },
      { status: 500 },
    );
  }
}
