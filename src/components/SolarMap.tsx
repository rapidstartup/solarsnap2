import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { GOOGLE_MAPS_API_KEY } from '../config/constants';
import { downloadGeoTIFF, getDataLayerUrls } from '../services/solarApi';
import { renderRGB, renderPalette } from '../services/visualize';
import { ironPalette } from '../utils/colors';
import { calculatePanelLayout } from '../utils/solarCalculations';

interface SolarMapProps {
  center: {
    lat: number;
    lng: number;
  };
  isPro?: boolean;
  selectedLayer: 'rgb' | 'annualFlux';
  showRoofOnly: boolean;
  isVacantLot?: boolean;
  panelCount?: number;
  onPolygonComplete?: (polygon: google.maps.Polygon) => void;
  onAreaCalculated?: (areaSqMeters: number) => void;
}

export default function SolarMap({
  center,
  isPro = false,
  selectedLayer,
  showRoofOnly,
  isVacantLot = false,
  panelCount = 0,
  onPolygonComplete,
  onAreaCalculated
}: SolarMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [dataLayers, setDataLayers] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const overlayRef = useRef<google.maps.GroundOverlay | null>(null);
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const panelsRef = useRef<google.maps.Polygon[]>([]);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  useEffect(() => {
    if (!mapRef.current || !center) return;

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["drawing", "places", "geometry"]
        });

        const { Map } = await loader.importLibrary("maps");
        const { DrawingManager } = await loader.importLibrary("drawing");

        const mapInstance = new Map(mapRef.current, {
          center,
          zoom: 19,
          mapTypeId: 'satellite',
          tilt: 0,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true
        });

        setMap(mapInstance);

        if (isPro && isVacantLot) {
          const drawingManagerInstance = new DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [google.maps.drawing.OverlayType.POLYGON]
            },
            polygonOptions: {
              fillColor: "#FF0000",
              fillOpacity: 0.35,
              strokeWeight: 2,
              clickable: true,
              editable: true,
              zIndex: 1
            }
          });

          drawingManagerInstance.setMap(mapInstance);
          setDrawingManager(drawingManagerInstance);

          if (onPolygonComplete) {
            google.maps.event.addListener(drawingManagerInstance, 'polygoncomplete', (polygon: google.maps.Polygon) => {
              polygonsRef.current.forEach(p => p.setMap(null));
              polygonsRef.current = [polygon];

              const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
              if (onAreaCalculated) {
                onAreaCalculated(area);
              }

              google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
                const newArea = google.maps.geometry.spherical.computeArea(polygon.getPath());
                if (onAreaCalculated) {
                  onAreaCalculated(newArea);
                }
              });

              google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
                const newArea = google.maps.geometry.spherical.computeArea(polygon.getPath());
                if (onAreaCalculated) {
                  onAreaCalculated(newArea);
                }
              });
            });
          }
        }

        // Load data layers
        try {
          const layerUrls = await getDataLayerUrls({
            latitude: center.lat,
            longitude: center.lng
          }, 50);

          const [mask, rgb, annualFlux] = await Promise.all([
            downloadGeoTIFF(layerUrls.maskUrl),
            downloadGeoTIFF(layerUrls.rgbUrl),
            downloadGeoTIFF(layerUrls.annualFluxUrl)
          ]);

          setDataLayers({ mask, rgb, annualFlux });
          setError(null);
        } catch (err) {
          console.error('Error loading data layers:', err);
          setError('Failed to load solar data layers');
        }
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to initialize map');
      }
    };

    initMap();

    return () => {
      if (drawingManager) {
        drawingManager.setMap(null);
      }
      if (overlayRef.current) {
        overlayRef.current.setMap(null);
      }
      polygonsRef.current.forEach(polygon => polygon.setMap(null));
      panelsRef.current.forEach(panel => panel.setMap(null));
    };
  }, [center, isPro, isVacantLot]);

  // Update overlay when layer selection or data changes
  useEffect(() => {
    if (!map || !dataLayers) return;

    if (overlayRef.current) {
      overlayRef.current.setMap(null);
    }

    try {
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(dataLayers[selectedLayer].bounds.south, dataLayers[selectedLayer].bounds.west),
        new google.maps.LatLng(dataLayers[selectedLayer].bounds.north, dataLayers[selectedLayer].bounds.east)
      );

      let imageData;
      if (selectedLayer === 'rgb') {
        imageData = renderRGB(dataLayers.rgb, showRoofOnly ? dataLayers.mask : undefined);
      } else {
        imageData = renderPalette({
          data: dataLayers.annualFlux,
          mask: showRoofOnly ? dataLayers.mask : undefined,
          colors: ironPalette,
          min: 0,
          max: 1800
        });
      }

      if (imageData) {
        overlayRef.current = new google.maps.GroundOverlay(imageData.toDataURL(), bounds, {
          map,
          opacity: 0.8
        });
      }
    } catch (err) {
      console.error('Error updating overlay:', err);
    }
  }, [map, dataLayers, selectedLayer, showRoofOnly]);

  // Update panel visualization
  useEffect(() => {
    if (!map || !panelCount) return;

    panelsRef.current.forEach(panel => panel.setMap(null));
    panelsRef.current = [];

    if (panelCount > 0 && !isVacantLot) {
      const panels = calculatePanelLayout(
        center,
        panelCount,
        map.getBounds()?.getCenter() || center
      );

      panels.forEach(panelCoords => {
        const panel = new google.maps.Polygon({
          paths: panelCoords,
          fillColor: '#4285F4',
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 1,
          map
        });
        panelsRef.current.push(panel);
      });
    }
  }, [map, panelCount, isVacantLot, center]);

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 text-center rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[600px] rounded-lg overflow-hidden"
      style={{ minHeight: '600px' }}
    />
  );
}