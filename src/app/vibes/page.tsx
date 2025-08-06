"use client";

import { useState, useEffect } from 'react';
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/app/_trpc/providers";
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, 
  Brain, 
  Code2, 
  Eye, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Zap,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

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

function VibeCard({ vibe }: { vibe: Vibe }) {
  const getStatusIcon = () => {
    switch (vibe.status) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'PENDING':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = () => {
    switch (vibe.status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'FAILED': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'PENDING': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-purple-300 transition-colors">
              {vibe.prompt}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {format(new Date(vibe.createdAt), 'PPp')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getStatusColor()}>
              {getStatusIcon()}
              {vibe.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-gray-300">
          {vibe.model && (
            <div className="flex items-center gap-1">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>{vibe.model}</span>
            </div>
          )}
          {vibe.provider && (
            <Badge variant="outline" className="border-white/20 text-gray-300">
              {vibe.provider}
            </Badge>
          )}
          {vibe.metadata?.executionTime && (
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>{(vibe.metadata.executionTime / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>

        {vibe.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-300 text-sm">{vibe.error}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          {vibe.status === 'COMPLETED' && (
            <>
              <Button size="sm" asChild className="bg-purple-600 hover:bg-purple-700">
                <Link href={`/vibes/${vibe.id}/preview`}>
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Link>
              </Button>
              {vibe.metadata?.sandboxUrl && (
                <Button size="sm" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                  <a href={vibe.metadata.sandboxUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Live Demo
                  </a>
                </Button>
              )}
            </>
          )}
          {vibe.code && (
            <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Code2 className="w-4 h-4 mr-1" />
              View Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
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

  const completedCount = vibes?.filter((v: Vibe) => v.status === 'COMPLETED').length || 0;
  const pendingCount = vibes?.filter((v: Vibe) => v.status === 'PENDING').length || 0;
  const failedCount = vibes?.filter((v: Vibe) => v.status === 'FAILED').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <main className="relative z-10 flex min-h-screen flex-col items-center px-4 py-8 lg:px-24">
        {/* Header */}
        <header className="w-full max-w-6xl flex flex-col lg:flex-row justify-between items-center gap-4 mb-12">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                My Vibes
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild className="border-white/20 text-white hover:bg-white/10">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Stats Cards */}
        {vibes && vibes.length > 0 && (
          <div className="w-full max-w-6xl grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{completedCount}</div>
                <div className="text-sm text-gray-300">Completed</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">{pendingCount}</div>
                <div className="text-sm text-gray-300">In Progress</div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-400">{failedCount}</div>
                <div className="text-sm text-gray-300">Failed</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Content */}
        <div className="w-full max-w-6xl">
          {isLoading ? (
            <div className="space-y-6">
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                  <span className="text-xl text-white">Loading your vibes...</span>
                </div>
              </div>
              {/* Loading skeletons */}
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white/5 backdrop-blur-lg border-white/10">
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-white/10" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : vibes && vibes.length > 0 ? (
            <div className="grid gap-6">
              {vibes.map((vibe: Vibe) => (
                <VibeCard key={vibe.id} vibe={vibe} />
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 text-center py-16">
              <CardContent>
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No Vibes Yet</h3>
                <p className="text-gray-300 mb-8 max-w-md mx-auto">
                  You haven&apos;t generated any applications yet. Start creating amazing apps with AI!
                </p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Link href="/">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Your First Vibe
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

