import Link from "next/link";
import type { ReactNode } from "react";
import { reactToArticle, toggleSaved } from "@/app/(site)/xeber/[slug]/actions";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { ArticleUserState, NewsArticle, ReactionValue } from "@/lib/types";
import { ShareLinks } from "./ShareLinks";

type Props = {
  article: NewsArticle;
  state: ArticleUserState;
  signedIn: boolean;
};

const count = (value: number) => value.toLocaleString("az-AZ");

const pill = (active: boolean) =>
  `inline-flex items-center gap-1.5 border px-3 py-1.5 font-sans text-sm transition-colors ${
    active ? "border-ink bg-ink text-paper" : "border-ink/40 hover:border-ink"
  }`;

function ActionButton({
  signedIn,
  label,
  active,
  icon,
  children,
}: {
  signedIn: boolean;
  label: string;
  active: boolean;
  icon: IconName;
  children?: ReactNode;
}) {
  const content = (
    <>
      <Icon name={icon} filled={active} className="size-4" />
      {children}
    </>
  );
  if (!signedIn) {
    return (
      <Link href="/hesab" className={pill(false)} aria-label={`${label}: daxil olun`} title="Daxil olun">
        {content}
      </Link>
    );
  }
  return (
    <button type="submit" className={pill(active)} aria-pressed={active} aria-label={label}>
      {content}
    </button>
  );
}

function ReactionForm({ article, state, signedIn, value }: Props & { value: 1 | -1 }) {
  const active = state.reaction === value;
  const next: ReactionValue = active ? 0 : value;
  const button = (
    <ActionButton
      signedIn={signedIn}
      label={value === 1 ? "Bəyən" : "Bəyənmə"}
      active={active}
      icon={value === 1 ? "thumbUp" : "thumbDown"}
    >
      <span className="tabular-nums">{count(value === 1 ? article.likeCount : article.dislikeCount)}</span>
    </ActionButton>
  );
  if (!signedIn) return button;
  return (
    <form action={reactToArticle}>
      <input type="hidden" name="articleId" value={article.id} />
      <input type="hidden" name="slug" value={article.slug} />
      <input type="hidden" name="value" value={next} />
      {button}
    </form>
  );
}

export function EngagementBar({ article, state, signedIn }: Props) {
  return (
    <div className="flex flex-col gap-3 border-y border-rule py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 inline-flex items-center gap-1.5 font-sans text-sm text-muted" title="Baxış sayı">
          <Icon name="eye" />
          <span className="tabular-nums">{count(article.viewCount)}</span>
          <span className="sr-only">baxış</span>
        </span>
        <ReactionForm article={article} state={state} signedIn={signedIn} value={1} />
        <ReactionForm article={article} state={state} signedIn={signedIn} value={-1} />
        {signedIn ? (
          <form action={toggleSaved}>
            <input type="hidden" name="articleId" value={article.id} />
            <input type="hidden" name="slug" value={article.slug} />
            <input type="hidden" name="saved" value={String(state.saved)} />
            <ActionButton signedIn label={state.saved ? "Saxlanılandan çıxar" : "Saxla"} active={state.saved} icon="bookmark">
              {state.saved ? "Saxlanılıb" : "Saxla"}
            </ActionButton>
          </form>
        ) : (
          <ActionButton signedIn={false} label="Saxla" active={false} icon="bookmark">
            Saxla
          </ActionButton>
        )}
      </div>
      <ShareLinks path={`/xeber/${article.slug}`} title={article.title} />
    </div>
  );
}
