import { Unlocker } from "@/components/Unlocker";
import type { Metadata } from 'next';

// SEO METADATA
export const metadata: Metadata = {
  title: 'Unlock PDF | Free Online Tool to Remove PDF Passwords',
  description: 'Easily remove the password from a protected PDF file online. If you know the password, our free tool can create an unlocked version in seconds. Secure and browser-based.',
  keywords: 'unlock pdf, remove pdf password, decrypt pdf, pdf password remover, free pdf unlocker',
};

export default function UnlockPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Unlock PDF</h1>
        <p className="text-md md:text-lg text-muted-foreground mt-2">
          Remove the password from your PDF file (password required).
        </p>
      </div>

      {/* Interactive Client Component */}
      <Unlocker />

      {/* SEO CONTENT */}
      <div className="prose dark:prose-invert max-w-4xl mx-auto mt-12">
        <h2>How to Unlock a PDF File</h2>
        <p>
          Our free online tool makes it simple to remove password protection from your PDF files, creating a version that no longer requires a password to open. This process is safe, secure, and happens entirely within your browser.
        </p>
        <ol>
          <li>Drag and drop your password-protected PDF file into the upload area, or click to select it.</li>
          <li>Enter the current password for the PDF file in the text field.</li>
          <li>Click the "Unlock PDF" button.</li>
          <li>Your new, unlocked PDF will be generated and a download link will appear.</li>
        </ol>

        <h3>Is it Safe to Unlock my PDF Online?</h3>
        <p>
          Yes. Your security is our top priority. Because this tool runs entirely in your browser, your PDF file is **never uploaded to a server**. All processing is done on your own computer, ensuring your sensitive documents remain private.
        </p>
      </div>
    </div>
  );
}