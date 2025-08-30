import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Lock, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About A2Z Tool | Our Mission for Free PDF Tools',
  description: 'Learn about A2Z Tool. Our mission is to provide simple, free, and secure PDF tools that work for everyone, right in their browser.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">About A2Z Tool</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="prose dark:prose-invert max-w-none">
                <p className="text-xl text-center text-muted-foreground">
                    Making PDF tools simple, secure, and accessible to everyone.
                </p>

                <h2>Our Mission</h2>
                <p>
                    In a world where simple tasks often require expensive software or surrendering your privacy, A2Z Tool was created with a clear mission: to provide powerful, easy-to-use PDF tools that are completely free and respect your data. We believe that everyone should have access to the tools they need to manage their documents without barriers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12 text-center">
                    <div className="flex flex-col items-center">
                        <Lock className="h-10 w-10 text-primary mb-3" />
                        <h3 className="font-semibold">Privacy First</h3>
                        <p className="text-sm text-muted-foreground">Our browser-based tools ensure your files never leave your computer. We never upload or store your documents.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Target className="h-10 w-10 text-primary mb-3" />
                        <h3 className="font-semibold">Simple by Design</h3>
                        <p className="text-sm text-muted-foreground">We focus on creating clean, intuitive interfaces that get the job done without confusion or unnecessary steps.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <Zap className="h-10 w-10 text-primary mb-3" />
                        <h3 className="font-semibold">Instant and Free</h3>
                        <p className="text-sm text-muted-foreground">No sign-ups, no subscriptions, no limits. Just fast, free tools that work for everyone, on any device.</p>
                    </div>
                </div>

                <h2>Who We Are</h2>
                <p>
                  A2Z Tool was started by a solo developer who was frustrated with the state of online PDF tools. Too many sites were slow, covered in ads, or required you to upload sensitive files to their servers. We decided to build a better alternative—a single, reliable website where the tools are powerful and your privacy is guaranteed.
                </p>
                <p>
                  Thank you for using A2Z Tool. We're committed to building the best free document tools on the web, and we're just getting started.
                </p>

            </div>
        </CardContent>
      </Card>
    </div>
  );
}