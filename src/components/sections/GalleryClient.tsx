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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

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
              className="relative group overflow-hidden rounded-lg shadow-sm bg-stone-200 aspect-[4/3] cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
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
                    onClick={(e) => e.stopPropagation()}
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

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Close button */}
            <button 
              className="absolute top-4 right-4 md:top-8 md:right-8 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
              onClick={() => setSelectedPhoto(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <motion.img 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={selectedPhoto.image_url} 
              alt={selectedPhoto.caption || 'Expanded gallery photo'} 
              className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Bottom Action Bar */}
            <div 
              className="mt-6 flex flex-col items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedPhoto.caption && (
                <p className="text-white/90 text-sm md:text-base font-light text-center max-w-lg mb-2">
                  {selectedPhoto.caption}
                </p>
              )}
              <a 
                href={selectedPhoto.image_url} 
                download
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full border border-white/20 transition-all font-medium text-sm md:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Full Photo
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
