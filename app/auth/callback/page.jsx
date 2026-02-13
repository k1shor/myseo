"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import PageShell from "../../../components/PageShell";
import { setAuthSession } from "../../../lib/auth";

export default function AuthCallback() {
  const sp = useSearchParams();

  useEffect(() => {
    const token = sp.get("token");
    if (!token) {
      toast.error("OAuth failed");
      window.location.href = "/login";
      return;
    }
    const user = {
      name: sp.get("name") || "User",
      email: sp.get("email") || "",
      role: sp.get("role") || "user",
      provider: "google"
    };
    setAuthSession({ token, user });
    toast.success("Signed in with Google ✨");
    window.location.href = "/profile";
  }, [sp]);

  return (
    <PageShell title="Signing you in…" kicker="OAUTH">
      <div className="text-sm text-slate-600">Finishing login…</div>
    </PageShell>
  );
}
