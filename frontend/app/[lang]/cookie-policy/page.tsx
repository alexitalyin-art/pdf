import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Cookie Policy | A2Z Tool',
  description: 'Read the Cookie Policy for A2Z Tool. Learn how cookies are used on our site, particularly for future advertising and analytics services.',
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl">Cookie Policy</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="prose dark:prose-invert max-w-none">
                <p><strong>Last Updated:</strong> August 29, 2025</p>

                <h2>What Are Cookies?</h2>
                <p>
                  As is common practice with almost all professional websites, this site uses cookies, which are tiny files that are downloaded to your computer to improve your experience. This page describes what information they gather, how we use it, and why we sometimes need to store these cookies. We will also share how you can prevent these cookies from being stored; however, this may downgrade or 'break' certain elements of the site's functionality.
                </p>

                <h2>How We Use Cookies</h2>
                <p>
                  Currently, A2Z Tool's core functionality operates without the use of cookies. Our tools work directly in your browser, and we do not use cookies to track your files or personal data.
                </p>
                <p>
                  In the future, we may use cookies for a variety of reasons detailed below:
                </p>
                <ul>
                    <li>
                        <strong>Advertising Cookies:</strong> We plan to use third-party advertisements, such as Google AdSense, to support our site. These services use cookies to serve ads that are more relevant to you and to limit the number of times you see a particular ad.
                    </li>
                    <li>
                        <strong>Analytics Cookies:</strong> We may use analytics services (like Google Analytics) to help us understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.
                    </li>
                </ul>

                <h2>Disabling Cookies</h2>
                <p>
                  You can prevent the setting of cookies by adjusting the settings on your browser (see your browser's Help for how to do this). Be aware that disabling cookies will affect the functionality of this and many other websites that you visit. Disabling cookies will usually result in also disabling certain functionality and features of this site. Therefore it is recommended that you do not disable cookies.
                </p>

                <h2>More Information</h2>
                <p>
                  Hopefully, that has clarified things for you. If you have any more questions, then you can contact us at: [Your Email Address Here]
                </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}