import { getSortedPostsData } from '@/lib/posts';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Blog | A2Z Tool',
  description: 'Articles, guides, and tips for making the most of your PDF documents.',
};

export default function BlogPage({ params: { lang } }: { params: { lang: string } }) {
  const allPosts = getSortedPostsData();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">A2Z Tool Blog</h1>
        <p className="text-lg text-muted-foreground mt-2">Guides and tips for all your PDF needs.</p>
      </div>
      <div className="space-y-6">
        {allPosts.map(({ id, title, date, excerpt }) => (
          <Link href={`/${lang}/blog/${id}`} key={id} className="block">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <p className="text-sm text-muted-foreground pt-2">{date}</p>
                <CardDescription className="pt-2">{excerpt}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}