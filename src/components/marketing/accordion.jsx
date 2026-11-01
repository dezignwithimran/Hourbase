"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function Accordion({ items, className }) {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      className={cn("divide-y divide-slate-200", className)}
    >
      {items.map((item, index) => (
        <AccordionPrimitive.Item
          key={item.question}
          value={`item-${index}`}
          className="group"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="flex w-full touch-manipulation items-center justify-between gap-6 py-6 text-left text-[15px] font-semibold text-slate-950 outline-none transition-colors hover:text-blue-600 focus-visible:text-blue-600 sm:text-base">
              {item.question}
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:border-blue-200 group-data-[state=open]:bg-blue-50 group-data-[state=open]:text-blue-600">
                <Plus className="size-4" aria-hidden="true" />
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-sm leading-7 text-slate-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down sm:text-[15px]">
            <div className="max-w-2xl pb-6 pr-12">{item.answer}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}

export function AccordionSurface({ children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_12px_40px_rgba(15,23,42,.04)] sm:px-8">
      {children}
    </div>
  );
}
