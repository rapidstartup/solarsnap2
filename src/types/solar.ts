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