import React from 'react';
import { Sun } from 'lucide-react';

interface PanelControlsProps {
  maxPanels: number;
  currentPanels: number;
  onPanelCountChange: (count: number) => void;
  estimatedOutput: number;
}

export default function PanelControls({
  maxPanels,
  currentPanels,
  onPanelCountChange,
  estimatedOutput
}: PanelControlsProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Solar Array Configuration</h3>
        <div className="flex items-center text-blue-600">
          <Sun className="w-5 h-5 mr-2" />
          <span>{estimatedOutput.toFixed(1)} kWh/year</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Panels ({currentPanels} of {maxPanels})
          </label>
          <input
            type="range"
            min="0"
            max={maxPanels}
            value={currentPanels}
            onChange={(e) => onPanelCountChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="block font-medium">Panel Capacity</span>
            <span>400W</span>
          </div>
          <div>
            <span className="block font-medium">Array Size</span>
            <span>{(currentPanels * 0.4).toFixed(1)} kW</span>
          </div>
        </div>
      </div>
    </div>
  );
}