import swaggerJsdoc from 'swagger-jsdoc';
import { TransactionType, TransactionStatus } from "@prisma/client";

const ErrorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string', example: 'Invalid input' },
    details: {
      oneOf: [
        { type: 'string', example: 'Detailed error message here.' },
        { type: 'object', additionalProperties: true, example: { field: ['Error message'] } }
      ]
    },
  },
  required: ['error'],
};

const SuccessResponseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string', example: 'Operation successful' },
  },
  required: ['success'],
};

const UserRegistrationInputSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 3, example: 'John Doe' },
    email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
    password: { type: 'string', format: 'password', minLength: 8, example: 'yourSecurePassword123' },
  },
  required: ['name', 'email', 'password'],
};

const UserRegistrationOutputSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    name: { type: 'string', nullable: true, example: 'John Doe' },
    email: { type: 'string', format: 'email', nullable: true, example: 'john.doe@example.com' },
    emailVerified: { type: 'string', format: 'date-time', nullable: true, example: '2023-10-26T10:00:00.000Z' },
    image: { type: 'string', format: 'url', nullable: true, example: 'https://example.com/avatar.png' },
  },
  required: ['id'],
};

const CredentialsLoginInputSchema = {
   type: 'object',
   properties: {
      email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
      password: { type: 'string', format: 'password', example: 'yourSecurePassword123' },
   },
   required: ['email', 'password'],
};

const SessionUserSchema = {
   type: 'object',
   properties: {
     id: { type: 'string', description: 'User ID (usually string in session)', example: '1' },
     name: { type: 'string', nullable: true, example: 'John Doe' },
     email: { type: 'string', format: 'email', nullable: true, example: 'john.doe@example.com' },
     image: { type: 'string', format: 'url', nullable: true, example: 'https://example.com/avatar.png' },
   },
   required: ['id', 'name', 'email']
};

const SessionSchema = {
   type: 'object',
   properties: {
      user: { '$ref': '#/components/schemas/SessionUser' },
      expires: { type: 'string', format: 'date-time', example: '2024-11-26T10:00:00.000Z' },
   }
};

const BasicUserInfoOutputSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer', example: 2 },
        name: { type: 'string', nullable: true, example: 'Jane Smith' },
        email: { type: 'string', format: 'email', nullable: true, example: 'jane.smith@example.com' },
        image: { type: 'string', format: 'url', nullable: true, example: 'https://example.com/avatar2.png' },
    },
    required: ['id']
};

const WalletBalanceOutputSchema = {
    type: 'object',
    properties: {
        balance: { type: 'string', description: 'User wallet balance as a string to preserve precision', example: '123.45' }
    },
    required: ['balance']
};

const TransactionInputSchema = {
    type: 'object',
    properties: {
        amount: { type: 'number', format: 'float', description: 'Amount for the transaction', example: 50.00 },
        type: { type: 'string', enum: Object.values(TransactionType), example: 'DEPOSIT' },
        email: { type: 'string', format: 'email', description: 'Email of the user initiating DEPOSIT/WITHDRAW', example: 'john.doe@example.com' },
        bank: { type: 'string', nullable: true, description: 'Bank name for DEPOSIT/WITHDRAW', example: 'Example Bank' },
        accountHolderName: { type: 'string', nullable: true, description: 'Account holder name (not used in code, but good practice)', example: 'John Doe' },
        accountNumber: { type: 'string', nullable: true, description: 'Bank account number for DEPOSIT/WITHDRAW', example: '****1234' },
        ifscCode: { type: 'string', nullable: true, description: 'IFSC code for DEPOSIT/WITHDRAW', example: 'EXBK0001' },
        recipientEmail: { type: 'string', format: 'email', nullable: true, description: 'Email of the recipient for TRANSFER', example: 'jane.smith@example.com' },
        description: { type: 'string', nullable: true, description: 'Optional description for TRANSFER', example: 'Payment for lunch' },
    },
    required: ['amount', 'type', 'email'],
    description: 'Input for creating a new transaction. Required fields depend on the transaction type. `email` refers to the initiator. `recipientEmail` is needed for TRANSFER.'
};

