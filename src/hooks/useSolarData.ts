import { useState } from 'react';
import { useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { getSolarData } from '../services/solarApi';
import { SolarReportData } from '../types/solar';
import { api } from "../../convex/_generated/api";

export function useSolarData() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const createSearch = useMutation(api.searches.createSearch);
  const createAnalysis = useMutation(api.solarAnalyses.createAnalysis);

  const analyzeSolarData = async (
    latitude: number,
    longitude: number,
    address: string
  ): Promise<SolarReportData> => {
    setIsLoading(true);
    try {
      const solarData = await getSolarData(latitude, longitude);

      // Save search and analysis to Convex if user is authenticated
      if (user?.id) {
        const searchId = await createSearch({
          userId: user.id,
          address,
          latitude,
          longitude,
          createdAt: Date.now(),
          isClaimed: false
        });

        if (searchId) {
          await createAnalysis({
            searchId,
            ...solarData,
            rawData: solarData.rawData,
            createdAt: Date.now()
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