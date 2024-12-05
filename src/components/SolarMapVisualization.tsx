import React, { useEffect, useState } from 'react';
import { getDataLayerUrls, downloadGeoTIFF } from '../services/solarApi';
import { renderPalette, renderRGB } from '../services/visualize';
import { ironPalette, sunlightPalette } from '../utils/colors';

interface Props {
  latitude: number;
  longitude: number;
  panelCount: number;
  onPanelCountChange: (count: number) => void;
  maxPanels: number;
}

export default function SolarMapVisualization({ 
  latitude, 
  longitude, 
  panelCount,
  onPanelCountChange,
  maxPanels 
}: Props) {
  const [selectedLayer, setSelectedLayer] = useState<'rgb' | 'annualFlux'>('rgb');
  const [showRoofOnly, setShowRoofOnly] = useState(true);
  const [mapData, setMapData] = useState<{
    mask?: any;
    rgb?: any;
    annualFlux?: any;
  }>({});

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const layerUrls = await getDataLayerUrls({
          latitude,
          longitude
        }, 50);

        const [mask, rgb, annualFlux] = await Promise.all([
          downloadGeoTIFF(layerUrls.maskUrl),
          downloadGeoTIFF(layerUrls.rgbUrl),
          downloadGeoTIFF(layerUrls.annualFluxUrl)
        ]);

        setMapData({ mask, rgb, annualFlux });
      } catch (error) {
        console.error('Error loading map data:', error);
      }
    };

    loadMapData();
  }, [latitude, longitude]);

  const renderMapLayer = () => {
    if (!mapData.rgb || !mapData.mask || !mapData.annualFlux) {
      return null;
    }

    switch (selectedLayer) {
      case 'rgb':
        return renderRGB(mapData.rgb, showRoofOnly ? mapData.mask : undefined);
      case 'annualFlux':
        return renderPalette({
          data: mapData.annualFlux,
          mask: showRoofOnly ? mapData.mask : undefined,
          colors: ironPalette,
          min: 0,
          max: 1800
        });
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value as 'rgb' | 'annualFlux')}
            className="rounded-lg border border-gray-300 px-4 py-2"
          >
            <option value="rgb">Aerial Photo</option>
            <option value="annualFlux">Annual Solar Potential</option>
          </select>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showRoofOnly}
              onChange={(e) => setShowRoofOnly(e.target.checked)}
              className="rounded"
            />
            <span>Show Roof Only</span>
          </label>
        </div>
      </div>

      <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
        {Object.keys(mapData).length > 0 && (
          <img
            src={renderMapLayer()?.toDataURL()}
            alt="Solar Analysis"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Number of Solar Panels ({panelCount} of {maxPanels})
        </label>
        <input
          type="range"
          min={1}
          max={maxPanels}
          value={panelCount}
          onChange={(e) => onPanelCountChange(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}