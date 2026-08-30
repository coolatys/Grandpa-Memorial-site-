import { supabase } from '@/lib/supabase';
import ServiceClient from './ServiceClient';
import * as motion from 'framer-motion/client';

export default async function ServiceSection() {
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .single();

  const { data: events } = await supabase
    .from('service_events')
    .select('*')
    .order('sort_order', { ascending: true });

  const displaySettings = settings || {
    burial_datetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days from now
    wake_keep_datetime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6).toISOString(),
    venue_name: 'St. Mary\'s Church',
    venue_address: '123 Memorial Lane, Peaceful City',
    livestream_url: null,
  };

  const displayEvents = events && events.length > 0 ? events : [
    { id: '1', event_day: 'wake_keep', time: '18:00', title: 'Arrival & Seating', description: 'Guests arrive.', sort_order: 1 },
    { id: '2', event_day: 'wake_keep', time: '19:00', title: 'Tributes', description: 'Family and friends share memories.', sort_order: 2 },
    { id: '3', event_day: 'burial', time: '10:00', title: 'Funeral Mass', description: 'Main service.', sort_order: 1 },
    { id: '4', event_day: 'burial', time: '12:00', title: 'Committal', description: 'At the cemetery.', sort_order: 2 },
  ];

  return (
    <section id="service" className="py-24 px-4 max-w-4xl mx-auto min-h-[50vh]">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-5xl font-serif text-center mb-8 text-primary"
      >
        Service Details
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ServiceClient settings={displaySettings as any} events={displayEvents as any[]} />
      </motion.div>
    </section>
  );
}
