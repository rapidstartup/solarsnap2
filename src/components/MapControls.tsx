import React from 'react';
import { Map, Sun } from 'lucide-react';

interface MapControlsProps {
  selectedLayer: string;
  showRoofOnly: boolean;
  isVacantLot: boolean;
  isPro?: boolean;
  onLayerChange: (layer: string) => void;
  onRoofOnlyChange: (show: boolean) => void;
  onVacantLotChange: (isVacant: boolean) => void;
}

export default function MapControls({
  selectedLayer,
  showRoofOnly,
  isVacantLot,
  isPro = false,
  onLayerChange,
  onRoofOnlyChange,
  onVacantLotChange
}: MapControlsProps) {
  return (
    <div className="p-4 border-b flex flex-wrap gap-4 items-center">
      <select
        value={selectedLayer}
        onChange={(e) => onLayerChange(e.target.value)}
        className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="rgb">Aerial Photo</option>
        <option value="annualFlux">Solar Potential Heatmap</option>
      </select>

      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={showRoofOnly}
          onChange={(e) => onRoofOnlyChange(e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <span className="ml-2 text-gray-700">Show Roof Only</span>
      </label>

      {isPro && (
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isVacantLot}
            onChange={(e) => onVacantLotChange(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="ml-2 text-gray-700">Vacant Lot Analysis</span>
        </label>
      )}
    </div>
  );
}