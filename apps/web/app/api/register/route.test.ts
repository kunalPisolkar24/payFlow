import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      create: vi.fn(),
    },
    wallet: {
      create: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn(),
    }
}));


import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST } from "./route";

const mockUserCreate = vi.mocked(prisma.user.create);
const mockWalletCreate = vi.mocked(prisma.wallet.create);
const mockBcryptHash = vi.mocked(bcrypt.hash);
//@ts-ignore
let consoleErrorSpy: vi.SpyInstance;

const createPostRequest = (body: any): Request => {
  return new NextRequest("http://localhost/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }) as unknown as Request;
};

describe("POST /api/register", () => {
  const validUserData = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };
  const hashedPassword = "hashedpassword123";
  const createdUser = {
      id: 1,
      name: validUserData.name,
      email: validUserData.email,
      password: hashedPassword,
      image: null,
      emailVerified: null
  };


  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // @ts-ignore
    mockBcryptHash.mockResolvedValue(hashedPassword);
    mockUserCreate.mockResolvedValue(createdUser as any);
    mockWalletCreate.mockResolvedValue({ id: 10, userId: createdUser.id, balance: new Prisma.Decimal(0)} as any);
  });

  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  it("should register a new user successfully", async () => {
    const request = createPostRequest(validUserData);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(createdUser);
    expect(mockBcryptHash).toHaveBeenCalledTimes(1);
    expect(mockBcryptHash).toHaveBeenCalledWith(validUserData.password, 10);
    expect(mockUserCreate).toHaveBeenCalledTimes(1);
    expect(mockUserCreate).toHaveBeenCalledWith({
      data: {
        name: validUserData.name,
        email: validUserData.email,
        password: hashedPassword,
      },
    });
    expect(mockWalletCreate).toHaveBeenCalledTimes(1);
    expect(mockWalletCreate).toHaveBeenCalledWith({
        data: {
            userId: createdUser.id
        }
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should return 400 if name is too short", async () => {
    const invalidData = { ...validUserData, name: "Te" };
    const request = createPostRequest(invalidData);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error[0].message).toContain("Name must be at least 3 characters long");
    expect(mockUserCreate).not.toHaveBeenCalled();
    expect(mockWalletCreate).not.toHaveBeenCalled();
    expect(mockBcryptHash).not.toHaveBeenCalled();
  });

  it("should return 400 if email is invalid", async () => {
    const invalidData = { ...validUserData, email: "test@invalid" };
    const request = createPostRequest(invalidData);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error[0].message).toContain("Invalid email address");
    expect(mockUserCreate).not.toHaveBeenCalled();
  });

   it("should return 400 if password is too short", async () => {
    const invalidData = { ...validUserData, password: "pass" };
    const request = createPostRequest(invalidData);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error[0].message).toContain("Password must be at least 8 characters long");
     expect(mockUserCreate).not.toHaveBeenCalled();
  });

   it("should return 400 if required fields are missing", async () => {
    const invalidData = { name: "Just Name" };
    const request = createPostRequest(invalidData);
    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBeInstanceOf(Array);
    expect(body.error.length).toBeGreaterThanOrEqual(2);
    expect(mockUserCreate).not.toHaveBeenCalled();
  });


  it("should return 500 if password hashing fails", async () => {
      const hashError = new Error("Hashing failed");
      mockBcryptHash.mockRejectedValue(hashError);

      const request = createPostRequest(validUserData);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(mockBcryptHash).toHaveBeenCalledTimes(1);
      expect(mockUserCreate).not.toHaveBeenCalled();
      expect(mockWalletCreate).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error during user registration:", hashError);
  });


  it("should return 500 if user creation fails", async () => {
      const dbError = new Error("Database unique constraint failed");
      mockUserCreate.mockRejectedValue(dbError);

      const request = createPostRequest(validUserData);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(mockBcryptHash).toHaveBeenCalledTimes(1);
      expect(mockUserCreate).toHaveBeenCalledTimes(1);
      expect(mockWalletCreate).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error during user registration:", dbError);
  });

   it("should return 500 if wallet creation fails", async () => {
      const walletError = new Error("Failed to create wallet");
      mockWalletCreate.mockRejectedValue(walletError);

      const request = createPostRequest(validUserData);
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "Internal Server Error" });
      expect(mockBcryptHash).toHaveBeenCalledTimes(1);
      expect(mockUserCreate).toHaveBeenCalledTimes(1);
      expect(mockWalletCreate).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error during user registration:", walletError);
  });

   it("should return 500 for unexpected errors during request processing", async () => {
    const unexpectedError = new Error("Something broke");
     vi.spyOn(JSON, 'parse').mockImplementationOnce(() => { throw unexpectedError; });

     const request = createPostRequest(validUserData);
     const response = await POST(request);
     const body = await response.json();

     expect(response.status).toBe(500);
     expect(body).toEqual({ error: "Internal Server Error" });
     expect(consoleErrorSpy).toHaveBeenCalledWith("Error during user registration:", unexpectedError);
     expect(mockBcryptHash).not.toHaveBeenCalled();
     expect(mockUserCreate).not.toHaveBeenCalled();
     expect(mockWalletCreate).not.toHaveBeenCalled();

     vi.restoreAllMocks();
  });
});