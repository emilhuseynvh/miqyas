"use server";

import { redirect } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { ApiError } from "@/lib/api";

function returnPath(formData: FormData, flash: Record<string, string>) {
  const raw = String(formData.get("returnTo") ?? "/admin");
  const url = new URL(raw.startsWith("/admin") ? raw : "/admin", "http://local");
  for (const key of ["ok", "xeta", "info"]) url.searchParams.delete(key);
  for (const [key, value] of Object.entries(flash)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

const failureCode = (error: unknown) => (error instanceof ApiError ? error.code : "UNAVAILABLE");

export async function runIngestion(formData: FormData) {
  let flash: Record<string, string> = { ok: "ingestion-started" };
  try {
    await adminApi.runIngestion();
  } catch (error) {
    flash = { xeta: failureCode(error) };
  }
  redirect(returnPath(formData, flash));
}

export async function fetchSource(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  let flash: Record<string, string>;
  try {
    const result = await adminApi.fetchSource(id);
    flash = result.ok
      ? { ok: "fetched", info: `${result.found}:${result.inserted}:${result.skipped}` }
      : { xeta: "FETCH_FAILED", info: result.error ?? "" };
  } catch (error) {
    flash = { xeta: failureCode(error) };
  }
  redirect(returnPath(formData, flash));
}

export async function setSourceActive(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("isActive") === "true";
  let flash: Record<string, string> = { ok: isActive ? "activated" : "deactivated" };
  try {
    await adminApi.updateSource(id, { isActive });
  } catch (error) {
    flash = { xeta: failureCode(error) };
  }
  redirect(returnPath(formData, flash));
}

export async function updateFeedUrl(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const feedUrl = String(formData.get("feedUrl") ?? "").trim();
  let flash: Record<string, string> = { ok: "feed-saved" };
  try {
    await adminApi.updateSource(id, { feedUrl: feedUrl || null });
    if (feedUrl) {
      const result = await adminApi.fetchSource(id);
      flash = result.ok
        ? { ok: "feed-saved", info: `${result.found}:${result.inserted}:${result.skipped}` }
        : { xeta: "FETCH_FAILED", info: result.error ?? "" };
    }
  } catch (error) {
    flash = { xeta: failureCode(error) };
  }
  redirect(returnPath(formData, flash));
}
