
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/context/app-context';
import { Loader2, CheckCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CountdownPage from '@/components/countdown-page';

export default function LaunchPage() {
  const { addLaunchSubscriber } = useAppContext();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

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
    <CountdownPage>
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
    </CountdownPage>
  );
}

