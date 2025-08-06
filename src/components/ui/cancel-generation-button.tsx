import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CancelButtonProps {
  vibeId: string;
  sandboxId?: string;
  disabled?: boolean;
}

export function CancelGenerationButton({ vibeId, sandboxId, disabled = false }: CancelButtonProps) {
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!vibeId) return;
    
    try {
      setIsCancelling(true);
      
      const response = await fetch('/api/inngest/cancel-sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vibeId, sandboxId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel generation');
      }
      
      toast.success('Generation cancelled successfully');
      
      // Optionally refresh the page or update UI state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error cancelling generation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel generation');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleCancel}
      disabled={disabled || isCancelling}
    >
      {isCancelling ? 'Cancelling...' : 'Cancel'}
    </Button>
  );
}
