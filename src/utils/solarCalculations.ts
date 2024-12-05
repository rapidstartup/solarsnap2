const PANEL_WIDTH = 1.6; // meters
const PANEL_HEIGHT = 1.0; // meters
const PANEL_SPACING = 0.5; // meters

export function calculatePanelLayout(
  polygonPoints: google.maps.LatLng[],
  desiredPanelCount: number,
  center: google.maps.LatLng
): google.maps.LatLng[][] {
  const panels: google.maps.LatLng[][] = [];
  
  // Calculate area and dimensions
  const bounds = new google.maps.LatLngBounds();
  polygonPoints.forEach(point => bounds.extend(point));
  
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  
  // Calculate rough dimensions in meters
  const width = google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(ne.lat(), sw.lng()),
    new google.maps.LatLng(ne.lat(), ne.lng())
  );
  
  const height = google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(ne.lat(), sw.lng()),
    new google.maps.LatLng(sw.lat(), sw.lng())
  );

  // Calculate grid size
  const cols = Math.floor(width / (PANEL_WIDTH + PANEL_SPACING));
  const rows = Math.ceil(desiredPanelCount / cols);

  // Create panel grid
  for (let row = 0; row < rows && panels.length < desiredPanelCount; row++) {
    for (let col = 0; col < cols && panels.length < desiredPanelCount; col++) {
      const panelCenter = google.maps.geometry.spherical.computeOffset(
        center,
        (row - rows/2) * (PANEL_HEIGHT + PANEL_SPACING),
        0
      );
      
      const panelCorners = [
        google.maps.geometry.spherical.computeOffset(panelCenter, PANEL_HEIGHT/2, 0),
        google.maps.geometry.spherical.computeOffset(panelCenter, PANEL_HEIGHT/2, 90),
        google.maps.geometry.spherical.computeOffset(panelCenter, -PANEL_HEIGHT/2, 180),
        google.maps.geometry.spherical.computeOffset(panelCenter, -PANEL_HEIGHT/2, 270)
      ];

      panels.push(panelCorners);
    }
  }

  return panels;
}

export function calculateMaxPanels(areaSqMeters: number): number {
  // Use 50% of available area for panels to account for spacing and access
  const usableArea = areaSqMeters * 0.5;
  const panelArea = (PANEL_WIDTH + PANEL_SPACING) * (PANEL_HEIGHT + PANEL_SPACING);
  return Math.floor(usableArea / panelArea);
}