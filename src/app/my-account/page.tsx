"use client";
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Input, Card, CardBody, CardHeader } from '@heroui/react';
import { Architects_Daughter } from "next/font/google";
import axios from 'axios';

const ArchitectsDaughter = Architects_Daughter({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

interface Booking {
  id: number;
  bookingType: string;
  totalAmount: number;
  date: string;
  isCompleted: boolean;
  paymentIntent?: string;
}

export default function MyAccount() {
  const { userInfo } = useAppStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!userInfo?.id) {
        setLoading(false);
        return;
      }

      try {
        // ✅ Fetch bookings using your existing API
        const response = await axios.post('/api/booking/get-bookings', {
          userId: userInfo.id
        });
        
        console.log("✅ Bookings fetched:", response.data);
        
        if (response.data.bookings) {
          setBookings(response.data.bookings);
          setBookingsCount(response.data.bookings.length);
        }
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userInfo?.id]);

  // Redirect if not logged in
  if (!userInfo) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full -translate-x-48 -translate-y-48"></div>
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-purple-500 rounded-full translate-x-32"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600 rounded-full translate-y-40"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Image
              src="/logo.png"
              alt="SmartScrape Logo"
              height={80}
              width={80}
              className="mx-auto rounded-full shadow-2xl"
            />
          </div>
          <h1 className={`text-4xl uppercase font-bold ${ArchitectsDaughter.className} text-white drop-shadow-lg mb-2`}>
            MY ACCOUNT
          </h1>
          <p className="text-gray-400">Manage your SmartScrape profile and preferences</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card - ✅ Removed Wishlist Section */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
              <CardBody className="p-8 text-center">
                {/* Avatar */}
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <span className="text-white font-bold text-2xl">
                      {userInfo.firstName?.[0] || userInfo.email[0].toUpperCase()}
                      {userInfo.lastName?.[0] || ''}
                    </span>
                  </div>
                  <div className="mt-4">
                    <div className="inline-flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Active Account</span>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <h2 className="text-xl font-bold text-white mb-2">
                  {userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ''}` : 'User'}
                </h2>
                <p className="text-gray-400 text-sm mb-4">{userInfo.email}</p>
                <p className="text-gray-500 text-xs">
                  Member since {new Date().getFullYear()}
                </p>

                {/* ✅ Account Stats - Only Bookings (Wishlist Removed) */}
                <div className="mt-8">
                  <div className="bg-gray-800/50 rounded-lg p-6">
                    <div className="text-3xl font-bold text-blue-400">
                      {loading ? (
                        <div className="animate-pulse">...</div>
                      ) : (
                        bookingsCount
                      )}
                    </div>
                    <div className="text-sm text-gray-400">Total Bookings</div>
                    
                    {/* ✅ Show booking breakdown */}
                    {!loading && bookings.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {bookings.reduce((acc: { [key: string]: number }, booking) => {
                          acc[booking.bookingType] = (acc[booking.bookingType] || 0) + 1;
                          return acc;
                        }, {}) && Object.entries(bookings.reduce((acc: { [key: string]: number }, booking) => {
                          acc[booking.bookingType] = (acc[booking.bookingType] || 0) + 1;
                          return acc;
                        }, {})).map(([type, count]) => (
                          <div key={type} className="flex justify-between text-xs text-gray-400">
                            <span className="capitalize">
                              {type === 'flights' ? '✈️ Flights' : 
                               type === 'hotels' ? '🏨 Hotels' : 
                               type === 'trips' ? '🎯 Tours' : type}:
                            </span>
                            <span>{count}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ Quick Actions */}
                <div className="mt-6 space-y-3">
                  <Button
                    size="sm"
                    variant="flat"
                    className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30"
                    onClick={() => router.push('/my-bookings')}
                  >
                    View All Bookings
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Account Details */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-2xl font-bold text-white">Account Information</h3>
                  <Button
                    size="sm"
                    variant="flat"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-6">
                  
                  {/* Personal Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* First Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name
                        </label>
                        <Input
                          value={userInfo.firstName || ''}
                          variant={isEditing ? "bordered" : "flat"}
                          isReadOnly={!isEditing}
                          classNames={{
                            input: "text-white",
                            inputWrapper: `${isEditing ? 'border-gray-600 bg-gray-800' : 'bg-gray-800/50'} hover:bg-gray-700`,
                          }}
                        />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name
                        </label>
                        <Input
                          value={userInfo.lastName || ''}
                          variant={isEditing ? "bordered" : "flat"}
                          isReadOnly={!isEditing}
                          classNames={{
                            input: "text-white",
                            inputWrapper: `${isEditing ? 'border-gray-600 bg-gray-800' : 'bg-gray-800/50'} hover:bg-gray-700`,
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address
                        </label>
                        <Input
                          value={userInfo.email}
                          variant="flat"
                          isReadOnly
                          startContent={
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                            </svg>
                          }
                          classNames={{
                            input: "text-white",
                            inputWrapper: "bg-gray-800/50 hover:bg-gray-700",
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Booking Summary Section */}
                  {!loading && bookings.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Recent Bookings
                      </h4>
                      
                      <div className="bg-gray-800/30 rounded-lg p-6">
                        <div className="space-y-3">
                          {bookings.slice(0, 3).map((booking, index) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl">
                                  {booking.bookingType === 'flights' ? '✈️' : 
                                   booking.bookingType === 'hotels' ? '🏨' : '🎯'}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium capitalize">
                                    {booking.bookingType} Booking
                                  </p>
                                  <p className="text-gray-400 text-xs">
                                    {new Date(booking.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-white font-bold">
                                  ${booking.totalAmount.toFixed(2)}
                                </p>
                                <p className={`text-xs ${booking.isCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                                  {booking.isCompleted ? 'Completed' : 'Pending'}
                                </p>
                              </div>
                            </div>
                          ))}
                          
                          {bookings.length > 3 && (
                            <Button
                              size="sm"
                              variant="flat"
                              className="w-full mt-4 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400"
                              onClick={() => router.push('/my-bookings')}
                            >
                              View All {bookings.length} Bookings
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Account Security */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Account Security
                    </h4>
                    
                    <div className="bg-gray-800/30 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-white">Password</h5>
                          <p className="text-sm text-gray-400">Last changed: Never</p>
                        </div>
                        <Button
                          size="sm"
                          variant="bordered"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Save Changes */}
                  {isEditing && (
                    <div className="pt-6 border-t border-gray-700">
                      <div className="flex space-x-4">
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="bordered"
                          className="border-gray-600 text-gray-300"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center mt-12">
          <Button
            variant="flat"
            className="bg-gray-800 hover:bg-gray-700 text-white"
            startContent={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
