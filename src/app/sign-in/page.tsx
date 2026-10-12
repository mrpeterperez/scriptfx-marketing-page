import { redirect } from "next/navigation";
import { site } from "@/lib/site/config";
export const metadata = { title: "Sign in", robots: { index: false, follow: false } };
export default function SignInPage() { redirect(new URL("/login", site.appUrl).toString()); }
