import { supabase } from '@/lib/supabase';
import * as motion from 'framer-motion/client';

export default async function BiographySection() {
  const { data: sections } = await supabase
    .from('biography_sections')
    .select('*')
    .order('sort_order', { ascending: true });

  const displaySections = sections && sections.length > 0 ? sections : [
    { id: '1', heading: 'Early Life', body: 'Grandpa was born in a small town...', sort_order: 1 },
    { id: '2', heading: 'Career', body: 'He dedicated 40 years to his profession...', sort_order: 2 }
  ];

  return (
    <section id="biography" className="py-24 px-4 max-w-4xl mx-auto min-h-[50vh]">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary"
      >
        Biography
      </motion.h2>

      {/* Biography Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.7 }}
        className="mb-16 max-w-lg mx-auto aspect-[4/5] md:aspect-square rounded-lg overflow-hidden relative shadow-sm border border-stone-100 flex items-center justify-center"
      >
        <img 
          src="/grandpa-1.png" 
          alt="Pa JOK John" 
          className="w-full h-full object-cover"
        />
      </motion.div>
      
      <div className="space-y-16">
        {displaySections.map((section, index) => {
          // Split the body text by <br><br> to animate individual paragraphs
          const paragraphs = section.body.split(/<br\s*\/?>\s*<br\s*\/?>/gi).filter((p: string) => p.trim() !== '');
          
          return (
            <div key={section.id} className="prose prose-stone lg:prose-lg mx-auto">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6 }}
                className="text-2xl font-serif text-accent mb-6"
              >
                {section.heading}
              </motion.h3>
              
              <div className="space-y-6">
                {paragraphs.map((para: string, i: number) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: Math.min(i * 0.1, 0.5) }}
                    className="text-stone-700 leading-relaxed text-justify m-0"
                    dangerouslySetInnerHTML={{ __html: para }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
