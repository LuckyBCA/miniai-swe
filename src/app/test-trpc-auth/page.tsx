"use client";

import { useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { trpc } from '@/app/_trpc/providers';

export default function TestTRPCAuth() {
  const { isLoaded, userId } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  
  // Example of calling a protected procedure (we'll use inngest.send as an example)
  const testMutation = trpc.inngest.send.useMutation({
    onSuccess: (data) => {
      setTestResult({ success: true, data });
    },
    onError: (error) => {
      setTestResult({ success: false, error: error.message });
    },
  });

  const testProtectedProcedure = async () => {
    // This will test if authentication is working with tRPC
    const result = await testMutation.mutate({
      prompt: "Generate a simple React component",
      model: "Vibe-S",
    });
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">tRPC Auth Test</h1>
      <p>User ID: {userId || 'Not authenticated'}</p>
      
      <button 
        onClick={testProtectedProcedure}
        disabled={!userId || testMutation.isPending}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {testMutation.isPending ? 'Testing...' : 'Test Protected Procedure'}
      </button>
      
      {testResult && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Test Result:</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
