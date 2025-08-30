'use client'; // This component is now a client component to be aware of the current URL

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers3 } from 'lucide-react';

export const Header = () => {
  // Get the current URL path to determine the language
  const pathname = usePathname();
  const lang = pathname.split('/')[1] || 'en'; // Default to 'en' if no language is found

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="mr-4 flex items-center">
            <Link href={`/${lang}`} className="mr-6 flex items-center space-x-2">
                <Layers3 className="h-6 w-6 text-primary" />
                <span className="font-bold sm:inline-block">
                A2Z Tool
                </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href={`/${lang}`} className="transition-colors hover:text-foreground/80 text-foreground">Tools</Link>
                {/* --- NEW BLOG LINK --- */}
                <Link href={`/${lang}/blog`} className="transition-colors hover:text-foreground/80 text-foreground/60">Blog</Link>
                <Link href={`/${lang}/about`} className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
                <Link href={`/${lang}/contact`} className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
            </nav>
        </div>
      </div>
    </header>
  );
};