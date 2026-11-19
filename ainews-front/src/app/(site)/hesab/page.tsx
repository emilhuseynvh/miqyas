import type { Metadata } from "next";
import { Suspense } from "react";
import { logout } from "./actions";
import { AccountHeader } from "@/components/auth/AccountHeader";
import { AccountPreview } from "@/components/auth/AccountPreview";
import { AccountStat } from "@/components/auth/AccountStat";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailLinkForm } from "@/components/auth/EmailLinkForm";
import { FormNotice } from "@/components/auth/FormNotice";
import { PageSkeleton } from "@/components/ui/PageSkeleton";
import { authErrorMessage } from "@/lib/auth-messages";
import { engagementApi } from "@/lib/engagement";
import { getCurrentUser, getPendingEmail } from "@/lib/session";

export const metadata: Metadata = { title: "Hesab", robots: { index: false, follow: false } };

export default function AccountPage({ searchParams }: PageProps<"/hesab">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AccountContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AccountContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    const welcome = params["xos-geldin"] === "1";
    const [saved, history] = await Promise.all([engagementApi.saved(1), engagementApi.history(1)]);
    return (
      <section className="mx-auto max-w-[900px] py-10">
        <AccountHeader user={user} active="profile" greeting={welcome ? "Xoş gəldin!" : undefined} />
        <div className="mt-10 grid grid-cols-2 gap-6 sm:max-w-md">
          <AccountStat href="/hesab/saxlanilanlar" value={saved.total} label="saxlanılan xəbər" />
          <AccountStat href="/hesab/tarixce" value={history.total} label="oxunan xəbər" />
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <AccountPreview
            title="Son oxuduqların"
            href="/hesab/tarixce"
            items={history.items.slice(0, 4)}
            empty="Xəbər oxuduqca burada görünəcək."
          />
          <AccountPreview
            title="Son saxladıqların"
            href="/hesab/saxlanilanlar"
            items={saved.items.slice(0, 4)}
            empty="Xəbər səhifəsində Saxla düyməsinə basın, sonra oxumaq üçün burada tapın."
          />
        </div>
        <form action={logout} className="mt-14 border-t border-dashed border-ink pt-5">
          <button type="submit" className="font-sans text-sm text-muted hover:text-signal">
            Hesabdan çıx
          </button>
        </form>
      </section>
    );
  }

  const error = authErrorMessage(typeof params.xeta === "string" ? params.xeta : undefined);
  const pendingEmail = await getPendingEmail();

  return (
    <AuthShell title="E-poçt ünvanınla daxil ol və ya hesab yarat." subtitle="Sənə giriş linki göndərəcəyik.">
      {error && <FormNotice tone="error">{error}</FormNotice>}
      <EmailLinkForm defaultEmail={pendingEmail ?? undefined} />
      <p className="mt-4 font-sans text-xs leading-relaxed text-muted">
        Şifrə lazım deyil. Hesabın varsa, linkə klikləyəndə birbaşa daxil olacaqsan. Yoxdursa, adını və soyadını
        soruşub hesabını yaradacağıq.
      </p>
    </AuthShell>
  );
}
