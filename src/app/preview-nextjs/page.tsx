'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PreviewNextJSPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSandbox = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Trigger the Inngest function through an API endpoint
      const response = await fetch('/api/inngest/trigger-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Show success message
        setSandboxUrl(data.sandboxUrl);
      } else {
        setError(data.error || 'Failed to create sandbox');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Next.js Sandbox Preview</h1>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create a Next.js Sandbox</CardTitle>
          <CardDescription>
            Launch a sandbox environment to preview a Next.js application
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {sandboxUrl ? (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Sandbox created successfully!
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label htmlFor="sandbox-url">Sandbox URL</Label>
                <div className="flex space-x-2">
                  <Input 
                    id="sandbox-url"
                    value={sandboxUrl}
                    readOnly
                  />
                  <Button
                    onClick={() => window.open(sandboxUrl, '_blank')}
                    variant="outline"
                  >
                    Open
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="mb-4">Click the button below to create a new sandbox with a Next.js template.</p>
              <Button 
                onClick={handleCreateSandbox} 
                disabled={isLoading}
              >
                {isLoading ? 'Creating Sandbox...' : 'Create Sandbox'}
              </Button>
            </div>
          )}
        </CardContent>
        
        {sandboxUrl && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => {
              setSandboxUrl(null);
              setError(null);
            }}>
              Create Another
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
