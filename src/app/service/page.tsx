import { supabase } from '@/lib/supabase';
import ServiceClient from './ServiceClient';

export const revalidate = 60;

export default async function ServicePage() {
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
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-4xl md:text-5xl font-serif text-center mb-8 text-primary">Service Details</h1>
      <ServiceClient settings={displaySettings as any} events={displayEvents as any[]} />
    </div>
  );
}
