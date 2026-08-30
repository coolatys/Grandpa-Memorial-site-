'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

export default function Hero() {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on mount
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const desktopY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const mobileY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);
  
  const y = isMobile ? mobileY : desktopY;
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-stone-900">
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2940&auto=format&fit=crop")' }}
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-stone-300 tracking-[0.2em] uppercase text-sm mb-6"
        >
          A Legacy of Faith, Love, and Purpose
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-wide"
        >
          Pa JOK John
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col items-center space-y-4"
        >
          <p className="text-xl md:text-2xl text-stone-200 font-light italic text-justify">
            Celebrating a Life Beautifully Lived
          </p>
          <div className="flex items-center space-x-4 text-stone-300">
            <span>4 February 1948</span>
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            <span>29 June 2026</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
