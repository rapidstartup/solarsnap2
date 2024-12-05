import React, { useState } from 'react';
import { Sun, MapPin, Calendar } from 'lucide-react';
import AddressSearch from '../components/AddressSearch';
import SolarReport from '../components/SolarReport';
import BookingModal from '../components/BookingModal';
import { useSolarData } from '../hooks/useSolarData';
import { SolarReportData } from '../types/solar';

function HomeVersion() {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [reportData, setReportData] = useState<SolarReportData | null>(null);
  const { analyzeSolarData, isLoading } = useSolarData();
  
  const handleAddressSelect = async (address: string, latitude: number, longitude: number) => {
    setSelectedAddress(address);
    setShowReport(true);

    try {
      const data = await analyzeSolarData(latitude, longitude, address);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching solar data:', error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!showReport ? (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Discover Your Solar Potential
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Get an instant analysis of your roof's solar capabilities
          </p>
          <div className="max-w-xl mx-auto">
            <AddressSearch onAddressSelect={handleAddressSelect} />
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="h-6 w-6" />}
              title="Precise Analysis"
              description="Advanced satellite imagery for accurate roof measurements"
            />
            <FeatureCard
              icon={<Sun className="h-6 w-6" />}
              title="Solar Potential"
              description="Detailed solar energy production estimates"
            />
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Easy Booking"
              description="Schedule a consultation with solar experts"
            />
          </div>
        </div>
      ) : (
        <>
          <SolarReport 
            address={selectedAddress}
            onBookConsultation={() => setShowBooking(true)}
            data={reportData!}
            isLoading={isLoading}
          />
          {showBooking && (
            <BookingModal 
              onClose={() => setShowBooking(false)}
              address={selectedAddress}
            />
          )}
        </>
      )}
    </main>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default HomeVersion;