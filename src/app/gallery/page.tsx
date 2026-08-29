import { supabase } from '@/lib/supabase';
import GalleryClient from './GalleryClient';

export const revalidate = 60;

export default async function GalleryPage() {
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
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary">Photo Gallery</h1>
      <GalleryClient photos={displayPhotos as any[]} />
    </div>
  );
}
