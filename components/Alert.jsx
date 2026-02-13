export default function Alert({ type="info", children }) {
  const map = {
    info: "bg-sky-50 text-sky-800 border-sky-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    error: "bg-rose-50 text-rose-800 border-rose-200",
    warn: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${map[type] || map.info}`}>
      {children}
    </div>
  );
}
