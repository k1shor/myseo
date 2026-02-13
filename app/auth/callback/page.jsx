import { Suspense } from "react";
import CallbackClient from "./callbackClient";


export const dynamic = "force-dynamic"; // prevents static prerender
export const revalidate = 0;

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Finishing login…</div>}>
      <CallbackClient />
    </Suspense>
  );
}