const TransactionOutputSchema = {
    type: 'object',
    properties: {
        id: { type: 'integer', example: 101 },
        type: { type: 'string', enum: ['deposit', 'withdraw', 'transfer'], example: 'transfer' },
        amount: { type: 'number', format: 'float', description: 'Transaction amount', example: 25.00 },
        description: { type: 'string', nullable: true, example: 'Coffee payment' },
        timestamp: { type: 'string', format: 'date-time', description: 'Formatted timestamp', example: 'Oct 26, 2023, 10:30 AM' },
        bankName: { type: 'string', nullable: true, description: 'Bank name (uppercase)', example: 'MAIN BANK' },
        accountNumber: { type: 'string', nullable: true, description: 'Masked account number', example: '****5678' },
        senderName: { type: 'string', nullable: true, example: 'You' },
        recipientName: { type: 'string', nullable: true, example: 'Jane Smith' },
        status: { type: 'string', enum: Object.values(TransactionStatus), example: 'COMPLETED' },
    },
    required: ['id', 'type', 'amount', 'timestamp', 'status']
};

const TurnstileVerificationInputSchema = {
   type: 'object',
   properties: {
      token: { type: 'string', description: 'The Cloudflare Turnstile token from the frontend.', example: '0x4AAAAAA...'}
   },
   required: ['token']
};

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet App API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Next.js Wallet application, covering authentication, user management, wallet operations, and transactions.',
    },
    servers: [
      {
        url: '/api',
        description: 'Development server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication related endpoints (Login, Register, Session)' },
      { name: 'User', description: 'User management endpoints' },
      { name: 'Wallet', description: 'Wallet balance and transaction operations' },
      { name: 'Transaction', description: 'Transaction history retrieval' },
      { name: 'Verification', description: 'CAPTCHA and other verification endpoints' },
      { name: 'Meta', description: 'API meta endpoints (like Docs)' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
    components: {
      schemas: {
        ErrorResponse: ErrorResponseSchema,
        SuccessResponse: SuccessResponseSchema,
        UserRegistrationInput: UserRegistrationInputSchema,
        UserRegistrationOutput: UserRegistrationOutputSchema,
        CredentialsLoginInput: CredentialsLoginInputSchema,
        SessionUser: SessionUserSchema,
        Session: SessionSchema,
        BasicUserInfoOutput: BasicUserInfoOutputSchema,
        WalletBalanceOutput: WalletBalanceOutputSchema,
        TransactionInput: TransactionInputSchema,
        TransactionOutput: TransactionOutputSchema,
        TurnstileVerificationInput: TurnstileVerificationInputSchema,
      },
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'next-auth.session-token',
          description: 'Session cookie set automatically after login using NextAuth. Include credentials (cookies) in requests if required by the endpoint.',
        },
      },
    },
    paths: {
      '/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          description: 'Creates a new user account and an associated wallet.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserRegistrationInput' },
              },
            },
          },
          responses: {
            '201': {
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserRegistrationOutput' },
                },
              },
            },
            '400': {
              description: 'Invalid input data (validation errors)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
             '409': {
              description: 'Email already in use',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '500': {
              description: 'Internal server error',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
      '/auth/session': {
         get: {
           tags: ['Auth'],
           summary: 'Get current session',
           description: 'Retrieves the session information for the currently authenticated user. Requires the session cookie.',
           security: [{ cookieAuth: [] }],
           responses: {
             '200': {
               description: 'Session data retrieved successfully',
               content: {
                 'application/json': {
                   schema: { $ref: '#/components/schemas/Session' },
                 },
               },
             },
             '401': {
               description: 'Not authenticated',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse', example: { error: "Unauthorized" } } } },
             }
           }
         }
      },
      '/auth/callback/credentials': {
        post: {
          tags: ['Auth'],
          summary: 'Login with Credentials',
          description: 'Authenticates a user using email and password. Sets the session cookie upon success.',
          requestBody: {
            required: true,
            content: {
              'application/x-www-form-urlencoded': {
                 schema: { $ref: '#/components/schemas/CredentialsLoginInput' }
              },
              'application/json': {
                 schema: { $ref: '#/components/schemas/CredentialsLoginInput' }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful (usually redirects or returns session info depending on client)',
              headers: {
                'Set-Cookie': {
                  description: 'Contains the session cookie (e.g., next-auth.session-token)',
                  schema: { type: 'string' }
                }
              }
            },
            '401': {
              description: 'Authentication failed (Invalid credentials)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse', example: { error: 'CredentialsSignin' } } } }
            }
          }
        }
      },
      '/users': {
        get: {
          tags: ['User'],
          summary: 'Get list of other users',
          description: 'Retrieves a list of all registered users, excluding the currently authenticated user. Requires authentication.',
          security: [{ cookieAuth: [] }],
          responses: {
            '200': {
              description: 'List of users retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/BasicUserInfoOutput' }
                  },
                },
              },
            },
            '401': {
               description: 'Not authenticated',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse', example: { error: "Unauthorized" } } } },
            },
            '500': {
              description: 'Failed to fetch users',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
      '/wallet/balance': {
        get: {
          tags: ['Wallet'],
          summary: 'Get wallet balance for a user',
          description: 'Retrieves the current wallet balance for a user specified by email.',
          parameters: [
            {
              name: 'email',
              in: 'query',
              required: true,
              schema: { type: 'string', format: 'email' },
              description: 'The email address of the user whose balance is requested.',
              example: 'jane.smith@example.com'
            }
          ],
          responses: {
            '200': {
              description: 'Wallet balance retrieved successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/WalletBalanceOutput' },
                },
              },
            },
            '400': {
              description: 'Email query parameter is required',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '404': {
              description: 'User or wallet not found for the provided email',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '500': {
              description: 'Failed to fetch balance',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
      '/wallet/transaction': {
        post: {
          tags: ['Wallet'],
          summary: 'Create a new transaction',
          description: 'Handles DEPOSIT, WITHDRAW, and TRANSFER transactions. Updates wallet balances accordingly. Requires authentication for the user performing the action.',
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TransactionInput' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Transaction successful',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse', example: { message: "Transaction successful" } } } },
            },
             '400': {
               description: 'Invalid input (e.g., invalid amount, insufficient funds, missing recipient email for transfer, invalid type)',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
             },
            '401': {
               description: 'Not authenticated',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse', example: { error: "Unauthorized" } } } },
            },
            '404': {
              description: 'User or wallet not found (sender or recipient)',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '500': {
              description: 'Transaction failed (Internal server error)',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
      '/transactions': {
        get: {
          tags: ['Transaction'],
          summary: 'Get transaction history',
          description: 'Retrieves the formatted transaction history (deposits, withdrawals, transfers) for the authenticated user.',
          security: [{ cookieAuth: [] }],
          responses: {
            '200': {
              description: 'Transaction history retrieved successfully',
              content: {
                'application/json': {
                  schema: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TransactionOutput' }
                  },
                },
              },
            },
            '401': {
               description: 'Not authenticated',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '404': {
              description: 'User or wallet not found',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '500': {
              description: 'Internal Server Error',
               content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
      '/verify-turnstile': {
        post: {
          tags: ['Verification'],
          summary: 'Verify Cloudflare Turnstile token',
          description: 'Verifies a Cloudflare Turnstile (CAPTCHA) token provided by the client.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TurnstileVerificationInput' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Turnstile token verified successfully',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
            '400': {
              description: 'Turnstile token is required',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '401': {
              description: 'Invalid Turnstile token',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
            '500': {
              description: 'Internal server error during verification (e.g., missing secret key)',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
      },
      '/docs': {
        get: {
          tags: ['Meta'],
          summary: 'Get OpenAPI Specification',
          description: 'Returns the OpenAPI (Swagger) JSON definition for this API.',
          responses: {
            '200': {
              description: 'Successful retrieval of OpenAPI specification',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    description: 'OpenAPI 3.0 specification document.',
                  },
                },
              },
            },
          },
        },
      },
      '/test': {
        get: {
          tags: ['Health'],
          summary: 'Basic API Health Check',
          description: 'Returns a simple JSON object indicating the API route is working.',
          responses: {
            '200': {
              description: 'Successful API health check',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                    },
                    example: {
                      message: 'API route test successful!',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
      './app/api/**/*.ts',
      './lib/authOptions.ts',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;