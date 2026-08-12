import { vi } from "vitest";

// A minimal in-memory-ish mock of the Prisma client surface our routes
// actually call. Each test file overrides the specific methods it needs
// via `vi.mocked(prisma.user.findFirst).mockResolvedValue(...)`.
export function createMockPrisma() {
  return {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    track: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    like: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    comment: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $disconnect: vi.fn(),
  };
}
