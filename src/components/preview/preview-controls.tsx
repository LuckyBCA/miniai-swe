"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { triggerPreview, cancelPreview } from "@/actions/preview-actions";

// Client component for triggering and canceling preview
export function PreviewControls({ 
  vibeId, 
  userId, 
  sandboxId, 
  hasPreview 
}: { 
  vibeId: string; 
  userId: string; 
  sandboxId?: string; 
  hasPreview: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  
  async function handleTriggerPreview() {
    setIsLoading(true);
    
    try {
      await triggerPreview(vibeId, userId);
      toast.success("Preview job started! This may take a minute to complete.");
    } catch (error) {
      console.error("Error triggering preview:", error);
      toast.error("Failed to start preview job. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleCancelPreview() {
    if (!sandboxId) {
      toast.error("No sandbox ID available to cancel");
      return;
    }
    
    setIsCanceling(true);
    
    try {
      await cancelPreview(vibeId, userId, sandboxId);
      toast.success("Cancellation job started. The sandbox will be terminated shortly.");
    } catch (error) {
      console.error("Error canceling preview:", error);
      toast.error("Failed to cancel the preview. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  }
  
  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleTriggerPreview} 
        disabled={isLoading || isCanceling} 
        className="flex-1"
      >
        {isLoading ? "Starting Preview..." : hasPreview ? "Refresh Preview" : "Create Preview"}
      </Button>
      
      {hasPreview && sandboxId && (
        <Button 
          onClick={handleCancelPreview} 
          disabled={isLoading || isCanceling}
          variant="destructive"
        >
          {isCanceling ? "Canceling..." : "Cancel Preview"}
        </Button>
      )}
    </div>
  );
}
