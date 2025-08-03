"use client";

import { useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import { trpc } from "@/app/_trpc/providers";
import type { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { getAvailableModels, BrandedModel } from '@/lib/ai-models';
import { toast } from 'sonner';

const availableModels = getAvailableModels();

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<BrandedModel>(availableModels[0].name);

  const { mutate, isPending } = trpc.inngest.send.useMutation({
    onSuccess: () => {
      toast.success('Generation started!');
      setPrompt('');
    },
    onError: (error) => {
      toast.error('Failed to start generation.');
      console.error(error);
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    mutate({ prompt, model: selectedModel });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-gray-900 text-white">
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h1 className="text-4xl font-bold">MiniAI</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mt-12">
        <div className="w-full">
          <h2 className="text-2xl mb-4">Generate a new Vibe</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A login form with a dark theme and a neon blue button"
              className="p-4 bg-gray-800 border border-gray-700 rounded-md w-full h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center gap-4">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as BrandedModel)}
                className="p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableModels.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isPending || !prompt.trim()}
                className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 transition-colors flex-grow"
              >
                {isPending ? "Generating..." : "Generate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
