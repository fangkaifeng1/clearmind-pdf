"use client";

import { Check, Zap, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { getToken, loginWithGoogle } from "@/lib/auth";

export default function PricingSection() {
  const { t } = useI18n();

  const tiers = [
    {
      name: t("pricing.free"),
      price: "$0",
      period: t("pricing.forever"),
      credits: t("pricing.freeCredits"),
      icon: Zap,
      cta: t("pricing.getCta"),
      onCta: () => {},
      features: [
        t("pricing.freeF1"),
        t("pricing.freeF2"),
        t("pricing.freeF3"),
        t("pricing.freeF4"),
      ],
    },
    {
      name: t("pricing.signedIn"),
      price: "$0",
      period: t("pricing.forever"),
      credits: t("pricing.signedInCredits"),
      icon: User,
      cta: t("pricing.signInCta"),
      onCta: () => {
        const token = getToken();
        if (!token) {
          loginWithGoogle();
        }
      },
      features: [
        t("pricing.signedInF1"),
        t("pricing.signedInF2"),
        t("pricing.signedInF3"),
        t("pricing.signedInF4"),
      ],
    },
  ];

  return (
    <div>
      <div className="text-center mb-16">
        <div className="inline-block px-4 py-1.5 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold tracking-wider uppercase mb-5">
          Pricing
        </div>
        <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          {t("pricing.title")}
        </h3>
        <p className="text-gray-400 text-lg">
          {t("pricing.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.name}
              className="relative flex flex-col rounded-3xl border border-gray-100/80 bg-white hover:border-gray-200 hover:shadow-lg p-8 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50">
                  <Icon className="w-5 h-5 text-gray-400" />
                </div>
                <h4 className="font-semibold text-gray-900">{tier.name}</h4>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  {tier.price}
                </span>
                <span className="text-sm text-gray-400 ml-1.5">
                  /{tier.period}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-7 px-4 py-3 rounded-xl text-sm font-medium bg-gray-50/80 text-gray-500">
                <Zap className="w-4 h-4 text-teal-600" />
                {tier.credits}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-500"
                  >
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={tier.onCta}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 bg-gray-900 text-white hover:bg-gray-800"
              >
                {tier.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
