"use client";

import { useState, useEffect } from 'react';
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/app/_trpc/providers";
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

// Define the Vibe type to match your database schema
interface Vibe {
  id: string;
  prompt: string;
  status: string;
  createdAt: Date;
  model: string | null;
  code: string | null;
  userId: string;
  provider: string | null;
  updatedAt: Date;
  error?: string | null;
  metadata?: {
    sandboxUrl?: string;
    executionTime?: number;
  } | null;
}

export default function VibesPage() {
  const { data: vibes, isLoading, refetch } = trpc.vibes.list.useQuery();

  // Set up periodic refresh (every 5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">MiniAI</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            Home
          </Link>
          <Link href="/debug" className="text-green-400 hover:text-green-300 transition-colors">
            Debug
          </Link>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="z-10 w-full max-w-5xl items-center font-mono">
        <h2 className="text-3xl mb-8 font-bold">Your Generated Vibes</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading your vibes...</span>
          </div>
        ) : vibes && vibes.length > 0 ? (
          <div className="grid gap-8">
            {vibes.map((vibe: Vibe) => (
              <VibeCard key={vibe.id} vibe={vibe} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="mb-4">You haven't generated any vibes yet.</p>
            <Link 
              href="/" 
              className="inline-block px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Generate Your First Vibe
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function VibeCard({ vibe }: { vibe: Vibe }) {
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  // Format the date
  const formattedDate = new Date(vibe.createdAt).toLocaleString();
  
  // Get status styling
  const getStatusBadge = () => {
    switch (vibe.status) {
      case 'PENDING':
        return <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs">Pending</span>;
      case 'COMPLETED':
        return <span className="bg-green-500 text-black px-2 py-1 rounded text-xs">Completed</span>;
      case 'FAILED':
        return <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Failed</span>;
      default:
        return <span className="bg-gray-500 px-2 py-1 rounded text-xs">{vibe.status}</span>;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold">{vibe.prompt}</h3>
        {getStatusBadge()}
      </div>
      
      <div className="mb-4 text-gray-400 text-sm">
        <p>Model: {vibe.model}</p>
        <p>Created: {formattedDate}</p>
        {vibe.metadata?.executionTime && (
          <p>Execution time: {(vibe.metadata.executionTime / 1000).toFixed(2)}s</p>
        )}
      </div>
      
      {/* Sandbox URL */}
      {vibe.metadata?.sandboxUrl && (
        <div className="mb-4 p-3 bg-gray-700 rounded">
          <p className="text-sm text-gray-300 mb-2">Sandbox URL:</p>
          <a 
            href={vibe.metadata.sandboxUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 break-all"
          >
            {vibe.metadata.sandboxUrl}
          </a>
        </div>
      )}
      
      {/* Error Display */}
      {vibe.error && (
        <div className="mb-4 p-3 bg-red-900/30 text-red-200 rounded">
          <p className="font-semibold mb-1">Error:</p>
          <p className="text-sm">{vibe.error}</p>
        </div>
      )}
      
      {/* Code Section */}
      {vibe.code && (
        <>
          <button 
            onClick={() => setIsCodeVisible(!isCodeVisible)}
            className="mb-2 text-blue-400 hover:text-blue-300 text-sm flex items-center"
          >
            {isCodeVisible ? 'Hide' : 'Show'} Generated Code
          </button>
          
          {isCodeVisible && (
            <div className="p-4 bg-gray-900 rounded overflow-x-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                {vibe.code}
              </pre>
            </div>
          )}
        </>
      )}
    </div>
  );
}
