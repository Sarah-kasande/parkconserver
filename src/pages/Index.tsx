
import React from 'react';
import NavBar from '@/components/NavBar';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import ParkHighlights from '@/components/ParkHighlights';
import NationalPark from '@/components/park';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <NationalPark />
        <ParkHighlights />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
