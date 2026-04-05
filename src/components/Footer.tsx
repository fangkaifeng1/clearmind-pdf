"use client";

import { Brain, Github, Twitter, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">ClearMind PDF</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              {t("footer.brandDesc")}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.product")}
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.features")}</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.pricing")}</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.apiDocs")}</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.changelog")}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t("footer.support")}
            </h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.helpCenter")}</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.contactUs")}</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.privacy")}</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">{t("footer.terms")}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ClearMind PDF. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              {t("footer.allSystemsNormal")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
