"use client";

import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  Code2,
  FilePenLine,
  FolderKanban,
  MessageSquareText,
  Palette,
  PieChart,
  Timer,
  WalletCards,
} from "lucide-react";
import { Accordion, AccordionSurface } from "./accordion";
import { Button } from "./button";
import {
  AnalyticsDashboard,
  EarningsPanel,
  FloatingSummaryCard,
  HeroDashboard,
  OverviewDashboard,
  ShortcutHint,
  TimerPanel,
  WorkOverviewPanel,
} from "./product-ui";
import { HowItWorksBento } from "./how-it-works-bento";
import {
  FeatureCard,
  PricingCard,
  ProblemCard,
  Reveal,
  SectionHeading,
} from "./shared";

export function HeroSection() {
  return (
    <section id="top" className="hero-section relative overflow-hidden pb-16 pt-16 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-blue-200/30 blur-[110px]" />

      <div className="page-container relative">
        <Reveal>
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-blue-700 shadow-sm backdrop-blur sm:text-xs">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-blue-500 opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-blue-600" />
              </span>
              Simple time tracking for modern freelancers
            </div>

            <h1 className="mt-7 text-balance text-[2.85rem] font-semibold leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-6xl md:text-7xl lg:text-[5.25rem]">
              Track your time.
              <span className="block text-blue-600">Know your worth.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Hourbase makes it simple to track billable hours, manage projects, and
              understand exactly where your time — and income — goes.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 min-[420px]:flex-row min-[420px]:items-center">
              <Button href="/signup" size="lg">
                Start Tracking Free
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
              <Button href="#how-it-works" variant="secondary" size="lg">
                See How It Works
                <ArrowDown className="size-4" aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              No credit card required <span className="mx-1.5 text-slate-300">·</span>{" "}
              Set up in minutes
            </p>
          </div>
        </Reveal>

        <Reveal className="relative mx-auto mt-12 max-w-[1180px] sm:mt-16" delay={120}>
          <div className="absolute -left-4 top-24 z-10 -rotate-2 sm:left-[-12px] lg:left-[-36px] lg:top-28">
            <ShortcutHint />
          </div>
          <div className="absolute -right-4 bottom-20 z-10 rotate-2 sm:right-[-12px] lg:right-[-30px]">
            <FloatingSummaryCard />
          </div>
          <HeroDashboard />
        </Reveal>
      </div>
    </section>
  );
}

const audiences = [
  { name: "Designers", icon: Palette },
  { name: "Developers", icon: Code2 },
  { name: "Consultants", icon: MessageSquareText },
  { name: "Writers", icon: FilePenLine },
  { name: "Freelancers", icon: BriefcaseBusiness },
];

