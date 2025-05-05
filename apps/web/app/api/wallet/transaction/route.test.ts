import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    wallet: {
      update: vi.fn(),
    },
    transaction: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import prisma from "@/lib/prisma";
import { POST } from "./route";

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockWalletUpdate = vi.mocked(prisma.wallet.update);
const mockTransactionCreate = vi.mocked(prisma.transaction.create);
const mockTransaction = vi.mocked(prisma.$transaction);

// @ts-ignore
let consoleErrorSpy: vi.SpyInstance;

const createPostRequest = (body: any): NextRequest => {
  return new NextRequest("http://localhost/api/wallet/transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

describe("POST /api/wallet/transaction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-ignore
    mockTransaction.mockImplementation(async (operations: any[]) => {
        return Promise.resolve(new Array(operations.length).fill({}));
    });
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  it("should return 400 for invalid amount (non-numeric)", async () => {
    const req = createPostRequest({ amount: "abc", type: "DEPOSIT", email: "test@test.com" });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid amount" });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });

   it("should return 400 for invalid amount (zero)", async () => {
    const req = createPostRequest({ amount: 0, type: "DEPOSIT", email: "test@test.com" });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid amount" });
   });

    it("should return 400 for invalid amount (negative)", async () => {
    const req = createPostRequest({ amount: -10, type: "DEPOSIT", email: "test@test.com" });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid amount" });
   });

  it("should return 400 for invalid transaction type", async () => {
    const req = createPostRequest({ amount: 100, type: "INVALID_TYPE", email: "test@test.com" });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Invalid transaction type" });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });

  it("should return 400 for transfer without recipient email", async () => {
    const req = createPostRequest({ amount: 100, type: "TRANSFER", email: "sender@test.com" });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Recipient email is required for transfers" });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });

  it("should return 404 if user not found during deposit", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const req = createPostRequest({ amount: 100, type: "DEPOSIT", email: "unknown@test.com" });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "User or wallet not found" });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: "unknown@test.com" },
        include: { wallet: true },
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("should successfully process a deposit", async () => {
    const userEmail = "deposit@test.com";
    const depositAmount = new Decimal(100.50);
    const mockUser = {
        id: 1,
        email: userEmail,
        name: "Dep User",
        wallet: { id: 10, balance: new Decimal(50), userId: 1 }
    };
    mockUserFindUnique.mockResolvedValue(mockUser as any);
    const req = createPostRequest({
        amount: depositAmount.toString(),
        type: "DEPOSIT",
        email: userEmail,
        bank: "Test Bank",
        accountNumber: "12345",
        ifscCode: "TB01"
    });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ message: "Transaction successful" });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
        include: { wallet: true },
    });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockTransaction).toHaveBeenCalledWith([
      prisma.transaction.create({
        data: {
          type: "DEPOSIT",
          amount: depositAmount,
          userId: mockUser.id,
          bankName: "Test Bank",
          accountNumber: "12345",
          ifscCode: "TB01",
        },
      }),
      prisma.wallet.update({
        where: { id: mockUser.wallet.id },
        data: { balance: { increment: depositAmount } },
      }),
    ]);
  });

  it("should return 404 if user not found during withdraw", async () => {
    mockUserFindUnique.mockResolvedValue(null);
    const req = createPostRequest({ amount: 50, type: "WITHDRAW", email: "unknown@test.com" });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "User or wallet not found" });
     expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: "unknown@test.com" },
        include: { wallet: true },
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("should return 400 for withdrawal with insufficient funds", async () => {
     const userEmail = "withdraw@test.com";
     const withdrawAmount = new Decimal(100);
     const mockUser = {
        id: 2,
        email: userEmail,
        name: "Withdraw User",
        wallet: { id: 11, balance: new Decimal(50), userId: 2 }
    };
    mockUserFindUnique.mockResolvedValue(mockUser as any);
     const req = createPostRequest({ amount: withdrawAmount.toString(), type: "WITHDRAW", email: userEmail });
     const response = await POST(req);
     const body = await response.json();
     expect(response.status).toBe(400);
     expect(body).toEqual({ error: "Insufficient funds" });
     expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
        include: { wallet: true },
    });
     expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("should successfully process a withdrawal", async () => {
     const userEmail = "withdraw@test.com";
     const withdrawAmount = new Decimal(50);
     const mockUser = {
        id: 2,
        email: userEmail,
        name: "Withdraw User",
        wallet: { id: 11, balance: new Decimal(100), userId: 2 }
    };
    mockUserFindUnique.mockResolvedValue(mockUser as any);
     const req = createPostRequest({
         amount: withdrawAmount.toString(),
         type: "WITHDRAW",
         email: userEmail,
         bank: "Withdraw Bank",
         accountNumber: "67890",
         ifscCode: "WB01"
     });
     const response = await POST(req);
     const body = await response.json();
     expect(response.status).toBe(200);
     expect(body).toEqual({ message: "Transaction successful" });
     expect(mockUserFindUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
        include: { wallet: true },
    });
     expect(mockTransaction).toHaveBeenCalledTimes(1);
     expect(mockTransaction).toHaveBeenCalledWith([
        prisma.transaction.create({
            data: {
                type: "WITHDRAW",
                amount: withdrawAmount,
                userId: mockUser.id,
                bankName: "Withdraw Bank",
                accountNumber: "67890",
                ifscCode: "WB01",
            },
        }),
        prisma.wallet.update({
            where: { id: mockUser.wallet.id },
            data: { balance: { decrement: withdrawAmount } },
        }),
     ]);
  });

  it("should return 404 if sender not found during transfer", async () => {
    const senderEmail = "unknownsender@test.com";
    const recipientEmail = "recipient@test.com";
    mockUserFindUnique.mockResolvedValueOnce(null);
    const mockRecipient = {
        id: 4, email: recipientEmail, name: "Recipient User",
        wallet: { id: 13, balance: new Decimal(200), userId: 4 }
    };
    mockUserFindUnique.mockResolvedValueOnce(mockRecipient as any);
    const req = createPostRequest({
        amount: 50, type: "TRANSFER", email: senderEmail, recipientEmail: recipientEmail
    });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Sender or sender's wallet not found" });
    expect(mockUserFindUnique).toHaveBeenCalledTimes(2);
    expect(mockUserFindUnique).toHaveBeenNthCalledWith(1, { where: { email: senderEmail }, include: { wallet: true } });
    expect(mockUserFindUnique).toHaveBeenNthCalledWith(2, { where: { email: recipientEmail }, include: { wallet: true } });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

   it("should return 404 if recipient not found during transfer", async () => {
    const senderEmail = "sender@test.com";
    const recipientEmail = "unknownrecipient@test.com";
    const mockSender = {
        id: 3, email: senderEmail, name: "Sender User",
        wallet: { id: 12, balance: new Decimal(100), userId: 3 }
    };
    mockUserFindUnique.mockResolvedValueOnce(mockSender as any);
    mockUserFindUnique.mockResolvedValueOnce(null);
    const req = createPostRequest({
        amount: 50, type: "TRANSFER", email: senderEmail, recipientEmail: recipientEmail
    });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Recipient or recipient's wallet not found" });
    expect(mockUserFindUnique).toHaveBeenCalledTimes(2);
    expect(mockUserFindUnique).toHaveBeenNthCalledWith(1, { where: { email: senderEmail }, include: { wallet: true } });
    expect(mockUserFindUnique).toHaveBeenNthCalledWith(2, { where: { email: recipientEmail }, include: { wallet: true } });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

   it("should return 400 for transfer with insufficient funds", async () => {
    const senderEmail = "sender@test.com";
    const recipientEmail = "recipient@test.com";
    const transferAmount = new Decimal(150);
    const mockSender = {
        id: 3, email: senderEmail, name: "Sender User",
        wallet: { id: 12, balance: new Decimal(100), userId: 3 }
    };
     const mockRecipient = {
        id: 4, email: recipientEmail, name: "Recipient User",
        wallet: { id: 13, balance: new Decimal(200), userId: 4 }
    };
    mockUserFindUnique.mockResolvedValueOnce(mockSender as any);
    mockUserFindUnique.mockResolvedValueOnce(mockRecipient as any);
    const req = createPostRequest({
        amount: transferAmount.toString(), type: "TRANSFER", email: senderEmail, recipientEmail: recipientEmail
    });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Insufficient funds" });
    expect(mockUserFindUnique).toHaveBeenCalledTimes(2);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("should successfully process a transfer", async () => {
     const senderEmail = "sender@test.com";
     const recipientEmail = "recipient@test.com";
     const transferAmount = new Decimal(75);
     const mockSender = {
        id: 3, email: senderEmail, name: "Sender User",
        wallet: { id: 12, balance: new Decimal(100), userId: 3 }
    };
     const mockRecipient = {
        id: 4, email: recipientEmail, name: "Recipient User",
        wallet: { id: 13, balance: new Decimal(200), userId: 4 }
    };
    mockUserFindUnique.mockResolvedValueOnce(mockSender as any);
    mockUserFindUnique.mockResolvedValueOnce(mockRecipient as any);
    const req = createPostRequest({
        amount: transferAmount.toString(), type: "TRANSFER", email: senderEmail, recipientEmail: recipientEmail,
        description: "Payment for goods"
    });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ message: "Transaction successful" });
    expect(mockUserFindUnique).toHaveBeenCalledTimes(2);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockTransaction).toHaveBeenCalledWith([
        prisma.wallet.update({
            where: { id: mockSender.wallet.id },
            data: { balance: { decrement: transferAmount } },
        }),
        prisma.wallet.update({
            where: { id: mockRecipient.wallet.id },
            data: { balance: { increment: transferAmount } },
        }),
        prisma.transaction.create({
            data: {
                type: "TRANSFER", amount: transferAmount, userId: mockSender.id,
                sourceWalletId: mockSender.wallet.id, targetWalletId: mockRecipient.wallet.id,
                description: "Payment for goods",
            },
        }),
    ]);
  });

  it("should return 500 if a database error occurs during transaction", async () => {
    const userEmail = "error@test.com";
    const depositAmount = new Decimal(100);
    const mockUser = {
        id: 5, email: userEmail, name: "Error User",
        wallet: { id: 15, balance: new Decimal(50), userId: 5 }
    };
    mockUserFindUnique.mockResolvedValue(mockUser as any);
    const dbError = new Error("Database connection lost");
    mockTransaction.mockRejectedValue(dbError);
    const req = createPostRequest({
        amount: depositAmount.toString(), type: "DEPOSIT", email: userEmail, bank: "Error Bank",
    });
    const response = await POST(req);
    const body = await response.json();
    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Transaction failed" });
    expect(mockUserFindUnique).toHaveBeenCalledTimes(1);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Transaction error:", dbError.message);
  });
});