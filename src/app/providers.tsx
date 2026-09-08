"use client";

import { StoreProvider } from "@/lib/store/provider";
import { ToastViewport } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      {children}
      <ToastViewport />
    </StoreProvider>
  );
}
