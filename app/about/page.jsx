import PageShell from "../../components/PageShell";
import GlassCard from "../../components/GlassCard";

export const metadata = {
  title: "About — MySEO",
  description: "Learn about the marketing mind behind MySEO and the philosophy of SEO-first elegance."
};

export default function AboutPage() {
  return (
    <PageShell title="About" kicker="OUR STORY">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard>
            <p className="text-slate-700 leading-relaxed">
              MySEO is a boutique digital marketing & SEO studio built for brands that want
              <span className="font-semibold text-slate-900"> design-level elegance</span> with
              <span className="font-semibold text-slate-900"> measurable performance</span>.
              We treat every page like a landing page — fast, structured, and crafted for intent.
            </p>
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/55 p-4 shadow-glass">
                <div className="text-sm font-semibold text-slate-900">SEO-first architecture</div>
                <div className="mt-1 text-sm text-slate-600">Metadata, OG, keywords, clean slugs, and speed.</div>
              </div>
              <div className="rounded-2xl bg-white/55 p-4 shadow-glass">
                <div className="text-sm font-semibold text-slate-900">Conversion-focused content</div>
                <div className="mt-1 text-sm text-slate-600">Authority + clarity + compelling offers.</div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard>
            <div className="text-sm font-semibold text-slate-900">Message from the Founder</div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              “Marketing shouldn’t feel noisy. It should feel inevitable.
              When your site is structured correctly, the right people find you — and they trust you faster.”
            </p>
            <div className="mt-4 text-xs text-slate-500">— Founder, MySEO</div>
          </GlassCard>

          <div className="mt-6 rounded-3xl border border-white/50 bg-gradient-to-br from-pink-200/40 via-violet-200/40 to-sky-200/40 p-6 shadow-soft">
            <div className="text-sm font-semibold text-slate-900">What you get</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>• Strategy, not guesswork</li>
              <li>• Premium visuals + premium structure</li>
              <li>• SEO fields controlled from Admin CMS</li>
              <li>• Reporting-ready content & campaigns</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
