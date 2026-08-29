import { supabase } from '@/lib/supabase';
import GalleryClient from './GalleryClient';
import * as motion from 'framer-motion/client';

export default async function GallerySection() {
  const { data: photos } = await supabase
    .from('gallery_photos')
    .select('*')
    .order('sort_order', { ascending: true });

  const displayPhotos = photos && photos.length > 0 ? photos : [
    { id: '1', album_name: 'Early Years', image_url: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?q=80&w=600&auto=format&fit=crop', caption: 'Childhood photo', sort_order: 1 },
    { id: '2', album_name: 'Early Years', image_url: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=600&auto=format&fit=crop', caption: 'With parents', sort_order: 2 },
    { id: '3', album_name: 'Family', image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop', caption: 'Family picnic', sort_order: 3 },
  ];

  return (
    <section id="gallery" className="py-24 px-4 max-w-7xl mx-auto min-h-[50vh]">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary"
      >
        Photo Gallery
      </motion.h2>
      <GalleryClient photos={displayPhotos as any[]} />
    </section>
  );
}
