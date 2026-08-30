import { supabase } from '@/lib/supabase';
import * as motion from 'framer-motion/client';

export default async function TributesSection() {
  const { data: rawPosts } = await supabase
    .from('tributes')
    .select('*')
    .order('sort_order', { ascending: true });
    
  const posts = rawPosts as any[] | null;

  return (
    <section id="tributes" className="py-24 px-4 bg-stone-100 min-h-[50vh]">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-4 text-primary">Tributes</h2>
          <p className="text-stone-600 max-w-2xl mx-auto text-lg text-justify hyphens-auto">
            A reflection on the life of Pa JOK John, as shared by his loving family.
          </p>
        </motion.div>
        
        <div className="space-y-12">
          {posts?.map((post, i) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white p-8 md:p-10 shadow-sm border border-stone-100 rounded-lg relative"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-accent rounded-l-lg opacity-50"></div>
              
              {post.title && (
                <h3 className="text-2xl font-serif text-primary mb-4">{post.title}</h3>
              )}
              
              <div className="text-stone-700 text-lg leading-relaxed whitespace-pre-wrap text-justify hyphens-auto italic font-serif">
                "{post.message}"
              </div>
              
              <div className="mt-6 flex items-center gap-4 border-t border-stone-100 pt-6">
                <div>
                  <div className="font-medium text-stone-900">{post.author_name}</div>
                  {post.author_relationship && (
                    <div className="text-stone-500 text-sm">{post.author_relationship}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {(!posts || posts.length === 0) && (
            <div className="text-center text-stone-500 py-12">
              No tributes available.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
