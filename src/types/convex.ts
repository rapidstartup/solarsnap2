import { Doc, Id } from '../../convex/_generated/dataModel';

export interface Profile extends Doc {
  userId: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Search extends Doc {
  userId?: string;
  address: string;
  latitude: number;
  longitude: number;
  createdAt: number;
  isClaimed: boolean;
}

export interface SolarAnalysis extends Doc {
  searchId: Id<'searches'>;
  roofSize?: string;
  solarPotential?: string;
  annualProduction?: string;
  costSavings?: string;
  carbonOffset?: string;
  installationCost?: string;
  rawData?: any;
  createdAt: number;
}