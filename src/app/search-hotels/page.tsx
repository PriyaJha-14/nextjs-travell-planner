"use client";

import { SetStateAction, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Listbox, ListboxItem } from "@heroui/react";
import { Calendar } from "@heroui/react";
import { DateValue, parseDate, today, getLocalTimeZone } from "@internationalized/date";

// ✅ Updated cities array with Agoda-popular destinations
const cities = [
  // Major Asian destinations (Agoda's stronghold)
  "Bangkok", "Singapore", "Tokyo", "Seoul", "Kuala Lumpur", 
  "Manila", "Ho Chi Minh City", "Phuket", "Bali", "Jakarta",
  "Hong Kong", "Taipei", "Osaka", "Kyoto", "Macau",
  
  // Popular international cities
  "Dubai", "London", "Paris", "New York", "Los Angeles",
  "Sydney", "Melbourne", "Amsterdam", "Barcelona", "Rome",
  "Berlin", "Vienna", "Prague", "Istanbul", "Cairo",
  
  // Indian cities
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Goa",
  "Kochi", "Chandigarh", "Indore", "Nagpur", "Lucknow",
  
  // US cities
  "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", 
  "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
  "Fort Worth", "Columbus", "Charlotte", "San Francisco", "Indianapolis",
  "Seattle", "Denver", "Washington", "Boston", "El Paso",
  "Nashville", "Detroit", "Oklahoma City", "Portland", "Las Vegas",
  "Memphis", "Louisville", "Baltimore", "Milwaukee", "Albuquerque"
];

