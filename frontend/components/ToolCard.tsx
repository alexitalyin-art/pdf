import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: JSX.Element;
}

export const ToolCard = ({ title, description, href, icon }: ToolCardProps) => {
  return (
    <Link href={href} className="block group">
      {/* --- THIS IS THE CHANGE --- */}
      {/* Added classes for a smooth transition, shadow, and lift effect on hover */}
      <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-secondary rounded-lg">
              {icon}
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
};