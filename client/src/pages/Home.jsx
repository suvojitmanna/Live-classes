import React from 'react'
import HeroSection from '../component/Home/HeroSection'
import FeatureSection from '../component/Home/FeatureSection'
import BenefitsSection from '../component/Home/BenefitsSection'
import CTASection from '../component/Home/CTASection'

const Home = () => {
  return (
    <div className='min-h-screen bg-white'>
        <HeroSection/>
        <FeatureSection/>
        <BenefitsSection/>
        <CTASection/>
    </div>
  )
}

export default Home