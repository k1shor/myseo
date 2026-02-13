import GradientBlob from "./GradientBlob";

export default function PageShell({ title, kicker, children }) {
  return (
    <main className="relative">
      <GradientBlob className="left-[-60px] top-[-40px]" />
      <GradientBlob className="right-[-80px] top-[120px]" />
      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="rounded-3xl border border-white/50 bg-white/45 p-8 shadow-soft backdrop-blur-xl">
          {kicker && (
            <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
              {kicker}
            </div>
          )}
          <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
