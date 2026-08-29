'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminTributes() {
  const [tributes, setTributes] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTributes();
  }, []);

  const fetchTributes = async () => {
    const { data } = await supabase.from('tributes').select('*').order('sort_order', { ascending: true });
    if (data) setTributes(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tribute?')) return;
    await supabase.from('tributes').delete().eq('id', id);
    setTributes(tributes.filter(t => t.id !== id));
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      author_name: formData.get('author_name') as string,
      author_relationship: formData.get('author_relationship') as string || null,
      title: formData.get('title') as string || null,
      message: formData.get('message') as string,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    // @ts-ignore
    const { error } = await supabase.from('tributes').insert(data);
    if (!error) {
      setIsAdding(false);
      fetchTributes();
    } else {
      alert('Failed to add tribute.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-serif text-primary">Manage Tributes</h2>
          <p className="text-stone-500 mt-1">Manage the formal family tributes section.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white px-4 py-2 rounded text-sm"
        >
          {isAdding ? 'Cancel' : 'Add Tribute'}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 mb-8">
          <h3 className="font-medium mb-4">Add New Tribute</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Author Name *</label>
                <input required name="author_name" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Relationship</label>
                <input name="author_relationship" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input name="title" className="w-full border rounded p-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Sort Order</label>
                <input type="number" name="sort_order" defaultValue={0} className="w-full border rounded p-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1">Message *</label>
              <textarea required name="message" rows={5} className="w-full border rounded p-2" />
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded text-sm">Save Tribute</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-stone-100 divide-y divide-stone-100">
        {tributes.length === 0 ? (
          <div className="p-8 text-center text-stone-500">No tributes found.</div>
        ) : (
          tributes.map(tribute => (
            <div key={tribute.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-lg">{tribute.author_name}</h4>
                  <p className="text-sm text-stone-500">
                    {tribute.author_relationship} {tribute.title ? `• ${tribute.title}` : ''}
                  </p>
                </div>
                <button 
                  onClick={() => handleDelete(tribute.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              <p className="text-stone-700 whitespace-pre-wrap">{tribute.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
