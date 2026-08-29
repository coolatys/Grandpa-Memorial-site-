import { supabase } from '@/lib/supabase';
import MemoryWallClient from './MemoryWallClient';

export const revalidate = 10;

export default async function MemoryWallPage() {
  const { data: posts } = await supabase
    .from('memory_wall_posts')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-primary">Memory Wall</h1>
        <p className="text-stone-600 max-w-2xl mx-auto text-lg">
          Share your tributes, condolences, and personal stories.
        </p>
      </div>
      
      <MemoryWallClient posts={posts as any[] || []} />
    </div>
  );
}
