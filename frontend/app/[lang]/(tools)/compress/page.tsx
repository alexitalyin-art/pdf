import { UnderMaintenance } from '@/components/UnderMaintenance';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compress PDF | A2Z Tool',
  description: 'The Compress PDF tool is temporarily unavailable. We are working on improving it.',
};

export default function CompressPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <UnderMaintenance toolName="Compress PDF" />
    </div>
  );
}