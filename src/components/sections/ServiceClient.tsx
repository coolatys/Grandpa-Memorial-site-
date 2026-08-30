'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Settings = {
  burial_datetime: string | null;
  wake_keep_datetime: string | null;
  venue_name: string | null;
  venue_address: string | null;
  livestream_url: string | null;
};

type ServiceEvent = {
  id: string;
  event_day: 'wake_keep' | 'burial';
  time: string;
  title: string;
  description: string | null;
};

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsPast(true);
        clearInterval(interval);
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (isPast) {
    return (
      <div className="text-center py-8">
        <h3 className="text-2xl font-serif text-primary">Thank you for celebrating his life with us.</h3>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-4 md:gap-8 my-12">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="w-16 h-16 md:w-24 md:h-24 bg-stone-200 rounded-lg flex items-center justify-center shadow-sm overflow-hidden relative">
            <AnimatePresence mode="popLayout">
              <motion.span 
                key={value}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                className="text-2xl md:text-4xl font-serif text-stone-800 absolute"
              >
                {value.toString().padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="mt-2 text-xs md:text-sm uppercase tracking-widest text-stone-500">{unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function ServiceClient({ settings, events }: { settings: Settings; events: ServiceEvent[] }) {
  const [activeTab, setActiveTab] = useState<'wake_keep' | 'burial'>('wake_keep');

  const filteredEvents = events.filter(e => e.event_day === activeTab);

  return (
    <div>
      {/* Countdown Section */}
      {settings.burial_datetime && (
        <section className="mb-20">
          <Countdown targetDate={settings.burial_datetime} />
          <div className="text-center space-y-2 mt-8">
            <h3 className="text-xl font-medium text-stone-800">{settings.venue_name}</h3>
            <p className="text-stone-600">{settings.venue_address}</p>
          </div>
        </section>
      )}

      {/* Schedule Tabs */}
      <div className="flex justify-center gap-4 mb-12">
        <button
          onClick={() => setActiveTab('wake_keep')}
          className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${
            activeTab === 'wake_keep' ? 'bg-primary text-white' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
          }`}
        >
          Wake Keep
        </button>
        <button
          onClick={() => setActiveTab('burial')}
          className={`px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors ${
            activeTab === 'burial' ? 'bg-primary text-white' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
          }`}
        >
          Burial Day
        </button>
      </div>

      {/* Schedule List */}
      <div className="max-w-2xl mx-auto space-y-6">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-6 bg-white p-6 rounded-lg shadow-sm border border-stone-100"
          >
            <div className="w-20 flex-shrink-0 text-accent font-serif text-lg font-medium">
              {event.time}
            </div>
            <div>
              <h4 className="text-lg font-medium text-stone-800 mb-1">{event.title}</h4>
              {event.description && <p className="text-stone-600 text-sm">{event.description}</p>}
            </div>
          </motion.div>
        ))}
        {filteredEvents.length === 0 && (
          <p className="text-center text-stone-500 italic">No events scheduled yet.</p>
        )}
      </div>
    </div>
  );
}
