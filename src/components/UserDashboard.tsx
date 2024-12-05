import { useQuery } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { Search as SearchType, SolarAnalysis } from '../types/convex';
import { Search, Sun, MapPin } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface SearchWithAnalysis extends SearchType {
  analysis?: SolarAnalysis;
  _id: Id<"searches">;
}

export default function UserDashboard() {
  const { user } = useUser();
  const searches = useQuery(api.searches.getUserSearches, { 
    userId: user?.id ?? "" 
  });

  // Get first 10 analyses (or however many you want to show)
  const analysis0 = useQuery(api.solarAnalyses.getAnalysisBySearchId, { 
    searchId: searches?.[0]?._id ?? "" as Id<"searches"> 
  });
  const analysis1 = useQuery(api.solarAnalyses.getAnalysisBySearchId, { 
    searchId: searches?.[1]?._id ?? "" as Id<"searches"> 
  });
  const analysis2 = useQuery(api.solarAnalyses.getAnalysisBySearchId, { 
    searchId: searches?.[2]?._id ?? "" as Id<"searches"> 
  });

  // Combine analyses into array and filter out null values
  const analyses = [analysis0, analysis1, analysis2]
    .map(analysis => analysis || undefined);

  const searchesWithAnalyses: SearchWithAnalysis[] = searches?.map((search, index) => ({
    ...search,
    analysis: analyses[index]
  })) || [];

  if (!searches) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Solar Analysis History</h1>
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Search className="h-4 w-4 mr-2" />
          New Analysis
        </button>
      </div>

      {searchesWithAnalyses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Sun className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No analyses yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by analyzing your first property.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchesWithAnalyses.map((search) => (
            <div key={search._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{search.address}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {search.analysis && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Roof Size</p>
                    <p className="font-medium">{search.analysis.roofSize}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Solar Potential</p>
                    <p className="font-medium">{search.analysis.solarPotential}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Annual Production</p>
                    <p className="font-medium">{search.analysis.annualProduction}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cost Savings</p>
                    <p className="font-medium">{search.analysis.costSavings}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}