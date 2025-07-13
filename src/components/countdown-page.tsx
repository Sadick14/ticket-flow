
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Bell, 
  Calendar, 
  Clock, 
  Star, 
  Sparkles,
  Mail,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { getLaunchConfig, formatTimeUnit, getCountdownMessage } from '@/lib/launch';

interface CountdownDisplayProps {
  value: number;
  label: string;
  delay: number;
}

function CountdownDisplay({ value, label, delay }: CountdownDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="text-center"
    >
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-2xl">
          <motion.div
            className="text-4xl md:text-6xl font-bold text-white mb-2"
            animate={{ 
              textShadow: [
                '0 0 20px rgba(59, 130, 246, 0.5)',
                '0 0 30px rgba(59, 130, 246, 0.8)',
                '0 0 20px rgba(59, 130, 246, 0.5)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {formatTimeUnit(value)}
          </motion.div>
          <div className="text-sm md:text-base text-blue-100 uppercase tracking-wider font-medium">
            {label}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FloatingParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50
      }}
      animate={{ 
        opacity: [0, 1, 0],
        y: -50,
        x: Math.random() * window.innerWidth
      }}
      transition={{ 
        duration: 8 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
      className="absolute pointer-events-none"
    >
      <Star className="h-2 w-2 text-yellow-300" />
    </motion.div>
  );
}

function NotifyMeForm() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/launch-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      } else {
        // Handle error - could show error message
        console.error('Failed to subscribe');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 text-green-400"
      >
        <CheckCircle className="h-5 w-5" />
        <span>Thanks! We'll notify you when we launch.</span>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-blue-100"
        required
      />
      <Button 
        type="submit" 
        disabled={isLoading}
        className="bg-white text-blue-600 hover:bg-blue-50"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Bell className="h-4 w-4" />
          </motion.div>
        ) : (
          <>
            Notify Me
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function CountdownPage() {
  const [config, setConfig] = useState(getLaunchConfig());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setConfig(getLaunchConfig());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to main app if launched and not in countdown mode
  if (config.isLaunched && !config.isCountdownMode) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.5} />
      ))}

      {/* Animated Background Shapes */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
      />
      
      <motion.div
        animate={{ 
          rotate: [360, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity
            }}
            className="inline-block mb-6"
          >
            <Rocket className="h-16 w-16 text-yellow-400" />
          </motion.div>
          
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-white mb-4"
            animate={{
              backgroundPosition: ["0%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              background: "linear-gradient(45deg, #ffffff, #60a5fa, #a78bfa, #ffffff)",
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TicketFlow
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-blue-100 mb-2"
          >
            The Ultimate Event Management Platform
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Badge className="bg-yellow-400 text-yellow-900 px-4 py-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Coming Soon
            </Badge>
          </motion.div>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {getCountdownMessage(config.timeRemaining)}
            </h2>
            <p className="text-blue-200">
              Get ready for the future of event management
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <CountdownDisplay 
              value={config.timeRemaining.days} 
              label="Days" 
              delay={1.2}
            />
            <CountdownDisplay 
              value={config.timeRemaining.hours} 
              label="Hours" 
              delay={1.4}
            />
            <CountdownDisplay 
              value={config.timeRemaining.minutes} 
              label="Minutes" 
              delay={1.6}
            />
            <CountdownDisplay 
              value={config.timeRemaining.seconds} 
              label="Seconds" 
              delay={1.8}
            />
          </div>
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl"
        >
          {[
            {
              icon: Calendar,
              title: "Easy Event Creation",
              description: "Create and manage events in minutes"
            },
            {
              icon: Clock,
              title: "Real-time Analytics",
              description: "Track sales and attendee engagement"
            },
            {
              icon: Mail,
              title: "Smart Communications",
              description: "Automated emails and notifications"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              whileHover={{ scale: 1.05, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center p-6">
                <CardContent className="p-0">
                  <feature.icon className="h-8 w-8 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-blue-100 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Email Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            Be the first to know when we launch!
          </h3>
          <NotifyMeForm />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="absolute bottom-6 text-center text-blue-200 text-sm"
        >
          <p>© 2025 TicketFlow. Get ready for something amazing.</p>
        </motion.div>
      </div>
    </div>
  );
}
