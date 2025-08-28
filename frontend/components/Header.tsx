import Link from 'next/link';
import { Layers3 } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Layers3 className="h-6 w-6 text-primary" />
                <span className="font-bold sm:inline-block">PDF Tools</span>
            </Link>
        </div>
      </div>
    </header>
  );
};