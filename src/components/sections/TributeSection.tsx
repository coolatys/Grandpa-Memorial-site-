import { supabase } from '@/lib/supabase';
import TributeClient from './TributeClient';

export default async function TributeSection() {
  const { data: posts } = await supabase
    .from('tributes')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return (
    <section id="tribute" className="py-24 px-4 bg-stone-50 min-h-[50vh]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-primary">Tribute</h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg">
            Share your tributes, condolences, and personal stories.
          </p>
        </div>
        
        <TributeClient posts={posts as any[] || []} />
      </div>
    </section>
  );
}