export default function SearchHotels() {
  const [location, setLocation] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [checkInDate, setCheckInDate] = useState<DateValue | null>(today(getLocalTimeZone()));
  const [checkOutDate, setCheckOutDate] = useState<DateValue | null>(today(getLocalTimeZone()).add({ days: 1 }));
  const [guests, setGuests] = useState('1');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // ✅ Remove duplicates from cities
  const uniqueCities = [...new Set(cities)];

  const handleSearch = async () => {
    // ✅ Clean the city name
    let searchLocation = selectedCity || location;
    
    // Remove any suffix like "-0", "-1", etc.
    searchLocation = searchLocation.replace(/-\d+$/, '');
    
    if (!searchLocation.trim()) {
      alert('Please enter a destination to search on Agoda');
      return;
    }

    setLoading(true);
    
    try {
      // Trigger hotel scraping (now Agoda-based)
      const response = await fetch(`/api/hotels/scrape?location=${encodeURIComponent(searchLocation)}`);
      const data = await response.json();
      
      console.log('Agoda hotel search response:', data);
      
      // Navigate to hotels page with cleaned location
      router.push(`/hotels?location=${encodeURIComponent(searchLocation)}`);
      
    } catch (error) {
      console.error('Agoda hotel search failed:', error);
      // Still navigate to hotels page to show sample data
      router.push(`/hotels?location=${encodeURIComponent(searchLocation)}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCities = uniqueCities.filter(city =>
    city.toLowerCase().includes(location.toLowerCase())
  ).slice(0, 10); // Show only first 10 matches

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Agoda Branding */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <span className="bg-red-600 text-white text-lg px-4 py-2 rounded-lg font-bold">
              AGODA
            </span>
            <span className="text-white text-lg">Powered</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-red-200">
            Discover amazing hotels worldwide with Agoda's best price guarantee
          </p>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <span className="text-green-400 text-sm font-medium flex items-center">
              ✓ Best Price Guarantee
            </span>
            <span className="text-blue-400 text-sm font-medium flex items-center">
              ✓ Free Cancellation
            </span>
            <span className="text-yellow-400 text-sm font-medium flex items-center">
              ✓ Instant Confirmation
            </span>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Location Input with Dropdown */}
              <div className="relative">
                <label className="block text-white text-sm font-semibold mb-2">
                  🌍 Where are you going?
                </label>
                <Input
                  placeholder="Enter city or destination"
                  value={selectedCity || location}
                  onValueChange={(value: SetStateAction<string>) => {
                    setLocation(value);
                    setSelectedCity('');
                  }}
                  className="bg-white/20"
                  classNames={{
                    input: "text-white placeholder:text-white/60",
                    inputWrapper: "bg-white/20 border-white/30 hover:border-red-400"
                  }}
                />
                
                {/* ✅ Fixed dropdown for cities */}
                {location && !selectedCity && filteredCities.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1">
                    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                      <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-md rounded-small"></div>
                      <Listbox
                        aria-label="Cities"
                        onAction={(key) => {
                          setSelectedCity(key as string);
                          setLocation('');
                        }}
                        className="relative z-10"
                      >
                        {/* ✅ FIXED: Removed value prop and fixed className */}
                        {filteredCities.map((city, index) => (
                          <ListboxItem
                            key={`${city}-${index}`}
                            className="text-white hover:bg-red-600/20 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <span>📍</span>
                              <span>{city}</span>
                            </div>
                          </ListboxItem>
                        ))}
                      </Listbox>
                    </div>
                  </div>
                )}
              </div>

              {/* Check-in Date */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  📅 Check-in
                </label>
                <Input
                  type="date"
                  value={checkInDate?.toString() || ''}
                  onValueChange={(value: string) => {
                    try {
                      setCheckInDate(parseDate(value));
                    } catch (e) {
                      console.log('Invalid date format');
                    }
                  }}
                  className="bg-white/20"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/20 border-white/30 hover:border-red-400"
                  }}
                />
              </div>

              {/* Check-out Date */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  📅 Check-out
                </label>
                <Input
                  type="date"
                  value={checkOutDate?.toString() || ''}
                  onValueChange={(value: string) => {
                    try {
                      setCheckOutDate(parseDate(value));
                    } catch (e) {
                      console.log('Invalid date format');
                    }
                  }}
                  className="bg-white/20"
                  classNames={{
                    input: "text-white",
                    inputWrapper: "bg-white/20 border-white/30 hover:border-red-400"
                  }}
                />
              </div>

              {/* Guests */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  👥 Guests
                </label>
                <Input
                  type="number"
                  placeholder="1"
                  value={guests}
                  onValueChange={setGuests}
                  min="1"
                  max="20"
                  className="bg-white/20"
                  classNames={{
                    input: "text-white placeholder:text-white/60",
                    inputWrapper: "bg-white/20 border-white/30 hover:border-red-400"
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="mt-8 text-center">
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                size="lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching Agoda...
                  </>
                ) : (
                  <>
                    🏨 Search Hotels on Agoda
                  </>
                )}
              </Button>
              
              {/* ✅ Agoda guarantee text below button */}
              <p className="text-red-200 text-sm mt-3">
                🛡️ Protected by Agoda's Best Price Guarantee
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Popular Destinations - Agoda Style */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Popular Destinations on Agoda
            </h2>
            <p className="text-red-200">
              Explore top-rated hotels in these amazing cities
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
            {/* ✅ Agoda's most popular destinations first */}
            {["Bangkok", "Singapore", "Tokyo", "Dubai", "London", "Paris", "New York", "Sydney", "Mumbai", "Delhi", "Seoul", "Hong Kong"].map((city, index) => (
              <button
                key={`popular-${city}-${index}`}
                onClick={() => {
                  setSelectedCity(city);
                  setLocation('');
                }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 hover:bg-red-600/20 transition-all duration-300 hover:scale-105 hover:border-red-400"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {/* ✅ City-specific emojis for popular destinations */}
                    {city === 'Bangkok' ? '🇹🇭' :
                     city === 'Singapore' ? '🇸🇬' :
                     city === 'Tokyo' ? '🇯🇵' :
                     city === 'Dubai' ? '🇦🇪' :
                     city === 'London' ? '🇬🇧' :
                     city === 'Paris' ? '🇫🇷' :
                     city === 'New York' ? '🗽' :
                     city === 'Sydney' ? '🇦🇺' :
                     city === 'Mumbai' ? '🇮🇳' :
                     city === 'Delhi' ? '🇮🇳' :
                     city === 'Seoul' ? '🇰🇷' : '🏙️'}
                  </div>
                  <p className="text-white font-semibold text-sm">{city}</p>
                  
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Agoda Features Section */}
        <div className="mt-16">
          <div className="bg-white/5 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Why Choose Agoda?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-3">💰</div>
                <h4 className="text-white font-semibold mb-2">Best Price Guaranteed</h4>
                <p className="text-red-200 text-sm">
                  Find a lower price? We'll match it and give you an extra discount.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">⚡</div>
                <h4 className="text-white font-semibold mb-2">Instant Confirmation</h4>
                <p className="text-red-200 text-sm">
                  Get your booking confirmed immediately with instant vouchers.
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-3">🛡️</div>
                <h4 className="text-white font-semibold mb-2">Secure & Trusted</h4>
                <p className="text-red-200 text-sm">
                  Book with confidence using our secure payment system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Agoda Footer Branding */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="bg-red-600 text-white text-sm px-3 py-1 rounded font-semibold">
              AGODA
            </span>
            <span className="text-white text-sm">Powered Hotel Search</span>
          </div>
          <p className="text-red-300 text-xs mt-2">
            Over 2 million properties worldwide • Trusted by millions of travelers
          </p>
        </div>
      </div>
    </div>
  );
}
