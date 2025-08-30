import { getPostData } from '@/lib/posts';
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const postData = await getPostData(params.slug);
  return {
    title: `${postData.title} | A2Z Tool Blog`,
    description: postData.excerpt,
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <p className="text-sm text-muted-foreground">{postData.date}</p>
                <CardTitle className="text-3xl md:text-4xl">{postData.title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
                />
            </CardContent>
        </Card>
    </div>
  );
}