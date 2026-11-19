import type { User } from "@/lib/api";
import { formatMonthYear } from "@/lib/format";
import { type AccountSection, AccountNav } from "./AccountNav";

type Props = {
  user: User;
  active: AccountSection;
  greeting?: string;
};

export function AccountHeader({ user, active, greeting }: Props) {
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toLocaleUpperCase("az");
  return (
    <header>
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
        <span
          className="grid size-20 shrink-0 place-items-center rounded-full bg-ink font-serif text-[30px] font-semibold tracking-tight text-paper"
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0">
          {greeting && <p className="font-sans text-sm font-semibold text-accent">{greeting}</p>}
          <h1 className="font-serif text-[36px] font-semibold leading-none tracking-tight md:text-[44px]">
            {user.firstName} {user.lastName}
          </h1>
          <p className="mt-2 font-sans text-sm text-muted">
            {user.email}
            <span className="mx-2 text-rule" aria-hidden>
              |
            </span>
            {formatMonthYear(user.createdAt)} tarixindən oxucu
          </p>
        </div>
      </div>
      <div className="mt-8">
        <AccountNav active={active} />
      </div>
    </header>
  );
}