export function SocialProofSection() {
  return (
    <section className="border-y border-slate-200 bg-white py-7 sm:py-9">
      <div className="page-container">
        <div className="relative overflow-hidden rounded-[26px] border border-slate-800 bg-slate-950 px-5 py-8 shadow-[0_24px_70px_rgba(15,23,42,.16)] sm:px-8 sm:py-10 lg:px-10">
          <div className="cta-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
          <div className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 size-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[0.72fr_1.45fr] lg:gap-14">
            <Reveal>
              <div className="max-w-md text-center lg:text-left">
                <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300">
                  <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,.8)]" />
                  Made for independent work
                </p>
                <h2 className="mt-4 text-balance text-[1.65rem] font-semibold leading-[1.13] tracking-[-0.04em] text-white sm:text-[1.9rem]">
                  Built for people who{" "}
                  <span className="text-blue-400">bill by the hour</span>
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  One focused workspace, however you work.
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-md bg-blue-500/15 text-[9px] font-bold text-blue-300">
                      H
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300">
                      Independent professionals
                    </span>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    5 workstyles
                  </span>
                </div>

                <div className="relative grid grid-cols-2 px-2 py-3 sm:grid-cols-5 sm:px-4 sm:py-5">
                  <div className="absolute left-[10%] right-[10%] top-[41px] hidden h-px bg-gradient-to-r from-transparent via-blue-400/35 to-transparent sm:block" />
                  {audiences.map(({ name, icon: Icon }, index) => (
                    <div
                      key={name}
                      className={`group relative z-10 flex flex-col items-center justify-center gap-2.5 px-2 py-3 ${
                        index === audiences.length - 1 ? "col-span-2 sm:col-span-1" : ""
                      }`}
                    >
                      <span className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-blue-300 shadow-[0_6px_18px_rgba(2,6,23,.35)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-blue-400/50 group-hover:bg-blue-500/10 group-hover:text-blue-200">
                        <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300 transition-colors group-hover:text-white sm:text-xs">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className="section-pad bg-slate-50">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title="Your time shouldn't disappear into spreadsheets."
            copy="Your work deserves a clearer system than scattered notes, reconstructed timers, and end-of-month guesswork."
          />
        </Reveal>
        <div className="mt-11 grid gap-4 md:grid-cols-3 lg:mt-14">
          <Reveal delay={0}>
            <ProblemCard number="01" title="Forgotten Hours">
              Missed timers and manually reconstructed work logs can cost you billable time.
            </ProblemCard>
          </Reveal>
          <Reveal delay={80}>
            <ProblemCard number="02" title="Scattered Work">
              Clients, projects and time entries shouldn't live across multiple tools.
            </ProblemCard>
          </Reveal>
          <Reveal delay={160}>
            <ProblemCard number="03" title="Unclear Earnings">
              Know how much time you've worked — and what that time is worth.
            </ProblemCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="section-pad scroll-mt-16 border-y border-slate-200 bg-white">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Everything in one place"
            title="Everything you need to own your time."
            copy="A focused toolkit for tracking the work, clients, and income that make up your independent business."
          />
        </Reveal>
        <div className="mt-11 grid gap-x-8 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          <Reveal>
            <FeatureCard icon={Timer} title="Track Every Hour">
              Start a timer or log time manually in seconds.
            </FeatureCard>
          </Reveal>
          <Reveal delay={60}>
            <FeatureCard icon={WalletCards} title="Know Your Earnings">
              Automatically calculate your billable income from tracked hours.
            </FeatureCard>
          </Reveal>
          <Reveal delay={120}>
            <FeatureCard icon={FolderKanban} title="Organize Your Work">
              Keep clients, projects and tasks organized in one place.
            </FeatureCard>
          </Reveal>
          <Reveal delay={180}>
            <FeatureCard icon={PieChart} title="Understand Your Time">
              See exactly where your hours are going with simple reports.
            </FeatureCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ProductShowcaseSection() {
  return (
    <section className="section-pad overflow-hidden bg-slate-50">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Focused by design"
            title="Your entire workday, at a glance."
            copy="Start the day, check progress, and understand what you've earned without piecing together five different tools."
          />
        </Reveal>
        <Reveal className="relative mx-auto mt-12 max-w-[1160px] sm:mt-16" delay={100}>
          <div className="showcase-glow pointer-events-none absolute inset-x-16 -bottom-10 h-32 bg-blue-500/15 blur-3xl" />
          <div className="relative">
            <OverviewDashboard />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function TimerShowcaseSection() {
  return (
    <section className="section-pad border-y border-slate-200 bg-white">
      <div className="page-container">
        <div className="grid items-center gap-11 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="Effortless tracking"
              title="Start tracking in one click."
              copy="No complicated setup. Pick a project, hit start, and get back to work."
              align="left"
            />
            <div className="mt-8 space-y-4">
              {[
                "Switch projects without breaking your flow",
                "Mark time billable as you work",
                "Add notes while the details are fresh",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex size-5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <span className="size-1.5 rounded-full bg-blue-600" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <TimerPanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function EarningsShowcaseSection() {
  return (
    <section className="section-pad bg-slate-50">
      <div className="page-container">
        <div className="grid items-center gap-11 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <EarningsPanel />
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={80}>
            <SectionHeading
              eyebrow="Financial clarity"
              title="Turn hours into earnings."
              copy="Set your hourly rates and let Hourbase calculate the value of every billable hour."
              align="left"
            />
            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                  <WalletCards className="size-4.5" strokeWidth={1.8} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Rates that work your way</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Set global, client, or project-specific rates.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function ClientsProjectsSection() {
  return (
    <section className="section-pad overflow-hidden bg-[#F4F7FB]">
      <div className="page-container">
        <div className="grid items-end gap-8 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Projects"
              title="Keep every project organized"
              copy="Give every engagement a home for its hours, rate, budget, and activity."
              align="left"
            />
          </Reveal>
          <Reveal delay={80}>
            <SectionHeading
              eyebrow="Clients"
              title="Know where your time goes"
              copy="See which clients and projects are taking your time — and driving your income."
              align="left"
            />
          </Reveal>
        </div>

        <Reveal className="relative mx-auto mt-10 max-w-[1160px] sm:mt-12" delay={100}>
          <div className="pointer-events-none absolute inset-x-10 -bottom-8 h-24 bg-blue-500/10 blur-3xl" />
          <WorkOverviewPanel />
        </Reveal>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="section-pad scroll-mt-16 overflow-hidden bg-slate-950"
    >
      <div className="page-container">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-blue-400">
              A simpler workflow
            </p>
            <h2 className="text-balance text-[2rem] font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-[2.6rem] lg:text-5xl">
              From work to insight in four simple steps.
            </h2>
          </div>
        </Reveal>
        <Reveal className="mt-10 sm:mt-12 lg:mt-14" delay={80}>
          <HowItWorksBento />
        </Reveal>
      </div>
    </section>
  );
}

export function AnalyticsSection() {
  return (
    <section id="analytics" className="section-pad scroll-mt-16 bg-slate-50">
      <div className="page-container">
        <div className="grid items-end gap-7 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Useful, not overwhelming"
              title="Make your time measurable."
              align="left"
            />
          </Reveal>
          <Reveal delay={80}>
            <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Simple analytics give you a clearer picture of your workload,
              productivity and income.
            </p>
          </Reveal>
        </div>
        <Reveal className="mx-auto mt-12 max-w-[1160px] sm:mt-16" delay={100}>
          <AnalyticsDashboard />
        </Reveal>
      </div>
    </section>
  );
}

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "For freelancers getting started.",
    features: ["Time tracking", "Basic projects", "Basic reports", "Client management"],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "For professionals who want more control.",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Custom rates",
      "Detailed reports",
      "Export",
    ],
    cta: "Start Free",
    featured: true,
  },
  {
    name: "Business",
    price: "$19",
    period: "/user/month",
    description: "For small teams and agencies.",
    features: [
      "Team tracking",
      "Team reports",
      "Advanced workspace",
      "Multiple users",
      "Admin controls",
    ],
    cta: "Get Started",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="section-pad scroll-mt-16 border-y border-slate-200 bg-white">
      <div className="page-container">
        <Reveal>
          <SectionHeading
            eyebrow="Straightforward pricing"
            title="Start free. Upgrade when you're ready."
            copy="Simple plans that grow with your work. No setup fees, no long-term contracts."
          />
        </Reveal>
        <div className="mx-auto mt-11 grid max-w-[1080px] gap-4 md:grid-cols-3 lg:mt-14">
          {pricingPlans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 80}>
              <PricingCard {...plan} />
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          All plans include secure cloud storage and email support.
        </p>
      </div>
    </section>
  );
}

const faqs = [
  {
    question: "What is Hourbase?",
    answer:
      "Hourbase is a focused time tracking and billable-hours platform for freelancers and independent professionals. It brings timers, clients, projects, rates, and reporting into one clear workspace.",
  },
  {
    question: "Can I track billable and non-billable hours?",
    answer:
      "Yes. Every time entry can be marked billable or non-billable, so your reports show both the time you worked and the hours that contribute to revenue.",
  },
  {
    question: "Can I track multiple clients?",
    answer:
      "Yes. You can create multiple clients, add projects under each client, and review hours and earnings by client or project.",
  },
  {
    question: "Can I manually add time?",
    answer:
      "Absolutely. Use the live timer while you work, or add and edit time entries manually whenever that fits your workflow better.",
  },
  {
    question: "Does Hourbase calculate my earnings?",
    answer:
      "Yes. Add your hourly rate globally or at the client or project level, and Hourbase automatically calculates the value of your billable time.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. The Free plan includes time tracking, client management, basic projects, and basic reports, with no credit card required.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="section-pad scroll-mt-16 bg-slate-50">
      <div className="page-container">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions, answered."
              copy="Everything you need to know before tracking your first hour."
              align="left"
            />
            <div className="mt-7 hidden items-center gap-3 text-sm text-slate-500 lg:flex">
              <MessageSquareText className="size-4 text-blue-600" />
              Still have questions?{" "}
              <a
                href="mailto:hello@hourbase.com"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Contact us
              </a>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <AccordionSurface>
              <Accordion items={faqs} />
            </AccordionSurface>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  return (
    <section id="login" className="bg-slate-50 px-4 pb-4 sm:px-6 sm:pb-6">
      <Reveal>
        <div className="relative mx-auto max-w-[1376px] overflow-hidden rounded-[24px] bg-blue-600 px-5 py-16 text-center text-white shadow-[0_25px_80px_rgba(37,99,235,.22)] sm:rounded-[28px] sm:px-10 sm:py-20 lg:py-24">
          <div className="cta-grid pointer-events-none absolute inset-0 opacity-25" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-2/3 -translate-x-1/2 rounded-full bg-white/15 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-blue-50 backdrop-blur">
              <Clock3 className="size-3.5" />
              Your first hour is free
            </span>
            <h2 className="mt-6 text-balance text-[2.2rem] font-semibold leading-[1.05] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Your time is valuable. Start tracking it.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
              Stop guessing where your hours went. Start understanding your work.
            </p>
            <div className="mt-8">
              <Button href="/signup" variant="dark" size="lg">
                Start Tracking Free
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <p className="mt-4 text-xs text-blue-100">No credit card required.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
