import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const createProfile = mutation({
  args: {
    userId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .first();

    if (profile) return profile._id;

    return ctx.db.insert('profiles', {
      userId: args.userId,
      email: args.email,
      fullName: args.fullName,
      isAdmin: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});