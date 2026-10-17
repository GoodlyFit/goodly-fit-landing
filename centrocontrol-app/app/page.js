import Script from "next/script";
import { redirect } from "next/navigation";
import { currentUser, BASE } from "@/lib/auth";
import { SHELL } from "./shell";
export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: `window.GC_USER=${JSON.stringify(user)};window.GC_BASE=${JSON.stringify(BASE)};` }} />
      <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: SHELL }} />
      <Script src={`${BASE}/app.js?v=2`} strategy="afterInteractive" />
    </>
  );
}
