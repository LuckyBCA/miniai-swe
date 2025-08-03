"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/providers";

type TestResults = {
  gemini?: any;
  error?: string;
  [key: string]: any;
};

const DEFAULT_MODEL = 'gemini-1.5-flash';

export default function TestAIPage() {
  const [prompt, setPrompt] = useState("Create a simple React button component with Tailwind CSS");
  const [results, setResults] = useState<TestResults>({});
  const [isLoading, setIsLoading] = useState(false);

  const sendInngestMutation = trpc.inngest.send.useMutation({
    onSuccess: (data) => {
      console.log("Inngest job started:", data);
      setResults(prev => ({ ...prev, jobId: data.jobId }));
    },
    onError: (error) => {
      console.error("Inngest error:", error);
      setResults(prev => ({ ...prev, error: error.message }));
      setIsLoading(false);
    },
  });

  const testGemini = async () => {
    if (!prompt.trim()) {
      setResults({ error: "Please enter a prompt" });
      return;
    }

    setIsLoading(true);
    setResults({ status: "Sending request..." });

    try {
      const result = await sendInngestMutation.mutateAsync({
        prompt,
        model: DEFAULT_MODEL,
      });
      
      setResults(prev => ({
        ...prev,
        gemini: result,
        status: "Request sent successfully",
        timestamp: new Date().toISOString(),
      }));
    } catch (error: unknown) {
      console.error("Gemini test failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setResults(prev => ({
        ...prev,
        error: errorMessage,
        status: "Request failed"
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Gemini Integration Test</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Test Prompt:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border rounded-lg h-32"
          placeholder="Enter your test prompt..."
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={testGemini}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg text-white ${
            isLoading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Processing...' : 'Test Gemini Integration'}
        </button>
      </div>

      {isLoading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 rounded-lg">
          <p className="text-blue-800">Sending request to Gemini... This may take a moment.</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-3">Test Results</h2>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(results, null, 2) || "No results yet"}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Enter your prompt in the text area above</li>
          <li>Click "Test Gemini Integration" to send the request</li>
          <li>Check the results section below for the response</li>
          <li>Monitor the Inngest dashboard at localhost:8288/runs to see job progress</li>
          <li>Check the terminal for any error messages</li>
        </ol>
      </div>
    </div>
  );
}
