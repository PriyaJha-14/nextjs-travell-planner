"use client";
import React from "react";
import {
  Navbar as NextNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  Avatar,
  DropdownMenu,
  DropdownItem,
  AvatarIcon,
} from "@heroui/react";
import { Architects_Daughter } from "next/font/google";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store";

const ArchitectsDaughter = Architects_Daughter({
  weight: "400",
  style: "normal",
  subsets: ["latin"],
});

const Navbar = ({ onOpen }: { onOpen: () => void }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo, setUserInfo } = useAppStore();
  const routesWithImages = ["/", "/search-flights", "/search-hotels"];

  // ✅ UPDATED: Proper logout functionality that navigates to logout page
  const handleLogout = () => {
    // Clear user info (handle null case properly)
    setUserInfo(undefined as any); // or use the proper method your store expects
    router.push("/"); // Redirect to home
  };

  // ✅ Handle dropdown actions
  const handleDropdownAction = (key: string) => {
    if (key === "logout") {
      handleLogout();
    } else {
      router.push(key);
    }
  };

  return (
    <NextNavbar
      isBordered
      className="min-h-[10vh] bg-violet-500 bg-opacity-10 text-white relative"
    >
      {!routesWithImages.includes(pathname) && (
        <>
          <div className="fixed left-0 top-0 h-[10vh] w-[100vw] overflow-hidden z-0">
            <div className="h-[70vh] w-[100vw] absolute z-10 top-0 left-0">
              <Image
                src="/home/home-bg.png"
                layout="fill"
                objectFit="cover"
                alt="Search"
              />
            </div>
          </div>
          <div
            className="fixed left-0 top-0 h-[10vh] w-[100vw] overflow-hidden z-0"
            style={{
              backdropFilter: "blur(12px) saturate(280%)",
              WebkitBackdropFilter: "blur(12px) saturate(280%)",
            }}
          ></div>
        </>
      )}
      <div className="z-10 w-full flex items-center">
        <NavbarBrand>
          <div className="cursor-pointer flex items-center" onClick={() => router.push("/")}>
            <Image src="/logo.png" alt="logo" height={80} width={80} />
            <span className="text-xl uppercase font-medium italic">
              <span className={ArchitectsDaughter.className}>SMARTSCRAPE</span>
            </span>
          </div>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem isActive>
            <Link
              href="/"
              aria-current="page"
              className={`${pathname === "/" ? "text-danger-500" : "text-white"}`}
            >
              Tours
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/search-flights"
              className={`${pathname.includes("flights") ? "text-danger-500" : "text-white"}`}
            >
              Flights
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link
              href="/search-hotels"
              className={`${pathname.includes("hotels") ? "text-danger-500" : "text-white"}`}
            >
              Hotels
            </Link>
          </NavbarItem>
        </NavbarContent>

        <NavbarContent justify="end">
          {!userInfo && (
            <>
              <NavbarItem className="hidden lg:flex">
                <Button
                  onPress={onOpen}
                  color="secondary"
                  variant="flat"
                  className="text-purple-500"
                >
                  Login
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button
                  color="danger"
                  onPress={onOpen}
                  variant="flat"
                >
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )}
          {userInfo && (
            <>
              <Dropdown 
                placement="bottom-end"
                classNames={{
                  base: "before:bg-default-200",
                  content: "bg-gradient-to-b from-gray-800 via-gray-900 to-black border border-gray-700 shadow-2xl rounded-xl overflow-hidden",
                }}
              >
                <DropdownTrigger>
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform hover:scale-105"
                    icon={<AvatarIcon />}
                    classNames={{
                      base: "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg",
                      icon: "text-white",
                    }}
                    size="md"
                  />
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Profile Actions"
                  variant="flat"
                  onAction={(key) => handleDropdownAction(key as string)}
                  classNames={{
                    base: "p-2",
                    list: "bg-transparent",
                  }}
                >
                  {/* User Info Header */}
                  <DropdownItem 
                    key="user-info" 
                    className="h-16 gap-2 opacity-100 cursor-default bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-lg mb-2 border border-gray-600/30"
                    textValue="User Info"
                    isReadOnly
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {userInfo?.firstName?.[0] || userInfo?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-white text-sm">Signed in as</p>
                        <p className="font-medium text-gray-300 text-xs truncate max-w-[150px]">
                          {userInfo.email}
                        </p>
                        {userInfo.firstName && (
                          <p className="text-gray-400 text-xs">
                            {userInfo.firstName} {userInfo.lastName || ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </DropdownItem>

                  {/* Menu Items */}
                  <DropdownItem 
                    key="/my-account"
                    className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg py-2"
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  >
                    My Account
                  </DropdownItem>
                  
                  <DropdownItem 
                    key="/my-bookings"
                    className="text-gray-300 hover:text-white hover:bg-white/10 rounded-lg py-2"
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    }
                  >
                    My Bookings
                  </DropdownItem>

                  {/* Divider */}
                  <DropdownItem
                    key="divider"
                    className="h-px bg-gray-600/30 my-2 cursor-default"
                    isReadOnly
                    textValue="divider"
                  >
                    <div className="w-full h-px bg-gray-600/30"></div>
                  </DropdownItem>

                  {/* Logout */}
                  <DropdownItem 
                    key="logout" 
                    color="danger"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg py-2"
                    startContent={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    }
                  >
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </>
          )}
        </NavbarContent>
      </div>
    </NextNavbar>
  );
};

export default Navbar;
