
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Sparkles,
} from 'lucide-react';
import { getLaunchConfig, formatTimeUnit, getCountdownMessage } from '@/lib/launch';

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="text-4xl md:text-6xl font-bold text-primary tracking-tighter bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-xs md:text-sm uppercase text-muted-foreground tracking-widest mt-2">{label}</span>
  </div>
);

export default function CountdownPage({ children }: { children: React.ReactNode }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
        const config = getLaunchConfig();
        setTimeLeft(config.timeRemaining);
    }
    
    calculateTimeLeft(); // Initial calculation
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl w-full">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring' }}
            className="inline-block mb-6"
        >
            <Rocket className="h-16 w-16 text-primary mx-auto" />
        </motion.div>
        
        <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 font-headline"
        >
          Something Big is Coming
        </motion.h1>
        <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-4 text-lg md:text-xl text-gray-600"
        >
          Our new platform is launching soon. Get ready to experience event management like never before.
        </motion.p>
        
        <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 0.9 }}
            className="my-12 grid grid-cols-4 gap-4 max-w-lg mx-auto"
        >
          <CountdownUnit value={timeLeft.days} label="Days" />
          <CountdownUnit value={timeLeft.hours} label="Hours" />
          <CountdownUnit value={timeLeft.minutes} label="Minutes" />
          <CountdownUnit value={timeLeft.seconds} label="Seconds" />
        </motion.div>

        <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6, delay: 1.1 }}
        >
            {children}
        </motion.div>
      </div>
    </div>
  );
}
