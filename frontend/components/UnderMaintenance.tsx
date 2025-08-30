import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HardHat } from 'lucide-react';

export const UnderMaintenance = ({ toolName }: { toolName: string }) => {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">
                    <HardHat className="h-10 w-10 text-secondary-foreground" />
                </div>
                <CardTitle className="text-3xl md:text-4xl">Tool Under Maintenance</CardTitle>
                <CardDescription className="text-md md:text-lg">
                    We're sorry for the inconvenience.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">
                    The "{toolName}" tool is currently unavailable as we work on making it more reliable. Please check back later. We appreciate your patience!
                </p>
            </CardContent>
        </Card>
    )
}