"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { newsletterApi } from "@/lib/newsletter";

export async function subscribe(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  let status: string;
  try {
    const result = await newsletterApi.subscribe(email);
    status = result.status === "already_subscribed" ? "movcud" : "gonderildi";
  } catch (error) {
    status = error instanceof ApiError && error.code === "RATE_LIMITED" ? "limit" : "xeta";
  }
  redirect(`/icmal?abune=${status}#abune`);
}

export async function unsubscribe(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  let status = "ok";
  try {
    const result = await newsletterApi.unsubscribe(token);
    if (result.status !== "ok") status = "etibarsiz";
  } catch {
    status = "xeta";
  }
  redirect(`/icmal/abunelikden-cix?netice=${status}`);
}
