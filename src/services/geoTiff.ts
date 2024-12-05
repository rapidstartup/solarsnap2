import * as GeoTIFF from 'geotiff';
import * as geokeysToProj4 from 'geotiff-geokeys-to-proj4';
import proj4 from 'proj4';
import { GOOGLE_MAPS_API_KEY } from '../config/constants';

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

export async function downloadGeoTIFF(url: string): Promise<GeoTiff> {
  console.log(`Downloading data layer: ${url}`);

  const solarUrl = url.includes('solar.googleapis.com') ? url + `&key=${GOOGLE_MAPS_API_KEY}` : url;
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