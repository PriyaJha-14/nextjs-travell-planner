"use client";

import React, { useState } from "react";
import Navbar from "@/components/client/navbar/navbar";
import { Footer } from "@/components/client/footer";
import { useDisclosure } from "@heroui/react";
import { AuthModal } from "@/components/client/auth-modal";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store";
import { Loader } from "@/components/client/loader";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  // Dummy open handler, replace with your modal open logic
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(true);
  const pathname = usePathname();
  const {isScraping} = useAppStore();

  return (
    <>
      {" "}
      {pathname.includes("/admin") ? (
        children
      ) : (


        <div className="relative flex flex-col min-h-screen" id="app-container">
          <main className="flex flex-col relative flex-grow">
            {isScraping && <Loader />}
            <Navbar onOpen={onOpen} />
            <section className="h-full flex-1">{children}</section>
            <AuthModal isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange} />
            <Footer />
          </main>
          {/* Render your modal here if modalOpen is true */}
        </div>
      )}
    </>

  );
};

export default PageLayout;
