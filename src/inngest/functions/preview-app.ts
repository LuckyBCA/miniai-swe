import { inngest } from "../client";
import { addLog } from "@/lib/debug-logger";
import db from "@/lib/db";
import { Sandbox } from "@e2b/code-interpreter";

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

    let preview: any = null;

    try {
      // Log the start of the preview process
      addLog(`Starting Next.js app preview for user ${userId} with app name ${appName}`);

      // Record the preview attempt in the database
      preview = await step.run("create-preview-record", async () => {
        return await db.sandboxPreview.create({
          data: {
            userId,
            appName,
            status: "PENDING",
            projectId,
          },
        });
      });

      // Create a new E2B sandbox for code execution
      const sandbox = await step.run("create-sandbox", async () => {
        addLog(`Creating E2B Code Interpreter sandbox`);
        return await Sandbox.create({
          apiKey: process.env.E2B_API_KEY,
          timeoutMs: 300000, // 5 minutes
        });
      }) as Sandbox;

      // Set up basic Next.js app with a custom page
      const sandboxResult = await step.run("setup-nextjs-app", async () => {
        // Create a simple Next.js app structure using runCode
        const setupCode = `
import os
import subprocess

# Create the project structure
os.makedirs('/tmp/nextjs-app/pages', exist_ok=True)
os.makedirs('/tmp/nextjs-app/public', exist_ok=True)

# Create package.json
package_json = '''
{
  "name": "${appName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest"
  }
}
'''

with open('/tmp/nextjs-app/package.json', 'w') as f:
    f.write(package_json)

# Create the main page component
index_js = '''
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
'''

with open('/tmp/nextjs-app/pages/index.js', 'w') as f:
    f.write(index_js)

# Create _app.js
app_js = '''
import React from 'react';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{\`
        html, body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        * { box-sizing: border-box; }
      \`}</style>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
'''

with open('/tmp/nextjs-app/pages/_app.js', 'w') as f:
    f.write(app_js)

# Create next.config.js
config_js = '''
module.exports = {
  reactStrictMode: true,
};
'''

with open('/tmp/nextjs-app/next.config.js', 'w') as f:
    f.write(config_js)

print("Next.js app structure created successfully!")
print("Files created:")
print("- /tmp/nextjs-app/package.json")
print("- /tmp/nextjs-app/pages/index.js") 
print("- /tmp/nextjs-app/pages/_app.js")
print("- /tmp/nextjs-app/next.config.js")
`;

        // Execute the setup code
        const setupResult = await sandbox.runCode(setupCode);
        console.log('Setup result:', setupResult);
        
        // Install dependencies and start the Next.js server
        const installAndStartCode = `
import subprocess
import os
import time
import threading

os.chdir('/tmp/nextjs-app')

# Install dependencies
print("Installing dependencies...")
install_result = subprocess.run(['npm', 'install'], capture_output=True, text=True)
print("Install stdout:", install_result.stdout)
if install_result.stderr:
    print("Install stderr:", install_result.stderr)

if install_result.returncode != 0:
    raise Exception(f"Failed to install dependencies: {install_result.stderr}")

print("Dependencies installed successfully!")

# Start the development server in the background
def start_server():
    print("Starting Next.js development server...")
    process = subprocess.Popen(['npm', 'run', 'dev'], 
                             stdout=subprocess.PIPE, 
                             stderr=subprocess.PIPE, 
                             text=True)
    
    # Log output
    for line in process.stdout:
        print(f"Server: {line.strip()}")
        if "Ready" in line or "Local:" in line:
            break

# Start server in background thread
server_thread = threading.Thread(target=start_server)
server_thread.daemon = True
server_thread.start()

# Wait a bit for server to start
time.sleep(10)
print("Next.js server should be running on http://localhost:3000")
`;

        // Execute the install and start code
        const startResult = await sandbox.runCode(installAndStartCode);
        console.log('Start result:', startResult);

        // Get the sandbox URL
        const sandboxUrl = `https://${(sandbox as any).id}.e2b.dev`;
        
        // Return the sandbox information
        return {
          sandboxId: (sandbox as any).id,
          sandboxUrl,
          previewUrl: `${sandboxUrl}:3000`,
        };
      });

      // Update the preview record with success
      await step.run("update-preview-record", async () => {
        const updateData = {
          status: "COMPLETED",
          sandboxId: sandboxResult.sandboxId,
          url: sandboxResult.previewUrl,
          metadata: {
            sandboxId: sandboxResult.sandboxId,
            sandboxUrl: sandboxResult.sandboxUrl,
            previewUrl: sandboxResult.previewUrl,
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
        sandboxId: sandboxResult.sandboxId,
        sandboxUrl: sandboxResult.sandboxUrl,
        previewUrl: sandboxResult.previewUrl,
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
