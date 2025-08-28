import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="bg-secondary text-secondary-foreground py-12">
            <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold mb-4">PDF Tools</h3>
                    <nav className="flex flex-col space-y-2">
                        <Link href="/en" className="hover:underline">Home</Link>
                        <Link href="/en/tools" className="hover:underline">All Tools</Link>
                        <Link href="/en/blog" className="hover:underline">Blog</Link>
                        <Link href="/en/contact" className="hover:underline">Contact</Link>
                    </nav>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Quick Links</h3>
                     <nav className="flex flex-col space-y-2">
                        <Link href="/en" className="hover:underline">Home</Link>
                        <Link href="/en/tools" className="hover:underline">All Tools</Link>
                        <Link href="/en/blog" className="hover:underline">Blog</Link>
                        <Link href="/en/contact" className="hover:underline">Contact</Link>
                    </nav>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Popular Tools</h3>
                     <nav className="flex flex-col space-y-2">
                        <Link href="/en/merge" className="hover:underline">Merge PDF</Link>
                        <Link href="/en/split" className="hover:underline">Split PDF</Link>
                        <Link href="/en/compress" className="hover:underline">Compress PDF</Link>
                        <Link href="/en/pdf-to-jpg" className="hover:underline">PDF to JPG</Link>
                    </nav>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Legal</h3>
                     <nav className="flex flex-col space-y-2">
                        <Link href="/en/privacy-policy" className="hover:underline">Privacy Policy</Link>
                        <Link href="/en/terms-of-service" className="hover:underline">Terms of Service</Link>
                        <Link href="/en/cookie-policy" className="hover:underline">Cookie Policy</Link>
                    </nav>
                </div>
            </div>
            <div className="container mx-auto mt-8 pt-8 border-t border-border text-center">
                <p>&copy; {new Date().getFullYear()} YourDomain. All rights reserved.</p>
            </div>
        </footer>
    )
}