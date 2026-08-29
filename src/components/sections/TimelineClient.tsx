'use client';

import { motion } from 'framer-motion';

type TimelineEvent = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  photo_url?: string | null;
};

export default function TimelineClient({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative border-l-2 border-stone-200 md:border-l-0 md:flex md:flex-col md:items-center">
      {/* Center line for desktop */}
      <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-0.5 bg-stone-200 transform -translate-x-1/2"></div>
      
      {events.map((event, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={`mb-12 pl-6 md:pl-0 md:w-full md:flex ${isEven ? 'md:justify-start' : 'md:justify-end'} relative`}
          >
            {/* Desktop Dot */}
            <div className="hidden md:block absolute left-1/2 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-stone-50 z-10" />
            
            {/* Mobile Dot */}
            <div className="md:hidden absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-accent border-4 border-stone-50 z-10" />
            
            <div className={`md:w-[45%] ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} pt-1 md:pt-0`}>
              <span className="text-xl md:text-2xl font-serif text-accent block mb-2">{event.year}</span>
              <h3 className="text-lg md:text-xl font-medium text-stone-800 mb-3">{event.title}</h3>
              {event.description && (
                <p className="text-stone-600 leading-relaxed">{event.description}</p>
              )}
              {event.photo_url && (
                <div className={`mt-4 ${isEven ? 'md:flex md:justify-end' : ''}`}>
                  <img src={event.photo_url} alt={event.title} className="rounded-lg shadow-sm max-w-full h-auto md:max-w-[80%]" />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
