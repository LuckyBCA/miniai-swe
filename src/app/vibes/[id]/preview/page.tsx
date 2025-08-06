import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PreviewControls } from "@/components/preview/preview-controls";
import { ArrowLeft } from "lucide-react";

// Get vibe data with auth check
async function getVibe(id: string, userId: string) {
  const vibe = await prisma.vibe.findUnique({
    where: { id }
  });
  
  if (!vibe || vibe.userId !== userId) {
    return null;
  }
  
  return vibe;
}

// Get metadata for a vibe using raw query to handle the JSON field
async function getVibeMetadata(vibeId: string) {
  // Use raw query to get the metadata as JSON
  const result = await prisma.$queryRaw`SELECT metadata FROM "Vibe" WHERE id = ${vibeId}`;
  
  if (Array.isArray(result) && result.length > 0) {
    return result[0].metadata || null;
  }
  
  return null;
}

// Preview URL display component
function PreviewUrlDisplay({ metadata }: { metadata: any }) {
  if (!metadata || !metadata.previewUrl) {
    return <p className="text-sm text-muted-foreground">No preview available yet.</p>;
  }
  
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Preview URL:</p>
      <div className="flex items-center gap-2">
        <input 
          type="text" 
          value={metadata.previewUrl} 
          readOnly 
          className="flex-1 p-2 text-sm border rounded-md" 
        />
        <Button 
          size="sm" 
          onClick={() => window.open(metadata.previewUrl, '_blank')}
        >
          Open
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Last updated: {new Date(metadata.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
}

// Main page component
export default async function VibeSandboxPreview({ params }: { params: { id: string } }) {
  const { userId } = auth();
  
  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please sign in to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  const vibe = await getVibe(params.id, userId);
  
  if (!vibe) {
    notFound();
  }
  
  // Get metadata from raw query
  const metadata = await getVibeMetadata(vibe.id);
  const hasPreview = metadata && metadata.previewUrl && metadata.sandboxId;
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/vibes/${vibe.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Sandbox Preview</h1>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vibe Details</CardTitle>
            <CardDescription>
              {vibe.prompt}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Status:</p>
                <p className="text-sm">{vibe.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Created:</p>
                <p className="text-sm">{vibe.createdAt.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Sandbox Preview</CardTitle>
            <CardDescription>
              Create a live preview of your generated code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-20 w-full" />}>
              <PreviewUrlDisplay metadata={metadata} />
            </Suspense>
          </CardContent>
          <CardFooter>
            <PreviewControls 
              vibeId={vibe.id} 
              userId={userId} 
              sandboxId={metadata?.sandboxId} 
              hasPreview={!!hasPreview}
            />
          </CardFooter>
        </Card>
      </div>
      
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Generated Code</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
              {vibe.code || "No code available"}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
