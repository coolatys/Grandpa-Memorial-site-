'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminMemories() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('memories')
      .select('*')
      .eq('status', 'pending')
      .then(({ data }) => {
        if (data) setPosts(data);
      });
  }, []);

  const handleUpdate = async (id: string, status: 'approved' | 'rejected') => {
    // @ts-ignore
    await supabase.from('memories').update({ status }).eq('id', id);
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-serif text-stone-800 mb-6">Moderate Tributes</h1>
      
      {posts.length === 0 ? (
        <p className="text-stone-500">No pending posts to review.</p>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm border border-stone-100 flex justify-between items-start">
              <div>
                <div className="font-medium">{post.author_name} {post.author_relationship ? `(${post.author_relationship})` : ''}</div>
                <div className="font-serif mt-1">{post.title}</div>
                <div className="text-stone-600 mt-2 whitespace-pre-wrap text-sm">{post.message}</div>
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                <button onClick={() => handleUpdate(post.id, 'approved')} className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200">Approve</button>
                <button onClick={() => handleUpdate(post.id, 'rejected')} className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
