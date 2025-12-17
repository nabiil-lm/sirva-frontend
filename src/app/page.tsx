import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { ExplanationSection } from "@/components/ExplanationSection";
import { CTASection } from "@/components/CTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ExplanationSection />
      <CTASection />

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-slate-600">© 2024 SIRVA. All rights reserved.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
