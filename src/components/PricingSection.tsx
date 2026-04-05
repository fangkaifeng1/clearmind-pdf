"use client";

import { Check, Zap, User, Crown, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function PricingSection() {
  const { t } = useI18n();

  const tiers = [
    {
      name: t("pricing.free"),
      price: "$0",
      period: t("pricing.forever"),
      credits: t("pricing.freeCredits"),
      highlight: false,
      comingSoon: false,
      icon: Zap,
      cta: t("pricing.getCta"),
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
      highlight: true,
      comingSoon: false,
      icon: User,
      cta: t("pricing.signInCta"),
      features: [
        t("pricing.signedInF1"),
        t("pricing.signedInF2"),
        t("pricing.signedInF3"),
        t("pricing.signedInF4"),
      ],
    },
    {
      name: t("pricing.pro"),
      price: "$9",
      period: t("pricing.month"),
      credits: t("pricing.proCredits"),
      highlight: false,
      comingSoon: true,
      icon: Crown,
      cta: t("pricing.proCta"),
      features: [
        t("pricing.proF1"),
        t("pricing.proF2"),
        t("pricing.proF3"),
        t("pricing.proF4"),
      ],
    },
  ];

  return (
    <div>
      <div className="text-center mb-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {t("pricing.title")}
        </h3>
        <p className="text-sm text-gray-500">
          {t("pricing.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                tier.highlight
                  ? "border-blue-200 bg-blue-50/30 shadow-lg shadow-blue-100/50"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  {t("pricing.popular")}
                </div>
              )}

              {tier.comingSoon && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                  {t("pricing.comingSoon")}
                </div>
              )}

              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tier.highlight ? "bg-blue-100" : "bg-gray-100"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      tier.highlight ? "text-blue-600" : "text-gray-500"
                    }`}
                  />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{tier.name}</h4>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {tier.price}
                </span>
                <span className="text-sm text-gray-400 ml-1">
                  /{tier.period}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 mb-5 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  tier.highlight
                    ? "bg-blue-100/60 text-blue-700"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                <Zap className={`w-4 h-4 ${tier.highlight ? "text-blue-500" : "text-yellow-500"}`} />
                {tier.credits}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      tier.highlight ? "text-blue-500" : "text-gray-400"
                    }`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  tier.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200/50"
                    : tier.comingSoon
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
                disabled={tier.comingSoon}
              >
                {tier.cta}
                {!tier.comingSoon && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
