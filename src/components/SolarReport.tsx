import React, { useState } from 'react';
import { Sun, Calendar, Download } from 'lucide-react';
import { SolarReportData } from '../types/solar';
import SolarMap from './SolarMap';
import PanelControls from './PanelControls';
import { calculateMaxPanels } from '../utils/solarCalculations';

interface Props {
  address: string;
  onBookConsultation: () => void;
  data: SolarReportData | null;
  isLoading?: boolean;
  isPro?: boolean;
}

export default function SolarReport({ 
  address, 
  onBookConsultation, 
  data, 
  isLoading = false,
  isPro = false 
}: Props) {
  const [selectedLayer, setSelectedLayer] = useState<'rgb' | 'annualFlux'>('rgb');
  const [showRoofOnly, setShowRoofOnly] = useState(true);
  const [isVacantLot, setIsVacantLot] = useState(false);
  const [lotArea, setLotArea] = useState(0);
  const [maxPanels, setMaxPanels] = useState(0);
  const [currentPanels, setCurrentPanels] = useState(0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No solar analysis data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-4 items-center">
          <select
            value={selectedLayer}
            onChange={(e) => setSelectedLayer(e.target.value as 'rgb' | 'annualFlux')}
            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rgb">Aerial Photo</option>
            <option value="annualFlux">Solar Potential Heatmap</option>
          </select>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showRoofOnly}
              onChange={(e) => setShowRoofOnly(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Show Roof Only</span>
          </label>

          {isPro && (
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isVacantLot}
                onChange={(e) => setIsVacantLot(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Vacant Lot Analysis</span>
            </label>
          )}
        </div>
        
        <SolarMap
          center={{ lat: data.latitude, lng: data.longitude }}
          isPro={isPro}
          selectedLayer={selectedLayer}
          showRoofOnly={showRoofOnly}
          isVacantLot={isVacantLot}
          panelCount={currentPanels}
          onPolygonComplete={isVacantLot ? undefined : () => {}}
          onAreaCalculated={setLotArea}
        />

        {maxPanels > 0 && (
          <div className="p-4 border-t">
            <PanelControls
              maxPanels={maxPanels}
              currentPanels={currentPanels}
              onPanelCountChange={setCurrentPanels}
              estimatedOutput={currentPanels * 0.4 * 4 * 0.8 * 365}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">
            {isVacantLot ? 'Lot Analysis' : 'Roof Analysis'}
          </h3>
          <div className="space-y-2">
            {isVacantLot ? (
              <>
                <div className="flex justify-between">
                  <span>Lot Size</span>
                  <span className="font-medium">{Math.round(lotArea).toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Usable Area</span>
                  <span className="font-medium">{Math.round(lotArea * 0.5).toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum Panels</span>
                  <span className="font-medium">{maxPanels.toLocaleString()} panels</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>Roof Size</span>
                  <span className="font-medium">{data.roofSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Solar Potential</span>
                  <span className="font-medium">{data.solarPotential}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Panel Count</span>
                  <span className="font-medium">{currentPanels} panels</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Financial & Environmental Impact</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Estimated Annual Output</span>
              <span className="font-medium">{Math.round(currentPanels * 0.4 * 4 * 0.8 * 365).toLocaleString()} kWh</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Cost Savings</span>
              <span className="font-medium">${Math.round(currentPanels * 0.4 * 4 * 0.8 * 365 * 0.12).toLocaleString()}/year</span>
            </div>
            <div className="flex justify-between">
              <span>Carbon Offset</span>
              <span className="font-medium">{Math.round(currentPanels * 0.4 * 4 * 0.8 * 365 * 0.0007).toLocaleString()} tons/year</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <button
          onClick={onBookConsultation}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Book Consultation
        </button>

        <button 
          className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Report
        </button>
      </div>
    </div>
  );
}