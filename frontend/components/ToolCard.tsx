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
      <Card className="h-full hover:border-blue-500 hover:bg-gray-50 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gray-100 group-hover:bg-blue-100 rounded-lg transition-colors duration-300">
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