import { getAuth } from "@clerk/nextjs/server";
import { TRPCError, initTRPC } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import db from "@/lib/db";
import { checkAndConsumeCredits, CreditAction } from "@/lib/credit-system";

interface CreateContextOptions {
  headers: Headers;
  req: NextRequest;
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  const { req } = opts;
  const auth = getAuth(req);

  return {
    auth,
    db,
    ...opts,
  };
};

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      auth: ctx.auth,
      db: ctx.db,
    },
  });
});

// Middleware factory for credit-protected procedures
const enforceCreditsAvailable = (action: CreditAction) => t.middleware(async ({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Check if user has enough credits (without consuming them yet)
  const creditCheck = await checkAndConsumeCredits(ctx.auth.userId, action, false);
  
  if (!creditCheck.success) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: creditCheck.message || "Insufficient credits"
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
      db: ctx.db,
      creditAction: action, // Pass the action to the procedure
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// Credit-protected procedures for different actions
export const appGenerationProcedure = t.procedure.use(enforceUserIsAuthed).use(enforceCreditsAvailable(CreditAction.APP_GENERATION));
export const sandboxProcedure = t.procedure.use(enforceUserIsAuthed).use(enforceCreditsAvailable(CreditAction.SANDBOX_PREVIEW));
export const codeExecutionProcedure = t.procedure.use(enforceUserIsAuthed).use(enforceCreditsAvailable(CreditAction.CODE_EXECUTION));
