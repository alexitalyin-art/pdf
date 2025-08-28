import Link from 'next/link';
import { Layers3 } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Layers3 className="h-6 w-6 text-primary" />
                <span className="hidden font-bold sm:inline-block">
                PDF Tools
                </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/tools" className="transition-colors hover:text-foreground/80 text-foreground/60">Tools</Link>
                <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</Link>
                <Link href="/blog" className="transition-colors hover:text-foreground/80 text-foreground/60">Blog</Link>
                <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</Link>
            </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center">
                <ModeToggle />
            </nav>
        </div>
      </div>
    </header>
  );
};