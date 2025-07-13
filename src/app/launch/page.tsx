
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { Loader2, CheckCircle, Mail, PartyPopper, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-4xl md:text-6xl font-bold text-primary tracking-tighter">
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs md:text-sm uppercase text-muted-foreground tracking-widest">{label}</span>
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
    const getNextMonday12pm = () => {
        const now = new Date();
        const nextMonday = new Date(now);
        nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
        nextMonday.setHours(12, 0, 0, 0);
        return nextMonday;
    }

    const launchDate = getNextMonday12pm();

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
    }, 1000);

    return () => clearInterval(interval);
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
        <Rocket className="h-16 w-16 text-primary mx-auto mb-6" />
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 font-headline">
          Something Big is Coming
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-600">
          Our new platform is launching soon. Get ready to experience event management like never before.
        </p>

        <div className="my-12 grid grid-cols-4 gap-4 max-w-lg mx-auto">
          <CountdownUnit value={timeLeft.days} label="Days" />
          <CountdownUnit value={timeLeft.hours} label="Hours" />
          <CountdownUnit value={timeLeft.minutes} label="Minutes" />
          <CountdownUnit value={timeLeft.seconds} label="Seconds" />
        </div>

        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5"/>
              Be the First to Know
            </CardTitle>
            <CardDescription>
              Sign up to receive a notification when we go live.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted ? (
               <div className="text-center py-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                    <p className="text-gray-600">
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
                  />
                  <Input
                    type="email"
                    placeholder="Your Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isSubmitting}
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
      </div>
    </div>
  );
}
