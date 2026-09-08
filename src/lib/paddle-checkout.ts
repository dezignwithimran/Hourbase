"use client";

import type { PlanId, PlanInterval } from "@/lib/types";

type PaddleEvent = {
  name?: string;
  data?: { id?: string; transaction_id?: string };
};

type PaddleCheckout = {
  Environment: { set: (env: "sandbox" | "production") => void };
  Initialize: (opts: { token: string; eventCallback?: (event: PaddleEvent) => void }) => void;
  Checkout: {
    open: (opts: {
      items: Array<{ priceId: string; quantity: number }>;
      customer?: { email?: string };
      customData?: Record<string, string>;
      settings?: { successUrl?: string };
    }) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleCheckout;
  }
}

let loading: Promise<PaddleCheckout> | null = null;
let onComplete: ((transactionId: string) => void) | null = null;
let onClosed: (() => void) | null = null;

function loadPaddle(env: "sandbox" | "production", token: string) {
  loading ??= new Promise((resolve, reject) => {
    const start = () => {
      const paddle = window.Paddle;
      if (!paddle) {
        reject(new Error("Paddle failed to load."));
        return;
      }
      if (env === "sandbox") paddle.Environment.set("sandbox");
      paddle.Initialize({
        token,
        eventCallback(event) {
          if (event.name === "checkout.completed") {
            const id = event.data?.id || event.data?.transaction_id;
            if (id) onComplete?.(id);
          }
          if (event.name === "checkout.closed" || event.name === "checkout.canceled") {
            onClosed?.();
          }
        },
      });
      resolve(paddle);
    };
    if (window.Paddle) {
      start();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = start;
    script.onerror = () => reject(new Error("Could not load Paddle Checkout."));
    document.head.appendChild(script);
  });
  return loading;
}

export async function openPaddleCheckout(input: {
  token: string;
  env: "sandbox" | "production";
  priceId: string;
  email: string;
  userId: string;
  plan: PlanId;
  interval: PlanInterval;
  onComplete?: (transactionId: string) => void;
  onClosed?: () => void;
}) {
  onComplete = input.onComplete ?? null;
  onClosed = input.onClosed ?? null;
  const paddle = await loadPaddle(input.env, input.token);
  paddle.Checkout.open({
    items: [{ priceId: input.priceId, quantity: 1 }],
    customer: { email: input.email },
    customData: {
      userId: input.userId,
      plan: input.plan,
      interval: input.interval,
    },
  });
}
