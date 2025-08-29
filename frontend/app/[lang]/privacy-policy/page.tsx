import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy | A2Z Tool',
  description: 'Read the Privacy Policy for A2Z Tool. We are committed to protecting your privacy. Learn how our browser-based tools keep your data secure.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent>
            {/* The `prose` classes automatically style all the text inside this div */}
            <div className="prose dark:prose-invert max-w-none">
                <p><strong>Last Updated:</strong> August 29, 2025</p>

                <h2>Introduction</h2>
                <p>
                Welcome to A2Z Tool ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our website and its tools (the "Service"). A key feature of our Service is that all PDF file processing happens directly in your browser. <strong>Your files are never uploaded to or stored on our servers.</strong>
                </p>

                <h2>Information We Collect</h2>
                <p>
                Because our tools work entirely in your browser, we do not collect, store, or have access to any of your personal files or the content within them. When you use a tool on A2Z Tool:
                </p>
                <ul>
                <li>The file you select remains on your computer.</li>
                <li>All processing is done by your own browser.</li>
                <li>We cannot see or access your documents at any point.</li>
                </ul>
                <p>
                Like most websites, we may collect non-personally identifying information that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request. We collect this information to better understand how our visitors use our website and to maintain its security.
                </p>

                <h2>Data Security</h2>
                <p>
                The security of your documents is guaranteed because they never leave your computer. You have full control over your files at all times. Since your files are not uploaded to our servers, there is no risk of them being accessed by us or any third party through our system.
                </p>
                
                <h2>Third-Party Services</h2>
                <p>
                In the future, we may use third-party services like Google AdSense to display advertisements. These services may use cookies to serve ads based on a user's prior visits to our website or other websites. You can opt out of personalized advertising by visiting your ad settings.
                </p>

                <h2>Changes to This Privacy Policy</h2>
                <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                </p>

                <h2>Contact Us</h2>
                <p>
                If you have any questions about this Privacy Policy, you can contact us at: [Your Email Address Here]
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}