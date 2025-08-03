"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function TestAuth() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [apiTestResult, setApiTestResult] = useState<object | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (isLoaded && userId) {
        const token = await getToken();
        setToken(token);
      }
    };

    fetchToken();
  }, [isLoaded, userId, getToken]);

  const testApiAuth = async () => {
    try {
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      setApiTestResult(data);
    } catch (error: any) {
      setApiTestResult({ error: error.message });
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Auth Test</h1>
      <p>User ID: {userId}</p>
      <p>Session ID: {sessionId}</p>
      <p>Token: {token ? "Available" : "Not available"}</p>
      <button onClick={testApiAuth}>Test API Auth</button>
      {apiTestResult && (
        <div>
          <h2>API Test Result:</h2>
          <pre>{JSON.stringify(apiTestResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
