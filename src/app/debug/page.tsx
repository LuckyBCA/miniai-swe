"use client";

import { useState, useEffect } from 'react';
import { UserButton } from "@clerk/nextjs";
import Link from 'next/link';

// Test Job Form Component
function TestJobForm() {
  const [prompt, setPrompt] = useState('console.log("Hello World!");');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; jobId?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch('/api/debug/trigger-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, model }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">Test Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-sm"
            rows={3}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="p-2 bg-gray-700 border border-gray-600 rounded w-full"
          >
            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
            <option value="gemini-1.0-pro">Gemini 1.0 Pro</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded text-white ${
            isSubmitting ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Triggering...' : 'Trigger Test Job'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-800/30' : 'bg-red-800/30'}`}>
          {result.success ? (
            <div>
              <p className="font-semibold text-green-300">Job triggered successfully!</p>
              <p className="text-sm text-gray-300">Job ID: {result.jobId}</p>
              <p className="text-xs mt-2">Check the logs below and the Vibes page for results.</p>
            </div>
          ) : (
            <p className="text-red-300">{result.error || 'Unknown error occurred'}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch('/api/debug/logs');
        const data = await response.json();
        setLogs(data.logs || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLogs(["Error loading logs"]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-900 text-white">
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-bold">MiniAI</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            Home
          </Link>
          <Link href="/vibes" className="text-blue-400 hover:text-blue-300 transition-colors">
            View Vibes
          </Link>
        </div>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="z-10 w-full max-w-5xl items-center font-mono">
        <h2 className="text-3xl mb-8 font-bold">System Debug</h2>
        
        <div className="mb-8">
          <h3 className="text-xl mb-2">Inngest Status</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <p>Inngest Dev URL: <code className="bg-gray-700 px-2 py-1 rounded">http://localhost:3000/api/inngest</code></p>
            <p className="mt-2">Functions:</p>
            <ul className="list-disc pl-6 mt-1">
              <li>generate-vibe</li>
              <li>generate-with-agent</li>
            </ul>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl mb-2">E2B Sandbox</h3>
          <div className="bg-gray-800 rounded-lg p-4">
            <p>Template ID: <code className="bg-gray-700 px-2 py-1 rounded">5iyfxo657up507oy9eay</code></p>
            <p className="mt-2">Template Name: <code className="bg-gray-700 px-2 py-1 rounded">miniai-swe-v3</code></p>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-xl mb-2">Test Job Manually</h3>
          <TestJobForm />
        </div>

        <div>
          <h3 className="text-xl mb-2">System Logs</h3>
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto p-4 font-mono text-sm">
              {isLoading ? (
                <p className="text-gray-400">Loading logs...</p>
              ) : logs.length > 0 ? (
                logs.map((log, i) => (
                  <pre key={i} className="text-gray-300 mb-1 whitespace-pre-wrap break-words">
                    {log}
                  </pre>
                ))
              ) : (
                <p className="text-gray-400">No logs available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
