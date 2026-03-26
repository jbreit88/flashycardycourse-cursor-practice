import type { Metadata } from "next";
import { PricingTable } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose a plan for Flashy Cardy",
};

export default function PricingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
            Pricing
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Pick the plan that fits how you study.
          </p>
        </header>
        <div className="w-full">
          <PricingTable />
        </div>
      </div>
    </div>
  );
}
