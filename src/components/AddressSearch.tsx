import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { MapPin } from 'lucide-react';

interface Props {
  onAddressSelect: (address: string, latitude: number, longitude: number) => void;
}

export default function AddressSearch({ onAddressSelect }: Props) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: { 
      componentRestrictions: { 
        country: ['us', 'au', 'gb', 'nl', 'dk'] 
      } 
    },
    debounce: 300,
  });

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      onAddressSelect(address, lat, lng);
    } catch (error) {
      console.error('Error getting coordinates:', error);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!ready}
          placeholder="Enter your address..."
          className="w-full pl-10 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      {status === 'OK' && (
        <ul className="absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg border border-gray-200">
          {data.map((suggestion) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion.description)}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-left"
            >
              {suggestion.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}