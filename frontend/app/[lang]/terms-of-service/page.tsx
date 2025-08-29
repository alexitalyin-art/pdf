import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service | A2Z Tool',
  description: 'Read the Terms of Service for A2Z Tool. By using our free online PDF tools, you agree to these terms and conditions.',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="prose dark:prose-invert max-w-none">
                <p><strong>Last Updated:</strong> August 29, 2025</p>

                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing and using the A2Z Tool website and its services (the "Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by these terms, please do not use this Service.
                </p>

                <h2>2. Description of Service</h2>
                <p>
                  A2Z Tool provides a collection of online tools for processing PDF documents. A key feature of our Service is that all file processing is done locally in your web browser. **Your files are never sent to, uploaded to, or stored on our servers.**
                </p>

                <h2>3. User Conduct</h2>
                <p>
                  You agree to use the Service only for lawful purposes. You are solely responsible for the content of the files you process with our tools. You agree not to use the Service to process any material that is illegal, defamatory, infringing on intellectual property rights, or otherwise harmful.
                </p>

                <h2>4. Disclaimer of Warranties</h2>
                <p>
                  The Service is provided "as is" and "as available" without any warranties of any kind, either express or implied. A2Z Tool does not warrant that the Service will be uninterrupted, error-free, or completely secure. While our browser-based approach is designed for maximum privacy, you use the Service at your own risk.
                </p>
                
                <h2>5. Limitation of Liability</h2>
                <p>
                  In no event shall A2Z Tool, its owners, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or the inability to use the Service or for the cost of procurement of substitute services.
                </p>

                <h2>6. Changes to the Terms</h2>
                <p>
                  We reserve the right to modify these terms from time to time at our sole discretion. Therefore, you should review this page periodically. Your continued use of the Website or our service after any such change constitutes your acceptance of the new Terms.
                </p>

                <h2>7. Governing Law</h2>
                <p>
                  These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}