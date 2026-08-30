import React from "react";
import HeroSection from "../component/Home/HeroSection";
import FeatureSection from "../component/Home/FeatureSection";
import BenefitsSection from "../component/Home/BenefitsSection";
import CTASection from "../component/Home/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 transition-colors">
      <HeroSection />
      <FeatureSection />
      <BenefitsSection />
      <CTASection />
    </div>
  );
};

export default Home;
