import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { GET } from './route'; 
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';

vi.mock('next-auth/next');
const mockedGetServerSession = vi.mocked(getServerSession);

vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
    },
    wallet: {
      findUnique: vi.fn(),
    }
  },
}));

const mockedPrismaUserFindUnique = vi.mocked(prisma.user.findUnique);
const mockedPrismaTransactionFindMany = vi.mocked(prisma.transaction.findMany);


const mockSession = {
  user: { email: 'test@example.com', id: 'auth-user-123', name: 'Test User' },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: new Date(),
  image: null,
  password: null,
  wallet: {
    id: 101,
    userId: 1,
    balance: new Prisma.Decimal(1000.00),
  },
};

const mockOtherUser = {
    id: 2,
    email: 'other@example.com',
    name: 'Other User',
    emailVerified: new Date(),
    image: null,
    password: null,
    wallet: {
      id: 102,
      userId: 2,
      balance: new Prisma.Decimal(500.00),
    },
  };

const date1 = new Date('2023-10-26T10:00:00.000Z');
const date2 = new Date('2023-10-27T11:30:00.000Z');
const date3 = new Date('2023-10-25T09:15:00.000Z');
const date4 = new Date('2023-10-27T12:00:00.000Z');

const mockDeposit = {
  id: 1001,
  type: TransactionType.DEPOSIT,
  amount: new Prisma.Decimal(500.00),
  description: 'Salary deposit',
  timestamp: date1,
  userId: mockUser.id,
  bankName: 'Test Bank',
  accountNumber: '1234567890',
  status: TransactionStatus.COMPLETED,
  sourceWalletId: null,
  targetWalletId: null,
  ifscCode: null,
};

const mockWithdraw = {
  id: 1002,
  type: TransactionType.WITHDRAW,
  amount: new Prisma.Decimal(100.00),
  description: 'ATM withdrawal',
  timestamp: date3,
  userId: mockUser.id,
  bankName: 'Another Bank',
  accountNumber: '0987654321',
  status: TransactionStatus.PENDING,
  sourceWalletId: null,
  targetWalletId: null,
  ifscCode: null,
};

const mockSentTransfer = {
  id: 1003,
  type: TransactionType.TRANSFER,
  amount: new Prisma.Decimal(50.00),
  description: 'Sent to Other User',
  timestamp: date2,
  userId: mockUser.id,
  sourceWalletId: mockUser.wallet.id,
  targetWalletId: mockOtherUser.wallet.id,
  sourceWallet: {
      id: mockUser.wallet.id,
      balance: mockUser.wallet.balance,
      userId: mockUser.id,
      user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          emailVerified: mockUser.emailVerified,
          image: mockUser.image,
          password: mockUser.password,
      }
  },
  targetWallet: {
      id: mockOtherUser.wallet.id,
      balance: mockOtherUser.wallet.balance,
      userId: mockOtherUser.id,
      user: {
          id: mockOtherUser.id,
          name: mockOtherUser.name,
          email: mockOtherUser.email,
          emailVerified: mockOtherUser.emailVerified,
          image: mockOtherUser.image,
          password: mockOtherUser.password,
      }
  },
  status: TransactionStatus.COMPLETED,
  bankName: null,
  accountNumber: null,
  ifscCode: null,
};

const mockReceivedTransfer = {
  id: 1004,
  type: TransactionType.TRANSFER,
  amount: new Prisma.Decimal(25.00),
  description: 'Received from Other User',
  timestamp: date4,
  userId: mockOtherUser.id,
  sourceWalletId: mockOtherUser.wallet.id,
  targetWalletId: mockUser.wallet.id,
  sourceWallet: {
      id: mockOtherUser.wallet.id,
      balance: mockOtherUser.wallet.balance,
      userId: mockOtherUser.id,
      user: {
          id: mockOtherUser.id,
          name: mockOtherUser.name,
          email: mockOtherUser.email,
          emailVerified: mockOtherUser.emailVerified,
          image: mockOtherUser.image,
          password: mockOtherUser.password,
      }
  },
  targetWallet: {
      id: mockUser.wallet.id,
      balance: mockUser.wallet.balance,
      userId: mockUser.id,
      user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          emailVerified: mockUser.emailVerified,
          image: mockUser.image,
          password: mockUser.password,
      }
  },
  status: TransactionStatus.COMPLETED,
  bankName: null,
  accountNumber: null,
  ifscCode: null,
};


