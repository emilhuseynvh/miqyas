import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

const linkClass = "font-sans text-xs font-semibold text-accent hover:underline";

export function SignInLink() {
  return (
    <Link href="/hesab" className={linkClass}>
      Daxil ol
    </Link>
  );
}

export async function AccountLink() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return <SignInLink />;

  return (
    <Link href="/hesab" className={`${linkClass} flex items-center gap-2`}>
      <span
        className="grid size-6 place-items-center rounded-full bg-ink font-serif text-[11px] font-semibold text-paper"
        aria-hidden
      >
        {user.firstName.charAt(0)}
        {user.lastName.charAt(0)}
      </span>
      {user.firstName}
    </Link>
  );
}
