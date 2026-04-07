"use client";

import { Brain, Github, Twitter, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 bg-gradient-to-br from-teal-700 via-cyan-700 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-700/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">ClearMind PDF</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm mb-8">
              {t("footer.brandDesc")}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              {t("footer.product")}
            </h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.features")}</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.pricing")}</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.apiDocs")}</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.changelog")}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">
              {t("footer.support")}
            </h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.helpCenter")}</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.contactUs")}</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-white transition-colors">{t("footer.terms")}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} ClearMind PDF. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              {t("footer.allSystemsNormal")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
