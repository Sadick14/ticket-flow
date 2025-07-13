
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { Loader2, CheckCircle, Mail, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { getLaunchConfig } from '@/lib/launch';


const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="text-4xl md:text-6xl font-bold text-primary tracking-tighter bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
      {String(value).padStart(2, '0')}
    </div>
    <span className="text-xs md:text-sm uppercase text-muted-foreground tracking-widest mt-2">{label}</span>
  </div>
);


export default function LaunchPage() {
  const { addLaunchSubscriber } = useAppContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
<<<<<<< HEAD
    const timer = setInterval(() => {
      const config = getLaunchConfig();
      setTimeLeft(config.timeRemaining);
=======
    const getNextFriday12pm = () => {
        const now = new Date();
        const nextFriday = new Date(now);
        // Day of week: Sunday = 0, Monday = 1, ..., Friday = 5
        const daysUntilFriday = (5 - now.getDay() + 7) % 7;
        // If today is Friday, target next Friday, unless it's before noon.
        if (daysUntilFriday === 0 && now.getHours() >= 12) {
            nextFriday.setDate(now.getDate() + 7);
        } else {
            nextFriday.setDate(now.getDate() + daysUntilFriday);
        }
        nextFriday.setHours(12, 0, 0, 0);
        return nextFriday;
    }

    const launchDate = getNextFriday12pm();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
>>>>>>> 57ec44c (lets change it to friday 12pm rather)
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill out both your name and email.',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addLaunchSubscriber(formData.name, formData.email);
      setIsSubmitted(true);
      toast({
        title: "You're on the list!",
        description: "We'll notify you as soon as we launch.",
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
     <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl w-full">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{
                scale: { duration: 0.5, type: 'spring' },
                rotate: { repeat: Infinity, duration: 1.5, ease: "easeInOut", type: "tween" },
                delay: 0.2,
            }}
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
            <Card className="max-w-md mx-auto shadow-xl bg-background/80 mt-12">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-foreground">
                <Mail className="h-5 w-5"/>
                Be the First to Know
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                Sign up to receive a notification when we go live.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSubmitted ? (
                <div className="text-center py-4">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-foreground">Thank You!</h3>
                        <p className="text-muted-foreground">
                        We've added you to our launch list. Keep an eye on your inbox!
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="bg-background"
                    />
                    <Input
                        type="email"
                        placeholder="Your Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="bg-background"
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                        ) : (
                        'Notify Me'
                        )}
                    </Button>
                    </form>
                )}
            </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}
