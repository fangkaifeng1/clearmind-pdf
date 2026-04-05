"use client";

import { X, Zap, LogIn, Crown } from "lucide-react";
import { QuotaInfo } from "@/lib/quota";
import { useI18n } from "@/lib/i18n";

interface QuotaExhaustedModalProps {
  quota: QuotaInfo;
  onClose: () => void;
  onSignIn: () => void;
}

export default function QuotaExhaustedModal({
  quota,
  onClose,
  onSignIn,
}: QuotaExhaustedModalProps) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Zap className="w-6 h-6 text-red-500" />
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t("quota.title")}
        </h3>
        <p className="text-gray-500 mb-6">
          {t("quota.desc", { limit: quota.daily_limit })}
        </p>

        <div className="space-y-3">
          {quota.plan === "ANONYMOUS" && (
            <button
              onClick={onSignIn}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
            >
              <LogIn className="w-4 h-4" />
              {t("quota.signIn")}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            <Crown className="w-4 h-4" />
            {t("quota.upgrade")}
          </button>
        </div>
      </div>
    </div>
  );
}
