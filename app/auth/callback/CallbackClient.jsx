"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Processing login…");

  const token = useMemo(() => searchParams.get("token"), [searchParams]);
  const user = useMemo(() => searchParams.get("user"), [searchParams]);
  const error = useMemo(() => searchParams.get("error"), [searchParams]);

  useEffect(() => {
    try {
      if (error) {
        setStatus(`Login failed: ${error}`);
        return;
      }

      if (!token) {
        setStatus("Missing token in callback URL.");
        return;
      }

      // store auth for 7 days
      const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

      const auth = {
        token,
        user: user ? JSON.parse(decodeURIComponent(user)) : null,
        expiresAt,
      };

      localStorage.setItem("pp_auth", JSON.stringify(auth));

      setStatus("Login successful. Redirecting…");
      router.replace("/profile");
    } catch (e) {
      setStatus("Something went wrong while processing login.");
      console.error(e);
    }
  }, [token, user, error, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl shadow-lg bg-white/70 backdrop-blur p-6 text-center">
        <h1 className="text-xl font-semibold">Auth Callback</h1>
        <p className="mt-3 opacity-80">{status}</p>
      </div>
    </div>
  );
}
