import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  profiles: defineTable({
    userId: v.string(),
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_user_id', ['userId']),

  searches: defineTable({
    userId: v.optional(v.string()),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    createdAt: v.number(),
    isClaimed: v.boolean(),
  }).index('by_user_id', ['userId']),

  solarAnalyses: defineTable({
    searchId: v.id('searches'),
    roofSize: v.optional(v.string()),
    solarPotential: v.optional(v.string()),
    annualProduction: v.optional(v.string()),
    costSavings: v.optional(v.string()),
    carbonOffset: v.optional(v.string()),
    installationCost: v.optional(v.string()),
    rawData: v.any(),
    createdAt: v.number(),
  }).index('by_search_id', ['searchId']),
});