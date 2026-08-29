import Hero from '@/components/Hero';
import BiographySection from '@/components/sections/BiographySection';
import TimelineSection from '@/components/sections/TimelineSection';
import GallerySection from '@/components/sections/GallerySection';
import TributeSection from '@/components/sections/TributeSection';
import ServiceSection from '@/components/sections/ServiceSection';

export const revalidate = 60;

export default function Home() {
  return (
    <>
      <div id="hero">
        <Hero />
      </div>
      <BiographySection />
      <TimelineSection />
      <GallerySection />
      <TributeSection />
      <ServiceSection />
    </>
  );
}
