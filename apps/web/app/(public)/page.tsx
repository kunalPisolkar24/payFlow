"use client";
import { useState, useEffect } from 'react';
import { BusinessSection, Hero, Navbar, TestimonialCarousel, FAQSection, Footer } from "@/components/layouts";
import { Loader } from "@/components/common";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader />
        </div>
      ) : (
        <>
          <Navbar />
          <Hero />
          <BusinessSection />
          <TestimonialCarousel />
          <FAQSection />
          <Footer />
        </>
      )}
    </>
  );
}