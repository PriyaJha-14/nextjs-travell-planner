"use client";

import React, { useState } from "react";
import Navbar from "@/components/client/navbar/navbar";
import { Footer } from "@/components/client/footer";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  // Dummy open handler, replace with your modal open logic
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(true);

  return (
    <div className="relative flex flex-col min-h-screen" id="app-container">
      <main className="flex flex-col relative flex-grow">
        <Navbar onOpen={handleOpen} />
        <section className="h-full flex-1">{children}</section>
        <Footer />
      </main>
      {/* Render your modal here if modalOpen is true */}
    </div>
  );
};

export default PageLayout;
