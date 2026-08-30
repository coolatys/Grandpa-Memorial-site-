'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import * as motion from 'framer-motion/client';
import { AnimatePresence } from 'framer-motion';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest'>('recent');

  const filteredAndSortedPosts = useMemo(() => {
    let result = posts.filter(post => 
      post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.message.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'recent' ? dateB - dateA : dateA - dateB;
    });
    
    return result;
  }, [posts, searchQuery, sortOrder]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      author_name: formData.get('name') as string,
      author_relationship: null, // Removed per new modal design
      title: null, 
      message: formData.get('message') as string,
      photo_url: formData.get('photo_url') as string || null,
      status: 'pending' as const,
      // email is asked for moderation follow up, but we could save it in a specific field if it existed in the DB
    };

    // @ts-ignore
    const { error } = await supabase.from('memories').insert(data);

    setIsSubmitting(false);
    if (!error) {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
      }, 3000);
    } else {
      alert('Failed to submit. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-primary text-white px-6 py-2 rounded shadow-sm hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
        >
          Contribute
        </button>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4 items-center">
          <input 
            type="text" 
            placeholder="Search memories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
          />
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'recent' | 'oldest')}
            className="w-full sm:w-auto px-4 py-2 rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-white"
          >
            <option value="recent">Date (recent first)</option>
            <option value="oldest">Date (oldest first)</option>
          </select>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {filteredAndSortedPosts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-stone-100 text-center text-stone-500">
            No memories found.
          </div>
        ) : (
          filteredAndSortedPosts.map((post, index) => (
            <motion.div 
              key={post.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 md:p-8 rounded-lg shadow-sm border border-stone-100"
            >
              <div className="text-sm italic text-stone-500 mb-4">
                {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              
              <p className="text-stone-700 whitespace-pre-wrap mb-6 text-justify hyphens-auto leading-relaxed">
                {post.message}
              </p>
              
              {post.photo_url && (
                <div className="mb-6">
                  <img src={post.photo_url} alt={`Shared by ${post.author_name}`} className="max-h-96 rounded-md object-contain bg-stone-50 w-full" />
                </div>
              )}
              
              <div className="text-right text-primary font-medium font-serif text-lg">
                — {post.author_name}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Contribute Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                <h3 className="text-xl font-serif text-primary">Contribute a Memory</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                {success ? (
                  <div className="bg-green-50 text-green-800 p-6 rounded-lg text-center">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
                    <p className="font-medium text-lg mb-2">Thank You</p>
                    <p className="text-sm">Your memory has been submitted and is pending review by the family.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">Enter your full name *</label>
                      <input required type="text" name="name" id="name" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">Enter your e-mail address *</label>
                      <input required type="email" name="email" id="email" className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                      <p className="text-xs text-stone-500 mt-1">Used for moderation follow-up only, never displayed publicly.</p>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1">Your message *</label>
                      <textarea required name="message" id="message" rows={5} className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"></textarea>
                    </div>

                    <div>
                      <label htmlFor="photo_url" className="block text-sm font-medium text-stone-700 mb-1">Add photo URL (Optional)</label>
                      <div className="flex gap-2">
                         <input type="url" name="photo_url" id="photo_url" placeholder="https://..." className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-4 font-medium"
                    >
                      <span>{isSubmitting ? 'Submitting...' : 'Submit Memory'}</span>
                      {!isSubmitting && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
