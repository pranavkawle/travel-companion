/**
 * Mock Prisma Client
 * 
 * Provides mock implementations of Prisma models for testing.
 */

export const createMockPrismaUser = (overrides = {}) => ({
  id: 'user-123',
  auth0Sub: 'auth0|test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  languages: '["English","Spanish"]',
  accountStatus: 'ACTIVE',
  mobileVerified: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  ...overrides,
});

export const createMockPrismaFlight = (overrides = {}) => ({
  id: 'flight-123',
  userId: 'user-123',
  sourceAirport: 'SYD',
  destinationAirport: 'MEL',
  travelDate: new Date('2025-12-01'),
  flightNumber: 'QF401',
  dataSource: 'MANUAL',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockPrismaConversation = (overrides = {}) => ({
  id: 'conversation-123',
  participant1Id: 'user-123',
  participant2Id: 'user-456',
  flightId: 'flight-123',
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockPrismaMessage = (overrides = {}) => ({
  id: 'message-123',
  conversationId: 'conversation-123',
  senderId: 'user-123',
  recipientId: 'user-456',
  content: 'Hello, would you like to meet at the airport?',
  sentAt: new Date(),
  readAt: null,
  ...overrides,
});

/**
 * Mock Prisma Client with all models
 */
export const createMockPrismaClient = () => ({
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  flight: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  conversation: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  message: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  rating: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  report: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  block: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  administrator: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  $disconnect: jest.fn(),
});

/**
 * Usage in tests:
 * 
 * jest.mock('@/lib/prisma', () => ({
 *   prisma: createMockPrismaClient(),
 * }));
 */
