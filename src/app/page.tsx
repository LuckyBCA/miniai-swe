"use client";

import { useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/app/_trpc/providers";
import type { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { getAvailableModels, BrandedModel } from '@/lib/ai-models';
import { toast } from 'sonner';
import { MessageInterface } from '@/components/MessageInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Zap, Brain, Rocket, Code2, Palette, Star, AlertTriangle } from "lucide-react";

const availableModels = getAvailableModels();

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<BrandedModel>(availableModels[0]);
  const [selectedModelId, setSelectedModelId] = useState<string>(availableModels[0].id);

  // Fetch credit status
  const { data: creditStatus, refetch: refetchCredits } = trpc.credits.getStatus.useQuery();

  const { mutate, isPending } = trpc.inngest.send.useMutation({
    onSuccess: (data) => {
      toast.success(
        'Generation started!', 
        {
          description: `${data.creditsRemaining} credits remaining. Check "View My Vibes" to see results.`,
          duration: 5000,
          action: {
            label: 'View',
            onClick: () => window.location.href = '/vibes'
          }
        }
      );
      setPrompt('');
      refetchCredits(); // Refresh credit status after successful generation
    },
    onError: (error) => {
      const errorMessage = error.message;
      if (errorMessage.includes('credit')) {
        toast.error(errorMessage, {
          action: {
            label: 'Upgrade',
            onClick: () => window.location.href = '/upgrade'
          }
        });
      } else {
        toast.error('Failed to start generation.');
      }
      console.error(error);
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    
    // Check if user has enough credits before submitting
    if (creditStatus && creditStatus.current < 5) {
      toast.error('Not enough credits for app generation', {
        action: {
          label: 'Upgrade',
          onClick: () => window.location.href = '/upgrade'
        }
      });
      return;
    }
    
    mutate({ prompt, model: selectedModelId });
  };

  const examples = [
    { icon: <Code2 className="w-5 h-5" />, text: "Build a modern dashboard with dark theme" },
    { icon: <Palette className="w-5 h-5" />, text: "Create a portfolio website with animations" },
    { icon: <Sparkles className="w-5 h-5" />, text: "Design a landing page for a SaaS product" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
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
                MiniAI
              </h1>
            </div>
            <Badge variant="secondary" className="hidden lg:flex bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Credit Status */}
            {creditStatus && (
              <Card className="bg-white/5 backdrop-blur-lg border-white/10 p-3">
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-300">Credits</div>
                    <div className="text-lg font-bold text-white">
                      {creditStatus.current}/{creditStatus.daily}
                    </div>
                  </div>
                  <Progress 
                    value={(creditStatus.current / creditStatus.daily) * 100} 
                    className="w-16 h-2"
                  />
                  {!creditStatus.isPremuim && creditStatus.current < 10 && (
                    <Button size="sm" variant="secondary" asChild className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      <a href="/upgrade">
                        <Star className="w-3 h-3 mr-1" />
                        Upgrade
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            )}
            
            <Button variant="outline" size="sm" asChild className="border-white/20 text-white hover:bg-white/10">
              <a href="/vibes">
                <Brain className="w-4 h-4 mr-2" />
                My Vibes
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="border-white/20 text-white hover:bg-white/10">
              <a href="/debug">
                <Code2 className="w-4 h-4 mr-2" />
                Debug
              </a>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl">
          <h2 className="text-3xl lg:text-6xl font-bold text-white mb-4">
            Build Your Next
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> Startup</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Transform your ideas into working applications with nothing more than a sentence.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="w-full max-w-6xl grid lg:grid-cols-3 gap-8">
          {/* Generation Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  Generate Your Application
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Describe what you want to build and watch AI create it for you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Credit Warning */}
                {creditStatus && creditStatus.current < 5 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-yellow-300 font-medium">Low Credits Warning</p>
                        <p className="text-yellow-200 text-sm">
                          You have {creditStatus.current} credits remaining. App generation costs 5 credits.
                          {!creditStatus.isPremuim && (
                            <span> <a href="/upgrade" className="underline hover:text-yellow-100">Upgrade to Premium</a> for unlimited access!</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">What would you like to build?</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="e.g., A modern e-commerce dashboard with real-time analytics, dark theme, and beautiful charts..."
                      className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400/50 focus:ring-purple-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-200">AI Model</label>
                    <Select
                      value={selectedModelId}
                      onValueChange={(value) => {
                        setSelectedModelId(value);
                        const model = availableModels.find(m => m.id === value);
                        if (model) setSelectedModel(model);
                      }}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/20">
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id} className="text-white hover:bg-white/10">
                            <div className="flex items-center justify-between w-full">
                              <span>{model.name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {model.provider}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-400">{selectedModel.description}</p>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending || !prompt.trim() || (creditStatus && creditStatus.current < 5)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-gray-600 disabled:to-gray-700"
                    size="lg"
                  >
                    {isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Generating Magic...
                      </>
                    ) : (creditStatus && creditStatus.current < 5) ? (
                      <>
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Insufficient Credits (Need 5)
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Application (5 Credits)
                      </>
                    )}
                  </Button>
                </form>

                {/* Example Prompts */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm font-medium text-gray-200 mb-3">Try these examples:</p>
                  <div className="space-y-2">
                    {examples.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(example.text)}
                        className="flex items-center gap-3 w-full p-3 text-left bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
                      >
                        <div className="text-purple-400">{example.icon}</div>
                        {example.text}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Interface */}
          <div className="lg:col-span-1">
            <MessageInterface />
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl mt-16 grid md:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-300 text-sm">Advanced AI models generate production-ready code from natural language.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-gray-300 text-sm">Generate complete applications in seconds with live preview URLs.</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Production Ready</h3>
              <p className="text-gray-300 text-sm">Generated code follows best practices and is ready for deployment.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
