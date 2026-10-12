"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { submitMarketing } from "@/lib/marketing";
export function MarketingForm({ kind = "leads" }: { kind?: "leads" | "contact" }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const lastPayload = useRef("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (state === "sending") return;
    const form = new FormData(event.currentTarget);
    const fingerprint = JSON.stringify(Array.from(form.entries()));
    if (fingerprint !== lastPayload.current) { requestId.current = crypto.randomUUID(); lastPayload.current = fingerprint; }
    requestId.current ??= crypto.randomUUID();
    setState("sending");
    try {
      await submitMarketing(kind, { email: String(form.get("email") || ""), name: String(form.get("name") || ""), website: String(form.get("website") || ""), interest: String(form.get("interest") || "writing"), consent: form.get("consent") === "on", ...(kind === "contact" ? { category: String(form.get("category")), message: String(form.get("message")) } : {}) }, requestId.current);
      setState("success");
    } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); setState("error"); }
  }
  if (state === "success") return <div className="form-success" role="status"><span aria-hidden="true">✓</span><h2>{kind === "leads" ? "You’re on the list." : "Message received."}</h2><p>{kind === "leads" ? "Your interest is saved. We’ll email you when there’s news about access." : "Your message is saved for the ScriptFX team."}</p></div>;
  return <form onSubmit={submit} className="marketing-form" aria-busy={state === "sending"}>
    <div className="form-field"><Label htmlFor="contact-name">Name <span>(optional)</span></Label><Input id="contact-name" name="name" autoComplete="name" maxLength={100} /></div>
    <div className="form-field"><Label htmlFor="contact-email">Email</Label><Input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required /></div>
    <div className="form-trap" aria-hidden="true"><label>Website<Input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {kind === "leads" ? <><label>I’m interested in<NativeSelect name="interest"><option value="writing">Writing</option><option value="production">Production</option><option value="market">Market</option><option value="all">The whole journey</option></NativeSelect></label><label className="form-checkbox"><Input name="consent" type="checkbox" required />Email me about ScriptFX access and product updates.</label></> : <><label>Topic<NativeSelect name="category"><option value="general">General question</option><option value="support">Product support</option><option value="partnership">Partnership</option><option value="press">Press</option><option value="feedback">Product feedback</option><option value="privacy">Privacy request</option></NativeSelect></label><label>Message<Textarea name="message" required minLength={10} maxLength={5000} rows={6} /></label></>}
    <p className="form-note">Read our <Link href="/privacy">privacy notice</Link> for how we use your details.</p>
    {state === "error" && <p role="alert" className="form-error">{error}</p>}
    <Button disabled={state === "sending"} type="submit">{state === "sending" ? "Sending…" : kind === "leads" ? "Join the waitlist" : "Send message"}</Button>
  </form>;
}
