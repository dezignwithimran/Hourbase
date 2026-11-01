"use client";

import {
  ArrowRight,
  Check,
  Menu,
  X,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/cn";
import { Button, buttonStyles } from "./button";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Logo({ inverse = false }) {
  return (
    <a
      href="#top"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg font-semibold tracking-[-0.02em] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15",
        inverse ? "text-white" : "text-slate-950",
      )}
      aria-label="Hourbase home"
    >
      <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-[9px] bg-blue-600 shadow-sm shadow-blue-600/20">
        <svg
          viewBox="0 0 32 32"
          className="size-8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10.5 8.5v15M21.5 8.5v15M10.5 16h11"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M24.5 5.5A13 13 0 0 1 28 16"
            stroke="white"
            strokeOpacity=".45"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-[17px]">Hourbase</span>
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled || open
          ? "border-slate-200/80 bg-slate-50/90 shadow-[0_4px_20px_rgba(15,23,42,.035)] backdrop-blur-xl"
          : "border-transparent bg-slate-50/70 backdrop-blur-sm",
      )}
    >
      <div className="page-container flex h-[72px] items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/10"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button href="/login" variant="ghost" size="sm">
            Log in
          </Button>
          <Button href="/signup" size="sm">
            Get Started
          </Button>
        </div>

        <button
          type="button"
          className="flex size-11 touch-manipulation items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/15 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!open}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 md:hidden",
          open
            ? "visible grid-rows-[1fr] opacity-100"
            : "invisible grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0">
          <nav
            className="page-container flex flex-col border-t border-slate-200/80 py-4"
            aria-label="Mobile navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center rounded-xl px-3 text-[15px] font-medium text-slate-700 hover:bg-white"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
              <Button href="/login" variant="secondary" onClick={() => setOpen(false)}>
                Log in
              </Button>
              <Button href="/signup" onClick={() => setOpen(false)}>
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
  className,
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-slate-950 sm:text-[2.6rem] lg:text-5xl">
        {title}
      </h2>
      {copy && (
        <p className="mt-5 text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          {copy}
        </p>
      )}
    </div>
  );
}

export function FeatureCard({
  icon: Icon,
  title,
  children,
}) {
  return (
    <article className="group border-t border-slate-200 py-7 sm:py-8">
      <div className="flex size-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:-translate-y-1">
        <Icon className="size-[19px]" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-slate-950">
        {title}
      </h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600">{children}</p>
    </article>
  );
}

export function ProblemCard({
  number,
  title,
  children,
}) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,.035)] sm:p-7">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <span className="text-xs font-semibold tracking-[0.12em] text-blue-600">
        {number}
      </span>
      <h3 className="mt-8 text-xl font-semibold tracking-[-0.025em] text-slate-950">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{children}</p>
    </article>
  );
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  featured = false,
}) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-2xl border bg-white p-6 sm:p-7",
        featured
          ? "border-blue-200 shadow-[0_18px_60px_rgba(37,99,235,.10)]"
          : "border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,.035)]",
      )}
    >
      {featured && (
        <span className="absolute right-6 top-6 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-blue-600">
          Most popular
        </span>
      )}
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
        {name}
      </h3>
      <div className="mt-6 flex items-end gap-1.5">
        <span className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">
          {price}
        </span>
        {period && <span className="pb-1 text-sm text-slate-500">{period}</span>}
      </div>
      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{description}</p>
      <div className="my-6 h-px bg-slate-100" />
      <ul className="flex-1 space-y-3.5">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
            <span className="flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Check className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href="/signup"
        className={buttonStyles({
          variant: featured ? "primary" : "secondary",
          className: "mt-8 w-full",
        })}
      >
        {cta}
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </article>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function Footer() {
  const groups = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Reports", href: "#analytics" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "mailto:support@hourbase.com" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#top" },
        { label: "Contact", href: "mailto:hello@hourbase.com" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-300">
      <div className="page-container py-12 sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_2fr] lg:gap-20">
          <div>
            <Logo inverse />
            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
              Track your time. Know your worth.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-9 sm:grid-cols-4">
            {groups.map((group) => (
              <div key={group.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-slate-500 sm:mt-16 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Hourbase</p>
          <p>Built for independent professionals.</p>
        </div>
      </div>
    </footer>
  );
}
