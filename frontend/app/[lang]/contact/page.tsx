'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [status, setStatus] = useState('');
  const [formValues, setFormValues] = useState({ name: '', email: '', message: '' });

  // IMPORTANT: Replace this with your actual Formspark form ID
  const FORMSPARK_FORM_ID = 'AROUNfBYn';
  const formSparkUrl = `https://submit-form.com/${FORMSPARK_FORM_ID}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // --- THIS IS THE FIX ---
      // We are now sending the data as JSON, which is more reliable.
      // We also added much more detailed error logging.
      const response = await fetch(formSparkUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        // Log the specific error from the server
        const errorData = await response.json();
        console.error("Formspark Error:", errorData);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      setStatus('success');
      setFormValues({ name: '', email: '', message: '' }); // Clear the form on success
    } catch (error) {
      console.error("Submission Error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">Contact Us</CardTitle>
            <CardDescription className="text-md md:text-lg">
                Have a question or feedback? We'd love to hear from you.
            </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'success' ? (
            <div className="text-center p-8 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <h3 className="text-2xl font-semibold text-green-800 dark:text-green-200">Thank You!</h3>
              <p className="text-muted-foreground mt-2">Your message has been sent successfully. We'll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" name="name" type="text" placeholder="John Doe" required value={formValues.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input id="email" name="email" type="email" placeholder="you@example.com" required value={formValues.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Your Message</Label>
                    <Textarea id="message" name="message" placeholder="Tell us how we can help..." required rows={6} value={formValues.message} onChange={handleInputChange} />
                </div>
                <Button type="submit" disabled={status === 'loading'} className="w-full text-lg py-6">
                    {status === 'loading' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Send Message'}
                </Button>
                {status === 'error' && <p className="text-center text-destructive">Something went wrong. Please check the console for details.</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}