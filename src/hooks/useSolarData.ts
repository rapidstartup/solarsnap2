import { useState } from 'react';
import { useMutation } from '../convex/_generated/react';
import { useUser } from '@clerk/clerk-react';
import { getSolarData } from '../services/solarApi';
import { SolarReportData } from '../types/solar';

export function useSolarData() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const createSearch = useMutation('searches:createSearch');
  const createAnalysis = useMutation('solarAnalyses:createAnalysis');

  const analyzeSolarData = async (
    latitude: number,
    longitude: number,
    address: string
  ): Promise<SolarReportData> => {
    setIsLoading(true);
    try {
      const solarData = await getSolarData(latitude, longitude, address);

      // Save search and analysis to Convex if user is authenticated
      if (user?.id) {
        const searchId = await createSearch({
          userId: user.id,
          address,
          latitude,
          longitude,
        });

        if (searchId) {
          await createAnalysis({
            searchId,
            ...solarData,
            rawData: solarData.rawData,
          });
        }
      }

      return solarData;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeSolarData,
    isLoading
  };
}