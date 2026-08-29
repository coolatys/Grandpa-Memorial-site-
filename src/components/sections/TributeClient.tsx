'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

type Post = {
  id: string;
  author_name: string;
  author_relationship: string | null;
  title: string | null;
  message: string;
  photo_url: string | null;
  created_at: string;
};

export default function TributeClient({ posts }: { posts: Post[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      author_name: formData.get('author_name') as string,
      author_relationship: formData.get('author_relationship') as string || null,
      title: formData.get('title') as string || null,
      message: formData.get('message') as string,
      photo_url: formData.get('photo_url') as string || null, // In a real app, handle file uploads to Supabase storage
      status: 'pending' as const,
    };

    // @ts-ignore
    const { error } = await supabase.from('tributes').insert(data);

    setIsSubmitting(false);
    if (!error) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } else {
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="grid md:grid-cols-12 gap-12">
      {/* Submit Form */}
      <div className="md:col-span-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 sticky top-28">
          <h3 className="text-xl font-serif text-primary mb-4">Share a Memory</h3>
          
          {success && (
            <div className="bg-green-50 text-green-800 p-4 rounded mb-4 text-sm">
              Thank you for sharing. Your post has been submitted and is awaiting approval.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Name *</label>
              <input required name="author_name" type="text" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-stone-50" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Relationship (Optional)</label>
              <input name="author_relationship" type="text" placeholder="e.g. Grandson, Friend" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-stone-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Title (Optional)</label>
              <input name="title" type="text" placeholder="A brief headline for your story" className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-stone-50" />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Message *</label>
              <textarea required name="message" rows={5} className="w-full px-3 py-2 border border-stone-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-stone-50 resize-none"></textarea>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Post'}
            </button>
          </form>
        </div>
      </div>

      {/* Posts List */}
      <div className="md:col-span-8 space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12 text-stone-500 italic">
            No memories have been shared yet. Be the first to share one.
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={post.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-stone-100"
            >
              {post.title && <h4 className="text-xl font-serif text-stone-800 mb-2">{post.title}</h4>}
              <p className="text-stone-700 whitespace-pre-wrap leading-relaxed mb-4">{post.message}</p>
              
              <div className="flex items-center text-sm text-stone-500 border-t border-stone-100 pt-4 mt-4">
                <span className="font-medium text-stone-700">{post.author_name}</span>
                {post.author_relationship && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{post.author_relationship}</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
