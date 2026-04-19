import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md border-border/50 shadow-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-3">
            <AlertCircle className="h-8 w-8 shrink-0 text-destructive" />
            <h1 className="text-2xl font-bold tracking-tight">404 — Page not found</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The page you are looking for does not exist or was moved.
          </p>

          <Button asChild className="mt-6">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
