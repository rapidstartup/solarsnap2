import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';

export const createAnalysis = mutation({
  args: {
    searchId: v.id('searches'),
    roofSize: v.optional(v.string()),
    solarPotential: v.optional(v.string()),
    annualProduction: v.optional(v.string()),
    costSavings: v.optional(v.string()),
    carbonOffset: v.optional(v.string()),
    installationCost: v.optional(v.string()),
    rawData: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('solarAnalyses', {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getAnalysisBySearchId = query({
  args: { searchId: v.id('searches') },
  handler: async (ctx, args) => {
    return ctx.db
      .query('solarAnalyses')
      .withIndex('by_search_id', (q) => q.eq('searchId', args.searchId))
      .first();
  },
});