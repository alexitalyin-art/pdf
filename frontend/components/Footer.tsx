import Link from 'next/link';
import LanguageSwitcher from './LanguageSwitcher'; // Import the new component

export const Footer = () => {
    return (
        <footer className="bg-secondary text-secondary-foreground py-12">
            <div className="container mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
                <div>
                    <h3 className="font-bold mb-4">A2Z Tool</h3>
                    <nav className="flex flex-col space-y-2">
                        <Link href="/en" className="hover:underline text-sm">Home</Link>
                        <Link href="/en/tools" className="hover:underline text-sm">All Tools</Link>
                        <Link href="/en/blog" className="hover:underline text-sm">Blog</Link>
                        <Link href="/en/contact" className="hover:underline text-sm">Contact</Link>
                    </nav>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Quick Links</h3>
                     <nav className="flex flex-col space-y-2">
                        <Link href="/en" className="hover:underline text-sm">Home</Link>
                        <Link href="/en/tools" className="hover:underline text-sm">All Tools</Link>
                     </nav>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Popular Tools</h3>
                     <nav className="flex flex-col space-y-2">
                        <Link href="/en/merge" className="hover:underline text-sm">Merge PDF</Link>
                        <Link href="/en/split" className="hover:underline text-sm">Split PDF</Link>
                        <Link href="/en/compress" className="hover:underline text-sm">Compress PDF</Link>
                        <Link href="/en/sign" className="hover:underline text-sm">Sign PDF</Link>
                    </nav>
                </div>
                <div>
                    <h3 className="font-bold mb-4">Legal</h3>
                     <nav className="flex flex-col space-y-2">
                        <Link href="/en/privacy-policy" className="hover:underline text-sm">Privacy Policy</Link>
                        <Link href="/en/terms-of-service" className="hover:underline text-sm">Terms of Service</Link>
                        <Link href="/en/cookie-policy" className="hover:underline text-sm">Cookie Policy</Link>
                    </nav>
                </div>
                {/* --- THIS IS THE NEW PART --- */}
                <div className="col-span-2 md:col-span-1 flex md:justify-end items-start">
                    <LanguageSwitcher />
                </div>
            </div>
            <div className="container mx-auto mt-8 pt-8 border-t border-border text-center text-sm">
                <p>&copy; {new Date().getFullYear()} A2Z Tool. All rights reserved.</p>
            </div>
        </footer>
    )
}