"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { engagementApi } from "@/lib/engagement";
import type { ReactionValue } from "@/lib/types";

const read = (formData: FormData) => ({
  articleId: String(formData.get("articleId") ?? ""),
  slug: String(formData.get("slug") ?? ""),
});

async function run(slug: string, task: () => Promise<unknown>) {
  try {
    await task();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/hesab");
    throw error;
  }
  updateTag(`news:${slug}`);
}

export async function reactToArticle(formData: FormData) {
  const { articleId, slug } = read(formData);
  const value = Number(formData.get("value")) as ReactionValue;
  await run(slug, () => engagementApi.react(articleId, value));
}

export async function toggleSaved(formData: FormData) {
  const { articleId, slug } = read(formData);
  const saved = formData.get("saved") === "true";
  await run(slug, () => (saved ? engagementApi.unsave(articleId) : engagementApi.save(articleId)));
  updateTag("saved");
}

