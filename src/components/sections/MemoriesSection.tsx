import { supabase } from '@/lib/supabase';
import MemoriesClient from './MemoriesClient';

export default async function MemoriesSection() {
  const { data: posts } = await supabase
    .from('memories')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return (
    <section id="memories" className="py-24 px-4 bg-stone-50 min-h-[50vh]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-primary">Memories</h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Share your memories, condolences, and personal stories.
          </p>
        </div>
        
        <MemoriesClient posts={posts as any[] || []} />
      </div>
    </section>
  );
}
