import { supabase } from '@/lib/supabase';
import TimelineClient from './TimelineClient';
import * as motion from 'framer-motion/client';

export default async function TimelineSection() {
  const { data: events } = await supabase
    .from('timeline_events')
    .select('*')
    .order('sort_order', { ascending: true });

  const displayEvents = events && events.length > 0 ? events : [
    { id: '1', year: '1930', title: 'Born in Hometown', description: 'A brief description of birth.', sort_order: 1 },
    { id: '2', year: '1955', title: 'Married', description: 'Married his beloved wife.', sort_order: 2 },
    { id: '3', year: '1990', title: 'Retired', description: 'Retired after 40 years of service.', sort_order: 3 },
  ];

  return (
    <section id="timeline" className="py-24 px-4 bg-stone-50 min-h-[50vh]">
      <div className="max-w-5xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-serif text-center mb-16 text-primary"
        >
          Life Timeline
        </motion.h2>
        <TimelineClient events={displayEvents as any[]} />
      </div>
    </section>
  );
}
