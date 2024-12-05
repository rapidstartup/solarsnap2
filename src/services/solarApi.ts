import { GOOGLE_MAPS_API_KEY } from '../config/constants';
import { useMutation } from '../convex/_generated/react';
import { useUser } from '@clerk/clerk-react';
import {
  SolarReportData,
  BuildingInsightsResponse,
  DataLayersResponse,
  LatLng,
  GeoTiff
} from '../types/solar';
import * as GeoTIFF from 'geotiff';
import * as geokeysToProj4 from 'geotiff-geokeys-to-proj4';
import proj4 from 'proj4';

export async function findClosestBuilding(
  location: google.maps.LatLng,
): Promise<BuildingInsightsResponse> {
  const args = {
    'location.latitude': location.lat().toFixed(5),
    'location.longitude': location.lng().toFixed(5),
    'key': GOOGLE_MAPS_API_KEY,
    'requiredQuality': 'HIGH'
  };
  
  const params = new URLSearchParams(args);
  const response = await fetch(`https://solar.googleapis.com/v1/buildingInsights:findClosest?${params}`);
  const content = await response.json();
  
  if (!response.ok) {
    console.error('findClosestBuilding error:', content);
    throw content;
  }
  
  return content;
}

export async function getDataLayerUrls(
  location: LatLng,
  radiusMeters: number
): Promise<DataLayersResponse> {
  const args = {
    'location.latitude': location.latitude.toFixed(5),
    'location.longitude': location.longitude.toFixed(5),
    'radius_meters': radiusMeters.toString(),
    'required_quality': 'LOW',
    'key': GOOGLE_MAPS_API_KEY
  };

  const params = new URLSearchParams(args);
  const response = await fetch(`https://solar.googleapis.com/v1/dataLayers:get?${params}`);
  const content = await response.json();
  
  if (!response.ok) {
    console.error('getDataLayerUrls error:', content);
    throw content;
  }
  
  return content;
}

export async function downloadGeoTIFF(url: string): Promise<GeoTiff> {
  console.log(`Downloading data layer: ${url}`);

  const solarUrl = url.includes('solar.googleapis.com') ? `${url}&key=${GOOGLE_MAPS_API_KEY}` : url;
  const response = await fetch(solarUrl);
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`downloadGeoTIFF failed: ${url}`, error);
    throw error;
  }

  const arrayBuffer = await response.arrayBuffer();
  const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
  const image = await tiff.getImage();
  const rasters = await image.readRasters();

  const geoKeys = image.getGeoKeys();
  const projObj = geokeysToProj4.toProj4(geoKeys);
  const projection = proj4(projObj.proj4, 'WGS84');
  const box = image.getBoundingBox();
  
  const sw = projection.forward({
    x: box[0] * projObj.coordinatesConversionParameters.x,
    y: box[1] * projObj.coordinatesConversionParameters.y,
  });
  
  const ne = projection.forward({
    x: box[2] * projObj.coordinatesConversionParameters.x,
    y: box[3] * projObj.coordinatesConversionParameters.y,
  });

  return {
    width: rasters.width,
    height: rasters.height,
    rasters: [...Array(rasters.length).keys()].map((i) =>
      Array.from(rasters[i] as GeoTIFF.TypedArray)
    ),
    bounds: {
      north: ne.y,
      south: sw.y,
      east: ne.x,
      west: sw.x,
    },
  };
}

export async function getSolarData(
  latitude: number,
  longitude: number,
  address: string
): Promise<SolarReportData> {
  try {
    const location = new google.maps.LatLng(latitude, longitude);
    const buildingData = await findClosestBuilding(location);

    if (!buildingData.solarPotential) {
      throw new Error('No solar potential data available for this location');
    }

    const {
      wholeRoofStats,
      maxSunshineHoursPerYear,
      solarPanelConfigs,
      carbonOffsetFactorKgPerMwh,
      financialAnalyses
    } = buildingData.solarPotential;

    const safeNumber = (value: string | undefined) => Number(value || '0');
    const financialAnalysis = financialAnalyses?.[financialAnalyses.length - 1];
    const savings = financialAnalysis?.cashPurchaseSavings?.savings;
    const upfrontCost = financialAnalysis?.cashPurchaseSavings?.upfrontCost;

    const roofSizeSqFt = Math.round((wholeRoofStats?.areaMeters2 || 0) * 10.764);
    const solarPotentialPercent = Math.round((maxSunshineHoursPerYear / 8760) * 100);
    const yearlyEnergy = solarPanelConfigs?.[0]?.yearlyEnergyDcKwh || 0;
    const yearlySavings = safeNumber(savings?.savingsYear1?.units);
    const carbonOffsetTons = Math.round((carbonOffsetFactorKgPerMwh * yearlyEnergy) / 1000);
    const installationCostValue = safeNumber(upfrontCost?.units);

    const solarData = {
      latitude,
      longitude,
      roofSize: `${roofSizeSqFt.toLocaleString()} sq ft`,
      solarPotential: `${solarPotentialPercent}%`,
      annualProduction: `${Math.round(yearlyEnergy).toLocaleString()} kWh`,
      costSavings: `$${Math.round(yearlySavings).toLocaleString()}/year`,
      carbonOffset: `${carbonOffsetTons.toLocaleString()} tons/year`,
      installationCost: `$${Math.round(installationCostValue).toLocaleString()}`,
      rawData: buildingData
    };

    return solarData;
  } catch (error) {
    console.error('Error fetching solar data:', error);
    throw error;
  }