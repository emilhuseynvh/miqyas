import "server-only";
import { redirect } from "next/navigation";
import type { User } from "./api";
import { getCurrentUser } from "./session";

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/giris");
  if (user.role !== "admin") redirect("/admin/giris?xeta=FORBIDDEN");
  return user;
}
