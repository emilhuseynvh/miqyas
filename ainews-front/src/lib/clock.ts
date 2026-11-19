import "server-only";
import { connection } from "next/server";

export async function getRequestTime(): Promise<number> {
  await connection();
  return Date.now();
}
