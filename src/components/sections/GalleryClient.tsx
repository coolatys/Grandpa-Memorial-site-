'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Photo = {
  id: string;
  album_name: string;
  image_url: string;
  caption: string | null;
};

export default function GalleryClient({ photos }: { photos: Photo[] }) {
  const albums = Array.from(new Set(photos.map(p => p.album_name)));
  const [activeAlbum, setActiveAlbum] = useState(albums[0] || 'All');

  const filteredPhotos = activeAlbum === 'All' 
    ? photos 
    : photos.filter(p => p.album_name === activeAlbum);

  const allTabs = ['All', ...albums];

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {allTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveAlbum(tab)}
            className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${
              activeAlbum === tab 
                ? 'bg-primary text-white' 
                : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Masonry-ish Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredPhotos.map((photo) => (
            <motion.div
              layout
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative group overflow-hidden rounded-lg shadow-sm bg-stone-200 aspect-[4/3]"
            >
              <img 
                src={photo.image_url} 
                alt={photo.caption || 'Gallery photo'} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {photo.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <p className="text-white p-4 text-sm font-light">{photo.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
