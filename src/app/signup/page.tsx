
'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Users, BarChart, Shield, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUpPage() {
    const { user, signInWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);
    
    const features = [
        { icon: Ticket, text: "Create and manage events effortlessly." },
        { icon: Users, text: "Engage with your attendees." },
        { icon: BarChart, text: "Track sales with powerful analytics." },
        { icon: Shield, text: "Secure payment processing." },
    ];

    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="hidden md:block space-y-6">
                    <h1 className="text-4xl font-bold text-foreground">Join TicketFlow Today</h1>
                    <p className="text-muted-foreground text-lg">
                        The ultimate platform for creating memorable events and connecting with your community.
                    </p>
                    <div className="space-y-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-full">
                                    <feature.icon className="h-5 w-5 text-primary"/>
                                </div>
                                <span className="text-foreground">{feature.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="w-full max-w-md mx-auto shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl flex items-center justify-center gap-2">
                            <UserPlus className="h-6 w-6"/> Create Your Account
                        </CardTitle>
                        <CardDescription>Get started in seconds with Google</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button className="w-full" size="lg" onClick={signInWithGoogle} disabled={loading}>
                            {loading ? "Loading..." : "Sign Up with Google"}
                        </Button>
                        <p className="text-center text-xs text-muted-foreground">
                            By signing up, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                        </p>
                        <div className="text-center">
                            <p className="text-sm">
                                Already have an account? <Button variant="link" asChild className="p-0"><Link href="/home">Sign In</Link></Button>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
