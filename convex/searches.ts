import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const createSearch = mutation({
  args: {
    userId: v.optional(v.string()),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('searches', {
      userId: args.userId,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      createdAt: Date.now(),
      isClaimed: false,
    });
  },
});

export const getUserSearches = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('searches')
      .withIndex('by_user_id', (q) => q.eq('userId', args.userId))
      .collect();
  },
});