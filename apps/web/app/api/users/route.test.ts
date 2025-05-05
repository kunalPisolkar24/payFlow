import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { Session } from "next-auth"; 

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
    getServerSession: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { GET } from "./route";
import { authOptions } from "@/lib/authOptions";

const mockUserFindMany = vi.mocked(prisma.user.findMany);
const mockGetServerSession = vi.mocked(getServerSession);
// @ts-ignore
let consoleErrorSpy: vi.SpyInstance;

describe("GET /api/users", () => {
  const mockUsers = [
    { id: 1, name: "Alice", email: "alice@example.com", image: null },
    { id: 2, name: "Bob", email: "bob@example.com", image: null },
    { id: 3, name: "Charlie", email: "charlie@example.com", image: null },
  ];
  const currentUserEmail = "bob@example.com";
  const mockSession: Session = {
    // @ts-ignore
    user: { id:"user-bob-id", name: "Bob", email: currentUserEmail, image: null },
    expires: "some-future-date"
  };

  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  it("should return a list of users excluding the current user when logged in", async () => {
    const expectedUsers = mockUsers.filter(u => u.email !== currentUserEmail);
    mockGetServerSession.mockResolvedValue(mockSession);
    mockUserFindMany.mockResolvedValue(expectedUsers as any);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(expectedUsers);
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
    expect(mockUserFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      where: {
        NOT: {
          email: currentUserEmail,
        },
      },
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should return a list of all users when not logged in (no session)", async () => {
    mockGetServerSession.mockResolvedValue(null);
    mockUserFindMany.mockResolvedValue(mockUsers as any);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockUsers);
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
    expect(mockUserFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      where: {
        NOT: {
          email: undefined,
        },
      },
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

    it("should return a list of all users when session exists but user email is missing", async () => {
    const sessionWithoutEmail: Session = {
        // @ts-ignore
        user: { id: "user-no-email", name: "Nameless", image: null },
        expires: "some-future-date"
    };
    mockGetServerSession.mockResolvedValue(sessionWithoutEmail);
    mockUserFindMany.mockResolvedValue(mockUsers as any);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockUsers);
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
     expect(mockUserFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      where: {
        NOT: {
          email: undefined,
        },
      },
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });


  it("should return 500 if getServerSession fails", async () => {
    const sessionError = new Error("Session retrieval failed");
    mockGetServerSession.mockRejectedValue(sessionError);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch users" });
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockUserFindMany).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching users:", sessionError);
  });

  it("should return 500 if prisma.user.findMany fails", async () => {
    const dbError = new Error("Database query failed");
    mockGetServerSession.mockResolvedValue(mockSession);
    mockUserFindMany.mockRejectedValue(dbError);

    const req = new NextRequest("http://localhost/api/users");
    const response = await GET(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Failed to fetch users" });
    expect(mockGetServerSession).toHaveBeenCalledTimes(1);
    expect(mockUserFindMany).toHaveBeenCalledTimes(1);
     expect(mockUserFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      where: {
        NOT: {
          email: currentUserEmail,
        },
      },
    });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith("Error fetching users:", dbError);
  });
});