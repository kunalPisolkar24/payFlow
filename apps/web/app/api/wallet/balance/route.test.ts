import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import prisma from "@/lib/prisma";
import { GET } from "./route";

const mockUserFindUnique = vi.mocked(prisma.user.findUnique);

// @ts-ignore
let consoleErrorSpy: vi.SpyInstance;

describe("GET /api/wallet/balance", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
      if (consoleErrorSpy) {
          consoleErrorSpy.mockRestore();
      }
  });

  it("should return 400 if email is missing", async () => {
    const req = new NextRequest("http://localhost/api/wallet/balance");

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "Email is required" });
    expect(mockUserFindUnique).not.toHaveBeenCalled();
  });

  it("should return 404 if user is not found", async () => {
    const testEmail = "nonexistent@example.com";
    const req = new NextRequest(
      `http://localhost/api/wallet/balance?email=${testEmail}`,
    );

    mockUserFindUnique.mockResolvedValue(null);

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "User or wallet not found" });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: testEmail },
      include: { wallet: true },
    });
  });

  it("should return 404 if user exists but wallet does not", async () => {
    const testEmail = "userwithoutwallet@example.com";
    const req = new NextRequest(
      `http://localhost/api/wallet/balance?email=${testEmail}`,
    );

    const userWithoutWallet = {
      id: 1,
      email: testEmail,
      name: "Test User",
      image: null,
      emailVerified: null,
      password: null,
      wallet: null,
      accounts: [],
      sessions: [],
      transactions: [],
    };
    mockUserFindUnique.mockResolvedValue(userWithoutWallet);

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "User or wallet not found" });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: testEmail },
      include: { wallet: true },
    });
  });

  it("should return 200 and the wallet balance if user and wallet are found", async () => {
    const testEmail = "existing@example.com";
    const testBalance = "123.45";
    const req = new NextRequest(
      `http://localhost/api/wallet/balance?email=${testEmail}`,
    );

    const mockUserWithWallet = {
      id: 2,
      email: testEmail,
      name: "Existing User",
      image: null,
      emailVerified: null,
      password: null,
      wallet: {
        id: 10,
        userId: 2,
        balance: new Prisma.Decimal(testBalance),
        sourceTransactions: [],
        targetTransactions: [],
      },
      accounts: [],
      sessions: [],
      transactions: [],
    };
    mockUserFindUnique.mockResolvedValue(mockUserWithWallet);

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ balance: testBalance });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: testEmail },
      include: { wallet: true },
    });
  });

   it("should return 500 if there is a database error", async () => {
    const testEmail = "error@example.com";
     const req = new NextRequest(
      `http://localhost/api/wallet/balance?email=${testEmail}`,
    );

    const dbError = new Error("Database connection failed");
    mockUserFindUnique.mockRejectedValue(dbError);

    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch balance" });
    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: testEmail },
      include: { wallet: true },
    });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching balance:", dbError);
  });
});