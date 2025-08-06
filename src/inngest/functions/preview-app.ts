import { inngest } from "../client";
import { getSandbox, getSandboxUrl } from "../utils";
import db from "@/lib/db";
import { addLog } from "@/lib/debug-logger";

// Define the event data interface
interface PreviewAppEventData {
  userId: string;
  appName: string;
  projectId?: string;
  customization?: {
    theme?: string;
    packages?: string[];
    template?: string;
  };
}

// Define the response interface
interface PreviewAppResult {
  success: boolean;
  sandboxUrl?: string;
  previewUrl?: string;
  error?: string;
  appName: string;
  sandboxId?: string;
}

// Create the Inngest function for previewing Next.js apps
export const previewNextjsApp = inngest.createFunction(
  { id: "preview-nextjs-app" },
  { event: "app/preview.nextjs.app" },
  async ({ event, step }) => {
    // Extract data from the event
    const { userId, appName, projectId, customization } = 
      event.data as PreviewAppEventData;
    
    // Initialize the result
    let result: PreviewAppResult = {
      success: false,
      appName,
    };

    try {
      // Log the start of the preview process
      addLog(`Starting Next.js app preview for user ${userId} with app name ${appName}`);

      // Record the preview attempt in the database
      const preview = await step.run("create-preview-record", async () => {
        return await db.sandboxPreview.create({
          data: {
            userId,
            appName,
            status: "PENDING",
            projectId,
          },
        });
      });

      // Get a sandbox using the Next.js template
      const sandboxId = "5iyfxo657up507oy9eay"; // Your template ID
      const sandbox = await step.run("create-sandbox", async () => {
        addLog(`Creating sandbox with template ID: ${sandboxId}`);
        return await getSandbox(sandboxId);
      });

      // Set up basic Next.js app with a custom page
      await step.run("setup-nextjs-app", async () => {
        // Create a simple Next.js app page
        await sandbox.filesystem.write('code/app.js', `
// Simple Next.js app
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
`);

        // Create a simple page component
        await sandbox.filesystem.write('code/pages/index.js', `
import { useState } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#0070f3' }}>${appName} - Preview</h1>
      <p>This is a preview of your Next.js application.</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eaeaea', borderRadius: '5px' }}>
        <h2>Interactive Counter</h2>
        <p>Count: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Increment
        </button>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <p>Created at: {new Date().toLocaleString()}</p>
        <p>App name: ${appName}</p>
      </div>
    </div>
  );
}
`);

        // Create a custom _app.js file for global styles
        await sandbox.filesystem.write('code/pages/_app.js', `
import React from 'react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{\`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      \`}</style>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
`);

        // Install dependencies
        const installProcess = await sandbox.process.start({
          cmd: 'cd /home/user && npm install next react react-dom',
          onStdout: (data) => console.log('Install stdout:', data.line),
          onStderr: (data) => console.error('Install stderr:', data.line),
        });

        const installResult = await installProcess.wait();
        if (installResult.exitCode !== 0) {
          throw new Error(`Failed to install dependencies: ${installResult.stderr}`);
        }

        // Create next.config.js file
        await sandbox.filesystem.write('code/next.config.js', `
module.exports = {
  reactStrictMode: true,
};
`);

        // Create package.json
        await sandbox.filesystem.write('code/package.json', `
{
  "name": "${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  }
}
`);

        // Start the Next.js development server
        const startProcess = await sandbox.process.start({
          cmd: 'cd /home/user && npx next dev',
          onStdout: (data) => console.log('Next.js stdout:', data.line),
          onStderr: (data) => console.error('Next.js stderr:', data.line),
        });

        // Wait a bit to make sure the server starts
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Get the sandbox URL
        const sandboxUrl = getSandboxUrl(sandboxId);
        if (!sandboxUrl) {
          throw new Error('Failed to get sandbox URL');
        }

        // Return the sandbox information
        return {
          sandboxId,
          sandboxUrl,
          previewUrl: `${sandboxUrl}:3000`,
        };
      });

      // Update the preview record with success
      await step.run("update-preview-record", async () => {
        const updateData = {
          status: "COMPLETED",
          metadata: {
            sandboxId: sandbox.sandboxId,
            sandboxUrl: sandbox.sandboxUrl,
            previewUrl: sandbox.previewUrl,
            completedAt: new Date().toISOString(),
          },
        };

        return await db.sandboxPreview.update({
          where: { id: preview.id },
          data: updateData,
        });
      });

      // Set the result to success
      result = {
        success: true,
        appName,
        sandboxId: sandbox.sandboxId,
        sandboxUrl: sandbox.sandboxUrl,
        previewUrl: sandbox.previewUrl,
      };

    } catch (error) {
      // Handle errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addLog(`Error in previewNextjsApp: ${errorMessage}`, 'error');

      // Update the preview record with failure
      try {
        await db.sandboxPreview.update({
          where: { id: preview?.id },
          data: {
            status: "FAILED",
            error: errorMessage,
          },
        });
      } catch (dbError) {
        addLog(`Failed to update preview record: ${dbError}`, 'error');
      }

      // Set the error in the result
      result.error = errorMessage;
    }

    return result;
  }
);
