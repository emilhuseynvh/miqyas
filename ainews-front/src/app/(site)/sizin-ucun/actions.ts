"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { feedApi } from "@/lib/feed";
import { getSessionToken } from "@/lib/session";

async function requireSession() {
  if (!(await getSessionToken())) redirect("/hesab");
}

export async function hideFromFeed(formData: FormData) {
  await requireSession();
  await feedApi.hide(String(formData.get("articleId") ?? ""));
  refresh();
}

export async function saveInterests(formData: FormData) {
  await requireSession();
  const categories = formData.getAll("category").map(String).filter(Boolean);
  await feedApi.setInterests(categories);
  redirect("/sizin-ucun");
}