describe('GET /api/transactions', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    vi.resetAllMocks();
    mockRequest = new NextRequest('http://localhost/api/transactions');
  });

  it('should return 401 Unauthorized if user is not authenticated', async () => {
    mockedGetServerSession.mockResolvedValue(null);

    const response = await GET(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: 'Unauthorized' });
    expect(mockedPrismaUserFindUnique).not.toHaveBeenCalled();
  });

  it('should return 404 Not Found if user is not found in DB', async () => {
    mockedGetServerSession.mockResolvedValue(mockSession as any);
    mockedPrismaUserFindUnique.mockResolvedValue(null);

    const response = await GET(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'User not found' });
    expect(mockedPrismaUserFindUnique).toHaveBeenCalledWith({
      where: { email: mockSession.user.email },
      include: { wallet: true },
    });
  });

    it('should return 404 Not Found if user wallet is not found', async () => {
        const userWithoutWallet = { ...mockUser, wallet: null };
        mockedGetServerSession.mockResolvedValue(mockSession as any);
        mockedPrismaUserFindUnique.mockResolvedValue(userWithoutWallet as any);

        const response = await GET(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({ error: 'User wallet not found' });
        expect(mockedPrismaUserFindUnique).toHaveBeenCalledWith({
          where: { email: mockSession.user.email },
          include: { wallet: true },
        });
      });


  it('should return formatted transactions sorted by timestamp descending', async () => {
    mockedGetServerSession.mockResolvedValue(mockSession as any);
    mockedPrismaUserFindUnique.mockResolvedValue(mockUser as any);

    mockedPrismaTransactionFindMany.mockImplementation((args: any) => {
      if (args.where?.type === TransactionType.DEPOSIT && args.where?.userId === mockUser.id) {
        return [mockDeposit] as any;
      }
      if (args.where?.type === TransactionType.WITHDRAW && args.where?.userId === mockUser.id) {
        return [mockWithdraw] as any;
      }
      if (args.where?.type === TransactionType.TRANSFER) {
        const relevantTransfers = [mockSentTransfer, mockReceivedTransfer].filter(tx =>
             args.where.OR.some((cond: any) =>
                  (cond.sourceWalletId && cond.sourceWalletId === tx.sourceWalletId) ||
                  (cond.targetWalletId && cond.targetWalletId === tx.targetWalletId)
             )
        );
        return relevantTransfers as any;
      }
      return [] as any;
    });

    const response = await GET(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toBeInstanceOf(Array);
    expect(body.length).toBe(4);

    expect(body[0].id).toBe(mockReceivedTransfer.id);
    expect(body[1].id).toBe(mockSentTransfer.id);
    expect(body[2].id).toBe(mockDeposit.id);
    expect(body[3].id).toBe(mockWithdraw.id);

    const depositResult = body.find((tx: any) => tx.id === mockDeposit.id);
    expect(depositResult).toEqual({
        id: mockDeposit.id,
        type: 'deposit',
        amount: mockDeposit.amount.toString(),
        description: mockDeposit.description,
        timestamp: date1.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        bankName: 'TEST BANK',
        accountNumber: '****7890',
        senderName: null,
        recipientName: null,
        status: mockDeposit.status,
    });

    const withdrawResult = body.find((tx: any) => tx.id === mockWithdraw.id);
    expect(withdrawResult).toEqual({
        id: mockWithdraw.id,
        type: 'withdraw',
        amount: mockWithdraw.amount.toString(),
        description: mockWithdraw.description,
        timestamp: date3.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        bankName: 'ANOTHER BANK',
        accountNumber: '****4321',
        senderName: null,
        recipientName: null,
        status: mockWithdraw.status,
    });

    const sentResult = body.find((tx: any) => tx.id === mockSentTransfer.id);
    expect(sentResult).toEqual({
        id: mockSentTransfer.id,
        type: 'transfer',
        amount: mockSentTransfer.amount.toString(),
        description: mockSentTransfer.description,
        timestamp: date2.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        bankName: null,
        accountNumber: null,
        senderName: 'You',
        recipientName: mockOtherUser.name,
        status: mockSentTransfer.status,
    });

    const receivedResult = body.find((tx: any) => tx.id === mockReceivedTransfer.id);
    expect(receivedResult).toEqual({
        id: mockReceivedTransfer.id,
        type: 'transfer',
        amount: mockReceivedTransfer.amount.toString(),
        description: mockReceivedTransfer.description,
        timestamp: date4.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        bankName: null,
        accountNumber: null,
        senderName: mockOtherUser.name,
        recipientName: 'You',
        status: mockReceivedTransfer.status,
    });


    expect(mockedPrismaTransactionFindMany).toHaveBeenCalledTimes(3);
    expect(mockedPrismaTransactionFindMany).toHaveBeenCalledWith({
      where: { type: TransactionType.DEPOSIT, userId: mockUser.id },
    });
    expect(mockedPrismaTransactionFindMany).toHaveBeenCalledWith({
      where: { type: TransactionType.WITHDRAW, userId: mockUser.id },
    });
    expect(mockedPrismaTransactionFindMany).toHaveBeenCalledWith({
      where: {
        type: TransactionType.TRANSFER,
        OR: [
          { sourceWalletId: mockUser.wallet.id },
          { targetWalletId: mockUser.wallet.id },
        ],
      },
      include: {
        sourceWallet: { include: { user: true } },
        targetWallet: { include: { user: true } },
      },
    });
  });

   it('should return an empty array if no transactions are found', async () => {
    mockedGetServerSession.mockResolvedValue(mockSession as any);
    mockedPrismaUserFindUnique.mockResolvedValue(mockUser as any);
    mockedPrismaTransactionFindMany.mockResolvedValue([] as any);

    const response = await GET(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
    expect(mockedPrismaTransactionFindMany).toHaveBeenCalledTimes(3);
  });

  it('should return 500 Internal Server Error if Prisma throws an error during user fetch', async () => {
    mockedGetServerSession.mockResolvedValue(mockSession as any);
    const dbError = new Error('Database connection failed');
    mockedPrismaUserFindUnique.mockRejectedValue(dbError);

    const response = await GET(mockRequest);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Internal Server Error' });
  });

    it('should return 500 Internal Server Error if Prisma throws during transaction fetch', async () => {
        mockedGetServerSession.mockResolvedValue(mockSession as any);
        mockedPrismaUserFindUnique.mockResolvedValue(mockUser as any);
        const dbError = new Error('Transaction query failed');
        mockedPrismaTransactionFindMany.mockRejectedValue(dbError);

        const response = await GET(mockRequest);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: 'Internal Server Error' });
      });

});