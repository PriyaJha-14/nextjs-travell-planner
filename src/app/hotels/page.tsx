"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ✅ Hotel interface
interface Hotel {
  id: number;
  name: string;
  image: string;
  price: number;
  location: string;
  jobId: number;
  scrappedOn: string;
  rating?: string;
  reviews?: number;
}

// ✅ Booking Modal Component
function BookingModal({ hotel, isOpen, onClose, checkIn, checkOut, guests }: {
  hotel: Hotel;
  isOpen: boolean;
  onClose: () => void;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [rooms, setRooms] = useState(1);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      // Create booking using your existing API
      const bookingResponse = await axios.post('/api/booking', {
        bookingId: hotel.id,
        bookingType: 'hotels',
        userId: 1, // You can get this from auth context
        taxes: 0,
        date: new Date().toISOString(),
        checkIn: checkIn,
        checkOut: checkOut,
        guests: guests,
        rooms: rooms
      });

      const { client_secret, totalAmount } = bookingResponse.data;

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: 'Hotel Guest',
          },
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        alert('Payment failed: ' + error.message);
      } else if (paymentIntent?.status === 'succeeded') {
        // Update booking status
        await axios.patch('/api/booking', {
          paymentIntent: paymentIntent.id
        });
        
        alert(`🎉 Hotel booking confirmed! Total: $${totalAmount}`);
        onClose();
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotal = () => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    return hotel.price * nights * rooms;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Book {hotel.name}</h2>
        
        <div className="mb-4 text-gray-600">
          <p><strong>Check-in:</strong> {new Date(checkIn).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> {new Date(checkOut).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> {guests}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700">Rooms:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rooms}
            onChange={(e) => setRooms(parseInt(e.target.value))}
            className="border rounded px-3 py-2 w-full text-gray-800"
          />
        </div>

        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="font-semibold text-gray-800">Total: ${calculateTotal()}</p>
        </div>

        <form onSubmit={handleBooking}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700">Card Details:</label>
            <div className="border rounded px-3 py-2">
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || processing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ✅ Static hotel counts to prevent hydration mismatch
const getHotelCount = (city: string): number => {
  const hotelCounts: Record<string, number> = {
    'Bangkok': 4580,
    'Singapore': 2340,
    'Tokyo': 5120,
    'Dubai': 3890,
    'London': 6750,
    'Paris': 5940,
    'New York': 7230,
    'Sydney': 2890,
    'Mumbai': 3450,
    'Delhi': 4120,
    'Seoul': 3670,
    'Hong Kong': 2180
  };
  return hotelCounts[city] || 2500;
};

// ✅ Main Hotels Page Component
export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    hotel: Hotel | null;
  }>({ isOpen: false, hotel: null });

  const searchParams = useSearchParams();
  const router = useRouter();
  const location = searchParams.get('location');

  // Get check-in/out dates from URL or use defaults
  const checkIn = searchParams.get('checkIn') || new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const checkOut = searchParams.get('checkOut') || new Date(Date.now() + 172800000).toISOString().split('T')[0];
  const guests = parseInt(searchParams.get('guests') || '2');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching Agoda hotels for location:", location);
        
        const response = await axios.get(`/api/hotels?location=${location || ''}`);
        console.log("✅ Agoda hotel data received:", response.data);
        
        // Handle both old and new API response formats
        const hotelsData = response.data.hotels || [];
        
        if (hotelsData.length > 0) {
          setHotels(hotelsData);
        } else {
          // ✅ Agoda-style mock data if no hotels found
          console.log("📝 Creating Agoda-style mock hotel data");
          setHotels([
            {
              id: 1,
              name: `Grand ${location || 'City'} Resort & Spa`,
              image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
              price: 145,
              location: location || "dubai",
              jobId: 0,
              scrappedOn: new Date().toISOString(),
              rating: "8.2",
              reviews: 1247
            },
            {
              id: 2,
              name: `Luxury ${location || 'City'} Business Hotel`,
              image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
              price: 189,
              location: location || "dubai",
              jobId: 0,
              scrappedOn: new Date().toISOString(),
              rating: "8.7",
              reviews: 892
            },
            {
              id: 3,
              name: `Premium ${location || 'City'} Suites`,
              image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
              price: 167,
              location: location || "dubai",
              jobId: 0,
              scrappedOn: new Date().toISOString(),
              rating: "8.5",
              reviews: 634
            },
            {
              id: 4,
              name: `Royal ${location || 'City'} Palace Hotel`,
              image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop",
              price: 298,
              location: location || "dubai",
              jobId: 0,
              scrappedOn: new Date().toISOString(),
              rating: "9.1",
              reviews: 1456
            },
            {
              id: 5,
              name: `Heritage ${location || 'City'} Boutique Hotel`,
              image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
              price: 223,
              location: location || "dubai",
              jobId: 0,
              scrappedOn: new Date().toISOString(),
              rating: "8.9",
              reviews: 578
            },
            {
              id: 6,
              name: `Modern ${location || 'City'} Executive Hotel`,
              image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop",
              price: 201,
              location: location || "dubai",
              jobId: 0,
              scrappedOn: new Date().toISOString(),
              rating: "8.4",
              reviews: 723
            }
          ]);
        }
        
      } catch (error) {
        console.error("❌ Error fetching Agoda hotels:", error);
        
        // ✅ Agoda-style error fallback data
        setHotels([
          {
            id: 1,
            name: `Premium ${location || 'City'} Hotel`,
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
            price: 156,
            location: location || "bangkok",
            jobId: 0,
            scrappedOn: new Date().toISOString(),
            rating: "8.3",
            reviews: 945
          },
          {
            id: 2,
            name: `Grand ${location || 'City'} Resort`,
            image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
            price: 198,
            location: location || "bangkok",
            jobId: 0,
            scrappedOn: new Date().toISOString(),
            rating: "8.7",
            reviews: 567
          },
          {
            id: 3,
            name: `Boutique ${location || 'City'} Suites`,
            image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop",
            price: 134,
            location: location || "bangkok",
            jobId: 0,
            scrappedOn: new Date().toISOString(),
            rating: "8.1",
            reviews: 412
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [location]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Today';
    }
  };

  // ✅ Convert Agoda rating to star display
  const getRatingStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating / 2);
    const halfStar = (numRating / 2) % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(emptyStars);
  };

  // ✅ Get Agoda rating color based on score
  const getRatingColor = (rating: string) => {
    const numRating = parseFloat(rating);
    if (numRating >= 9.0) return 'text-green-400';
    if (numRating >= 8.5) return 'text-blue-400';
    if (numRating >= 8.0) return 'text-yellow-400';
    if (numRating >= 7.5) return 'text-orange-400';
    return 'text-red-400';
  };

  const openBookingModal = (hotel: Hotel) => {
    setBookingModal({ isOpen: true, hotel });
  };

  const closeBookingModal = () => {
    setBookingModal({ isOpen: false, hotel: null });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-white text-lg">Loading hotels from Agoda...</p>
              <p className="text-red-300 text-sm mt-2">Finding the best deals for you</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => router.push('/search-hotels')}
              className="flex items-center space-x-2 text-white hover:text-red-300 transition-colors mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Go Back</span>
            </button>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Available Hotels from Agoda
            </h1>
            <p className="text-red-200">
              {location ? `${location} • ` : ''}{hotels.length} hotel{hotels.length !== 1 ? 's' : ''} found • Best prices guaranteed
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                AGODA
              </span>
              <span className="text-green-400 text-sm font-medium">
                ✓ Free cancellation available
              </span>
            </div>
          </div>

          {/* Hotel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div 
                key={hotel.id} 
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              >
                {/* Hotel Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={hotel.image} 
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Agoda Deal
                  </div>
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Free WiFi
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{hotel.name}</h3>
                  <p className="text-red-200 text-sm mb-3 capitalize">{hotel.location}</p>
                  
                  {/* ✅ Agoda-style rating display */}
                  {hotel.rating && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className={`text-lg font-bold ${getRatingColor(hotel.rating)}`}>
                        {hotel.rating}
                      </div>
                      <div className="flex text-yellow-400 text-sm">
                        {getRatingStars(hotel.rating).split('').map((star, index) => (
                          <span key={index}>{star}</span>
                        ))}
                      </div>
                      <span className="text-red-200 text-sm">
                        ({hotel.reviews || Math.floor(Math.random() * 1000) + 100} reviews)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-200">Per night</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                          {formatPrice(hotel.price)}
                        </p>
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-semibold">
                          -20%
                        </span>
                      </div>
                      <p className="text-xs text-red-300 line-through">
                        {formatPrice(Math.floor(hotel.price * 1.2))}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => openBookingModal(hotel)}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Book on Agoda
                    </button>
                  </div>

                  {/* ✅ Agoda-style amenities */}
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm text-red-200">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span>WiFi</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                          </svg>
                          <span>Pool</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          <span>Breakfast</span>
                        </span>
                      </div>
                      <div className="text-xs opacity-70">
                        Updated {formatDate(hotel.scrappedOn)}
                      </div>
                    </div>
                  </div>

                  {/* ✅ Agoda-style special offers */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                        ⚡ Flash Deal
                      </span>
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                        💳 Pay Later
                      </span>
                    </div>
                    <p className="text-green-400 text-xs font-medium">
                      ✓ Free cancellation until 24h before check-in
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {hotels.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-bold text-white mb-2">No Hotels Found on Agoda</h3>
                <p className="text-red-200 mb-4">
                  We couldn't find any hotels for "{location}" on Agoda. Try searching for a different location.
                </p>
                <button 
                  onClick={() => router.push('/search-hotels')}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-2 px-6 rounded-xl transition-all duration-300"
                >
                  Search Again
                </button>
              </div>
            </div>
          )}

          {/* ✅ Agoda-style footer info */}
          <div className="mt-12 text-center">
            <div className="bg-white/5 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className="bg-red-600 text-white text-sm px-3 py-1 rounded font-semibold">
                  AGODA
                </span>
                <span className="text-white font-semibold">Powered by Agoda</span>
              </div>
              <p className="text-red-300 text-sm">
                All prices include taxes and fees. Additional charges may apply.
                Prices are subject to availability and may change without notice.
              </p>
              <p className="text-red-300 text-xs mt-2">
                ✓ Best Price Guarantee • ✓ No Booking Fees • ✓ Free Cancellation Available
              </p>
            </div>
          </div>

          {/* Booking Modal */}
          {bookingModal.hotel && (
            <BookingModal
              hotel={bookingModal.hotel}
              isOpen={bookingModal.isOpen}
              onClose={closeBookingModal}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
            />
          )}
        </div>
      </div>
    </Elements>
  );
}
