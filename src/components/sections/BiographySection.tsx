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
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-serif text-center mb-12 text-primary"
      >
        Biography
      </motion.h2>
      
      <div className="space-y-16">
        {displaySections.map((section, index) => (
          <motion.div 
            key={section.id} 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="prose prose-stone lg:prose-lg mx-auto"
          >
            <h3 className="text-2xl font-serif text-accent mb-4">{section.heading}</h3>
            <div dangerouslySetInnerHTML={{ __html: section.body }} className="text-stone-700 leading-relaxed text-justify" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
