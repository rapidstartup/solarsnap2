// Add GeoTiff interface to the existing types
export interface GeoTiff {
  width: number;
  height: number;
  rasters: Array<number>[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface SolarReportData {
  latitude: number;
  longitude: number;
  roofSize: string;
  solarPotential: string;
  annualProduction: string;
  costSavings: string;
  carbonOffset: string;
  installationCost: string;
  rawData: BuildingInsightsResponse;
}

export interface BuildingInsightsResponse {
  name?: string;
  solarPotential?: {
    wholeRoofStats?: {
      areaMeters2?: number;
    };
    maxSunshineHoursPerYear: number;
    solarPanelConfigs?: Array<{
      yearlyEnergyDcKwh?: number;
    }>;
    carbonOffsetFactorKgPerMwh: number;
    financialAnalyses?: Array<{
      cashPurchaseSavings?: {
        savings?: {
          savingsYear1?: {
            units?: string;
          };
        };
        upfrontCost?: {
          units?: string;
        };
      };
    }>;
  };
}

export interface DataLayersResponse {
  imageryDate: string;
  rgbUrl: string;
  maskUrl: string;
  annualFluxUrl: string;
  dsmUrl: string;
  dsmUrl90thPercentile: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}