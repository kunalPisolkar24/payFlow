import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../lib/authOptions";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        wallet: true, 
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.wallet) {
      return NextResponse.json(
        { error: "User wallet not found" },
        { status: 404 }
      );
    }

    let transactions: any[] = [];

    const depositTransactions = await prisma.transaction.findMany({
      where: {
        type: "DEPOSIT",
        userId: user.id,
      },
    });
    transactions = transactions.concat(depositTransactions);

    const withdrawTransactions = await prisma.transaction.findMany({
      where: {
        type: "WITHDRAW",
        userId: user.id,
      },
    });
    transactions = transactions.concat(withdrawTransactions);

    const transferTransactions = await prisma.transaction.findMany({
      where: {
        type: "TRANSFER",
        OR: [
          { sourceWalletId: user.wallet.id },
          { targetWalletId: user.wallet.id },
        ],
      },
      include: {
        sourceWallet: {
          include: {
            user: true,
          },
        },
        targetWallet: {
          include: {
            user: true,
          },
        },
      },
    });

    const transferTransactionsWithNames = transferTransactions.map(
      (transaction: any) => {
        let senderName: string | null = null;
        let recipientName: string | null = null;

        if (transaction.sourceWalletId === user.wallet?.id) {
          senderName = "You";
          recipientName = transaction.targetWallet?.user?.name || null;
        } else if (transaction.targetWalletId === user.wallet?.id) {
          senderName = transaction.sourceWallet?.user?.name || null;
          recipientName = "You";
        }

        return {
          ...transaction,
          senderName,
          recipientName,
        };
      }
    );

    transactions = transactions.concat(transferTransactionsWithNames);

    const formattedTransactions = transactions.map((transaction) => ({
      id: transaction.id,
      type: transaction.type.toLowerCase(),
      amount: transaction.amount,
      description: transaction.description || "",
      timestamp: transaction.timestamp.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      bankName: transaction.bankName
        ? transaction.bankName.toUpperCase()
        : null,
      accountNumber: transaction.accountNumber
        ? `****${transaction.accountNumber.slice(-4)}`
        : null,
      senderName: transaction.senderName || null,
      recipientName: transaction.recipientName || null,
      status: transaction.status,
    }));

    formattedTransactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
