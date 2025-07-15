'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleTestEmail = async () => {
    if (!email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter an email address' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email })
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast({ title: 'Success', description: 'Test email sent successfully!' });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: data.message || 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Test email error:', error);
      setResult({ success: false, message: 'Network error occurred' });
      toast({ variant: 'destructive', title: 'Error', description: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: 'test@example.com', configCheck: true })
      });
      const data = await response.json();
      console.log('Email config check:', data);
    } catch (error) {
      console.error('Config check error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Service Test
          </CardTitle>
          <CardDescription>
            Test the email functionality to ensure it's working correctly
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Test Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address to test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleTestEmail} 
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Email
              </>
            )}
          </Button>

          {result && (
            <Alert className={result.success ? 'border-green-200' : 'border-red-200'}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription>
                    <strong>{result.success ? 'Success!' : 'Error:'}</strong> {result.message}
                    {result.details && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div>Recipient: {result.details.recipient}</div>
                        <div>Timestamp: {result.details.timestamp}</div>
                      </div>
                    )}
                    {result.error && (
                      <div className="mt-2 text-sm text-red-600">
                        Error Details: {result.error}
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Troubleshooting Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check that all SMTP environment variables are set correctly</li>
              <li>• Verify Gmail app password is valid (not regular password)</li>
              <li>• Ensure less secure app access is enabled for Gmail</li>
              <li>• Check the browser console and server logs for detailed errors</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
