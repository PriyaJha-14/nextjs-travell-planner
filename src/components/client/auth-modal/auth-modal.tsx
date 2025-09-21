"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
} from "@heroui/react";
import { Architects_Daughter } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { USER_API_ROUTES } from "@/utils/api-routes";
import { apiClient } from "@/lib";
import { useAppStore } from "@/store";
import axios from "axios";

const ArchitectsDaughter = Architects_Daughter({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

const AuthModal = ({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpen?: () => void;
  onOpenChange: () => void;
}) => {
  const [modalType, setModalType] = useState("login");
  const router = useRouter();
  const { setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ Password visibility state

  // ✅ Your existing logic - UNCHANGED
  const handleSignup = async (onClose: () => void) => {
    const response = await axios.post(USER_API_ROUTES.SIGNUP, {
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    });
    if (response.data.userInfo) {
      setUserInfo(response.data.userInfo);
      onClose();
    }
  };

  // ✅ Your existing logic - UNCHANGED
  const handleLogin = async (onClose: () => void) => {
    const response = await axios.post(USER_API_ROUTES.LOGIN, {
      email,
      password,
    });
    if (response.data.userInfo) {
      setUserInfo(response.data.userInfo);
      onClose();
    }
  };

  // ✅ Your existing logic - UNCHANGED
  const switchModalType = () => {
    if (modalType === "login") setModalType("signup");
    else setModalType("login");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setShowPassword(false); // ✅ Reset password visibility when switching
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="blur"
      size="4xl"
      classNames={{
        backdrop: "bg-black/70 backdrop-blur-md",
        base: "border-none shadow-2xl max-w-4xl",
        wrapper: "flex items-center justify-center min-h-screen p-4",
      }}
      className="bg-transparent"
    >
      <ModalContent className="bg-transparent rounded-2xl overflow-hidden h-[580px] shadow-2xl border-0">
        {(onClose) => (
          <div className="flex h-full">
            
            {/* ✅ Left Side - App Logo and Branding */}
            <div className="flex-1 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden flex flex-col items-center justify-center p-12">
              
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                <div className="absolute top-1/4 right-0 w-24 h-24 bg-white rounded-full translate-x-12"></div>
                <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white rounded-full translate-y-20"></div>
              </div>

              {/* Logo and App Name */}
              <div className="relative z-10 text-center">
                <div className="mb-6">
                  <Image
                    src="/logo.png"
                    alt="SmartScrape Logo"
                    height={80}
                    width={80}
                    className="mx-auto rounded-full shadow-2xl cursor-pointer"
                    onClick={() => router.push("/admin/dashboard")}
                  />
                </div>
                <h1 className={`text-3xl uppercase font-bold ${ArchitectsDaughter.className} text-white drop-shadow-lg mb-4`}>
                  SMARTSCRAPE
                </h1>
                <p className="text-gray-300 text-lg mb-8">
                  Smart Travel & Hotel Booking
                </p>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
              </div>

              {/* Welcome Text */}
              <div className="relative z-10 text-center mt-8">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {modalType === "login" 
                    ? "Welcome Back!" 
                    : "Join Our Community"
                  }
                </h2>
                <p className="text-gray-400 text-sm">
                  {modalType === "login" 
                    ? "Continue your travel journey with us" 
                    : "Start exploring amazing destinations"
                  }
                </p>
              </div>
            </div>

            {/* ✅ Right Side - Form */}
            <div className="w-96 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 text-white flex flex-col relative">
              
              {/* ✅ SINGLE Close button - Fixed position */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-white/60 hover:text-white transition-colors bg-white/10 rounded-full p-2 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex-1 p-8 pt-16 flex flex-col justify-center">
                
                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-8 text-left">
                  {modalType === "login" ? "Log in" : "Sign up"}
                </h2>

                {/* ✅ Form Fields - Conditional Rendering Fixed */}
                <div className="space-y-5">
                  
                  {/* Email - Always shown */}
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      variant="flat"
                      classNames={{
                        input: "text-white placeholder:text-white/50",
                        inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15 focus-within:bg-white/15 backdrop-blur-sm h-12 rounded-lg",
                      }}
                    />
                  </div>

                  {/* ✅ First Name and Last Name - ONLY for Signup */}
                  {modalType === "signup" && (
                    <>
                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          First Name
                        </label>
                        <Input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter your first name"
                          variant="flat"
                          classNames={{
                            input: "text-white placeholder:text-white/50",
                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15 focus-within:bg-white/15 backdrop-blur-sm h-12 rounded-lg",
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <Input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter your last name"
                          variant="flat"
                          classNames={{
                            input: "text-white placeholder:text-white/50",
                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15 focus-within:bg-white/15 backdrop-blur-sm h-12 rounded-lg",
                          }}
                        />
                      </div>
                    </>
                  )}

                  {/* ✅ Password - Always shown with visibility toggle */}
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"} // ✅ Toggle password visibility
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        variant="flat"
                        classNames={{
                          input: "text-white placeholder:text-white/50 pr-10",
                          inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15 focus-within:bg-white/15 backdrop-blur-sm h-12 rounded-lg",
                        }}
                        endContent={
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)} // ✅ Toggle password visibility
                            className="text-white/60 hover:text-white/80 transition-colors"
                          >
                            {showPassword ? (
                              // Eye slash icon (hide password)
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              // Eye icon (show password)
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Main Action Button */}
                <div className="mt-8">
                  <Button
                    onPress={() => {
                      modalType === "login"
                        ? handleLogin(onClose)
                        : handleSignup(onClose);
                    }}
                    className="w-full h-12 bg-white/20 hover:bg-white/25 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 transition-all duration-200"
                    size="lg"
                  >
                    {modalType === "login" ? "Log in" : "Sign up"}
                  </Button>
                </div>

                {/* Divider */}
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-white/20"></div>
                  <span className="px-4 text-sm text-white/70">
                    {modalType === "login" ? "Or Login with" : "Or Signup with"}
                  </span>
                  <div className="flex-1 h-px bg-white/20"></div>
                </div>

                {/* Google Button */}
                <div className="space-y-3">
                  <Button
                    className="w-full h-12 bg-white/15 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-xl transition-all duration-200"
                    startContent={
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    }
                  >
                    <span className="ml-2">Log in with Google</span>
                  </Button>
                </div>

                {/* ✅ Switch Mode - Proper messaging */}
                <div className="text-center mt-6">
                  <p className="text-white/70 text-sm mb-3">
                    {modalType === "login" 
                      ? "Don't have an account?" 
                      : "Already have an account?"
                    }
                  </p>
                  <Link
                    className="cursor-pointer text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    onClick={() => switchModalType()}
                  >
                    {modalType === "login" ? "Sign up" : "Log in"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;
