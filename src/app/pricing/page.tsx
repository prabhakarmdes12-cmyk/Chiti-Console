import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { TIERS } from "@/lib/billing/stripe";
import FadeIn from "@/components/motion/FadeIn";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/5 bg-surface-1/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-text-main font-display font-bold">Chiti Console</span>
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-lg bg-surface-2 border border-white/10 text-text-main text-sm font-medium hover:bg-surface-3 hover:border-white/20 transition-all"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl font-display font-bold text-text-main">
            Pricing built for{" "}
            <span className="gradient-brand-text">growth</span>
          </h1>
          <p className="text-text-muted mt-4 max-w-lg mx-auto leading-relaxed">
            Start free. Upgrade as you grow. No hidden fees, no long-term contracts.
            Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <FadeIn key={tier.id} direction="up" delay={0.1 + i * 0.15}>
            <div
              className={`relative rounded-2xl p-[1px] transition-all duration-300 hover:scale-[1.02] ${
                tier.highlighted
                  ? "bg-gradient-to-b from-brand-primary to-brand-secondary"
                  : "bg-white/5"
              }`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className={`rounded-2xl p-6 h-full flex flex-col ${
                tier.highlighted ? "bg-surface-2" : "bg-surface-1"
              }`}>
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-brand text-white text-xs font-medium shadow-lg shadow-purple-500/30">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-display font-bold text-text-main">{tier.name}</h2>
                  <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{tier.description}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold text-text-main">
                      {tier.price === 0 ? "Free" : `₹${tier.price.toLocaleString("en-IN")}`}
                    </span>
                    {tier.price > 0 && <span className="text-text-muted text-sm">/month</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-text-muted">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.price === 0 ? "/login" : "/login"}
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    tier.highlighted
                      ? "gradient-brand text-white hover:shadow-lg hover:shadow-purple-500/30"
                      : "bg-surface-2 text-text-main border border-white/10 hover:bg-surface-3"
                  }`}
                >
                  {tier.price === 0 ? "Get Started Free" : "Start Free Trial"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            </FadeIn>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-2 border border-white/5 text-xs text-text-muted mb-6">
            Enterprise
          </div>
          <h2 className="text-2xl font-display font-bold text-text-main mb-3">Need a custom plan?</h2>
          <p className="text-sm text-text-muted mb-8 max-w-md mx-auto leading-relaxed">
            Contact us for enterprise plans with dedicated support, custom integrations, and on-premise deployment options.
          </p>
          <Link
            href="mailto:sales@chiti.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2 border border-white/10 text-text-main text-sm font-medium hover:bg-surface-3 hover:border-white/20 transition-all"
          >
            Contact Sales
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
