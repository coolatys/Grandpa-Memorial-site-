'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import * as motion from 'framer-motion/client';

type Post = {
  id: string;
  author_name: string;
  author_relationship: string | null;
  title: string | null;
  message: string;
  photo_url: string | null;
  created_at: string;
};

export default function MemoriesClient({ posts }: { posts: Post[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      author_name: formData.get('name') as string,
      author_relationship: formData.get('relationship') as string || null,
      title: formData.get('title') as string || null,
      message: formData.get('message') as string,
      photo_url: formData.get('photo_url') as string || null,
      status: 'pending' as const,
    };

    // @ts-ignore
    const { error } = await supabase.from('memories').insert(data);

    setIsSubmitting(false);
    if (!error) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="lg:col-span-1"
      >
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100 sticky top-24">
          <h3 className="text-2xl font-serif text-primary mb-6">Share a Memory</h3>
          
          {success ? (
            <div className="bg-green-50 text-green-800 p-4 rounded-md">
              Thank you for sharing. Your memory has been submitted and is pending review by the family.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
                <input required type="text" name="name" id="name" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>
              
              <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-stone-700 mb-1">Relationship to Pa JOK John</label>
                <input type="text" name="relationship" id="relationship" placeholder="e.g., Friend, Coworker, Nephew" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-1">Title (Optional)</label>
                <input type="text" name="title" id="title" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">Memory / Message *</label>
                <textarea required name="message" id="message" rows={5} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"></textarea>
              </div>

              <div>
                <label htmlFor="photo_url" className="block text-sm font-medium text-stone-700 mb-1">Photo URL (Optional)</label>
                <input type="url" name="photo_url" id="photo_url" placeholder="https://..." className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Memory'}
              </button>
            </form>
          )}
        </div>
      </motion.div>

      {/* Posts Section */}
      <div className="lg:col-span-2 space-y-6">
        {posts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-stone-100 text-center text-stone-500">
            No memories have been shared yet. Be the first to share one.
          </div>
        ) : (
          posts.map((post, index) => (
            <motion.div 
              key={post.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100"
            >
              {post.title && (
                <h4 className="text-xl font-serif text-primary mb-3">{post.title}</h4>
              )}
              <p className="text-stone-700 whitespace-pre-wrap mb-6 text-justify hyphens-auto leading-relaxed">
                {post.message}
              </p>
              
              {post.photo_url && (
                <div className="mb-6">
                  <img src={post.photo_url} alt={`Shared by ${post.author_name}`} className="max-h-96 rounded-md object-contain bg-stone-50 w-full" />
                </div>
              )}
              
              <div className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 font-serif text-lg">
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-stone-900">{post.author_name}</p>
                  <p className="text-stone-500 text-xs">
                    {post.author_relationship ? `${post.author_relationship} Ã¢â‚¬Â¢ ` : ''}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
