"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  CardFooter,
  Button,
} from '@heroui/react';
import { Architects_Daughter } from 'next/font/google';
import { useAppStore } from '@/store';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ADMIN_API_ROUTES } from '@/utils';

const ArchitectsDaughter = Architects_Daughter({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setUserInfo } = useAppStore();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post(ADMIN_API_ROUTES.LOGIN, {
        email,
        password,
      });
      if (response.data.userInfo) {
        setUserInfo(response.data.userInfo);
        router.push("/admin");
      }
    } catch (error) {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div
      className="h-screen w-full relative flex items-center justify-center"
      style={{
        backgroundImage: "url('/home/home-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-0"></div>

      {/* Login Card */}
      <Card className="relative z-10 max-w-md w-full px-8 py-10 rounded-3xl bg-white bg-opacity-80 backdrop-blur-lg shadow-2xl">
        <CardHeader className="flex flex-col gap-3 items-center">
          <Image
            src="/logo.png"
            alt="logo"
            height={80}
            width={80}
            className="cursor-pointer"
          />
          <span
            className={`${ArchitectsDaughter.className} italic text-2xl text-white drop-shadow font-semibold`}
          >
            SmartScrape Admin Login
          </span>
        </CardHeader>

        <CardBody className="flex flex-col items-center gap-6 mt-6">
          {/* Email Input */}
          <input
            className="w-full block rounded-lg px-4 py-2 bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-gray-500 autofill:!bg-white autofill:!text-black"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            style={{
              // Fix for forced browser autofill
              WebkitBoxShadow: '0 0 0 1000px #fff inset',
              WebkitTextFillColor: '#111',
            }}
          />

          {/* Password Input with toggle */}
          <div className="w-full relative flex items-center">
            <input
              className="w-full block rounded-lg px-4 py-2 bg-white text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 font-medium placeholder-gray-500 autofill:!bg-white autofill:!text-black"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{
                WebkitBoxShadow: '0 0 0 1000px #fff inset',
                WebkitTextFillColor: '#111',
              }}
            />
            <button
              type="button"
              title={showPassword ? "Hide Password" : "Show Password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none"
              tabIndex={-1}
            >
              {/* Eye/Eye-off icon from Heroicons */}
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" strokeWidth={1.5}
                  stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 3l18 18M15.54 15.54C14.5 16.04 13.29 16.33 12 16.33c-2.97 0-5.51-1.71-7.49-4.29a12.013 12.013 0 0 1 1.16-1.27m1.44-1.5c1.82-1.43 4.18-2.27 6.89-2.27 2.97 0 5.51 1.71 7.49 4.29-.71.9-1.51 1.71-2.36 2.41" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                  viewBox="0 0 24 24" strokeWidth={1.5}
                  stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12s-3.75 7.5-9.75 7.5S2.25 12 2.25 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </CardBody>

        <CardFooter className="flex flex-col items-center gap-2 mt-8">
          <Button
            color="success"
            variant="shadow"
            className="w-full capitalize font-semibold text-lg py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            size="lg"
            onClick={handleLogin}
          >
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
