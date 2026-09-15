// @ts-nocheck
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Helper to compress image to base64 so we don't need a Supabase Storage bucket setup
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Allow higher resolution for gallery photos
        const MAX_SIZE = 1200; 
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Slightly higher quality for gallery
        resolve(canvas.toDataURL('image/jpeg', 0.8)); 
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function GalleryAdminPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDataUrl, setUploadDataUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [albumName, setAlbumName] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('gallery_photos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPhotos(data);
    setLoading(false);
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      setUploadDataUrl(dataUrl);
    } catch(err) {
      console.error(err);
      alert('Failed to process image');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDataUrl) {
      alert('Please select a photo first.');
      return;
    }
    
    setIsUploading(true);
    try {
      const { error } = await supabase.from('gallery_photos').insert([{
        image_url: uploadDataUrl,
        caption: caption,
        album_name: albumName,
        sort_order: photos.length + 1
      }]);

      if (error) throw error;
      
      // Reset form
      setUploadDataUrl(null);
      setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      fetchPhotos();
    } catch (err: any) {
      console.error(err);
      alert('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this photo from the gallery?')) return;
    
    try {
      const { error } = await supabase.from('gallery_photos').delete().eq('id', id);
      if (error) throw error;
      fetchPhotos();
    } catch (err: any) {
      console.error(err);
      alert('Delete failed: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif text-primary mb-8">Manage Photo Gallery</h1>

      {/* UPLOAD FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 mb-12">
        <h2 className="text-xl font-medium text-stone-800 mb-4">Upload New Photo</h2>
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Image Selector */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-stone-700 mb-2">Select Photo</label>
              <input 
                 type="file" 
                 accept="image/*"
                 ref={fileInputRef}
                 onChange={handleImageSelect}
                 className="hidden"
              />
              {uploadDataUrl ? (
                <div className="relative w-full h-48 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                  <img src={uploadDataUrl} className="w-full h-full object-contain" />
                  <button 
                    type="button" 
                    onClick={() => {
                      setUploadDataUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-stone-50 transition text-stone-500 hover:text-primary"
                >
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span>Click to browse files</span>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Caption / Description</label>
                <textarea 
                  value={caption} 
                  onChange={e => setCaption(e.target.value)} 
                  rows={3}
                  placeholder="E.g., Grandpa fishing at the lake in 1982"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Album (Optional)</label>
                <input 
                  type="text" 
                  value={albumName} 
                  onChange={e => setAlbumName(e.target.value)} 
                  placeholder="e.g., Early Years"
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <button 
                type="submit" 
                disabled={!uploadDataUrl || isUploading}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-stone-800 transition disabled:opacity-50 font-medium"
              >
                {isUploading ? 'Uploading & Compressing...' : 'Upload to Live Gallery'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* CURRENT PHOTOS GRID */}
      <h2 className="text-xl font-medium text-stone-800 mb-4">Live Photos ({photos.length})</h2>
      
      {loading ? (
        <p className="text-stone-500">Loading gallery...</p>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-stone-200 text-stone-500">
          No photos in the gallery yet. Upload one above!
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map(photo => (
            <div key={photo.id} className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-sm group">
              <div className="aspect-square relative bg-stone-100">
                <img src={photo.image_url} alt={photo.caption} className="w-full h-full object-cover" />
                
                {/* Hover Delete Button */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(photo.id)}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 transition transform hover:scale-105"
                  >
                    Delete Photo
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-sm font-medium text-stone-800 truncate">{photo.caption || 'No caption'}</p>
                <p className="text-xs text-stone-500">{photo.album_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
