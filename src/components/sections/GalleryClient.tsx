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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <div className="flex justify-end">
                  <a 
                    href={photo.image_url} 
                    download
                    className="p-2 bg-black/50 hover:bg-accent rounded-full text-white backdrop-blur-sm transition-colors"
                    title="Download Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  </a>
                </div>
                {photo.caption && (
                  <p className="text-white text-sm font-light mt-auto">{photo.caption}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
