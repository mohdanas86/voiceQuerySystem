/**
 * page.tsx — Root route (/). Redirects immediately to the record screen.
 * VoiceBerry | Ulavi Technologies
 */

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/record");
}
