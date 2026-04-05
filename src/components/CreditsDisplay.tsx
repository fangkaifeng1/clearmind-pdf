"use client";

import { Zap } from "lucide-react";
import { QuotaInfo } from "@/lib/quota";
import { useI18n } from "@/lib/i18n";

interface CreditsDisplayProps {
  quota: QuotaInfo | null;
  onSignIn: () => void;
}

export default function CreditsDisplay({ quota, onSignIn }: CreditsDisplayProps) {
  const { t } = useI18n();
  if (!quota) return null;

  const ratio = quota.daily_limit > 0 ? quota.remaining / quota.daily_limit : 0;
  const colorClass =
    ratio > 0.5
      ? "text-green-600 bg-green-50 border-green-200"
      : ratio > 0
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${colorClass}`}
      >
        <Zap className="w-3.5 h-3.5" />
        <span>
          {quota.remaining}/{quota.daily_limit} {t("credits.label")}
        </span>
      </div>
      {quota.plan === "ANONYMOUS" && (
        <button
          onClick={onSignIn}
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {t("credits.signInForMore")}
        </button>
      )}
    </div>
  );
}
