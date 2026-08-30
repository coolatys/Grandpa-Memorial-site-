'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

type TimelineEvent = {
  id: string;
  year: string;
  title: string;
  description: string | null;
  photo_url?: string | null;
};

export default function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Calculate height from 0% to 100% based on scroll
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className="relative md:flex md:flex-col md:items-center py-4">
      {/* Background Static Line */}
      <div className="absolute top-0 bottom-0 left-[7px] md:left-1/2 w-[2px] bg-stone-200 transform md:-translate-x-1/2 origin-top"></div>
      
      {/* Animated Glowing Progress Line */}
      <motion.div 
        style={{ scaleY }}
        className="absolute top-0 bottom-0 left-[7px] md:left-1/2 w-[4px] bg-accent transform md:-translate-x-1/2 origin-top z-0 shadow-[0_0_12px_rgba(234,179,8,0.8)]"
      ></motion.div>
      
      {events.map((event, index) => {
        const isEven = index % 2 === 0;
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`mb-16 pl-10 md:pl-0 w-full md:flex ${isEven ? 'md:justify-start' : 'md:justify-end'} relative z-10`}
          >
            {/* Desktop Dot */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="hidden md:block absolute left-1/2 top-1 transform -translate-x-1/2 w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_rgba(234,179,8,1)] border-2 border-white" 
            />
            
            {/* Mobile Dot */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="md:hidden absolute left-[1px] top-1 w-4 h-4 rounded-full bg-accent shadow-[0_0_10px_rgba(234,179,8,1)] border-2 border-white" 
            />
            
            <div className={`md:w-[45%] ${isEven ? 'md:text-right md:pr-16' : 'md:text-left md:pl-16'} pt-0`}>
              <span className="text-xl md:text-2xl font-serif text-accent block mb-2">{event.year}</span>
              <h3 className="text-xl md:text-2xl font-medium text-stone-800 mb-4">{event.title}</h3>
              {event.description && (
                <div 
                  className="text-stone-600 leading-relaxed text-justify space-y-4"
                  dangerouslySetInnerHTML={{ __html: event.description }}
                />
              )}
              {event.photo_url && (
                <div className={`mt-6 ${isEven ? 'md:flex md:justify-end' : ''}`}>
                  <img src={event.photo_url} alt={event.title} className="rounded-lg shadow-md max-w-full h-auto md:max-w-[90%]" />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
