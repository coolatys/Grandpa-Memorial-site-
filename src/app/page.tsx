import Hero from '@/components/Hero';
import BiographySection from '@/components/sections/BiographySection';
import TimelineSection from '@/components/sections/TimelineSection';
import GallerySection from '@/components/sections/GallerySection';
import TributesSection from '@/components/sections/TributesSection';
import MemoriesSection from '@/components/sections/MemoriesSection';
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
      <TributesSection />
      <MemoriesSection />
      <ServiceSection />
    </>
  );
}
