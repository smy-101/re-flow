"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: "border border-border bg-popover text-popover-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}

export { Toaster, toast };
