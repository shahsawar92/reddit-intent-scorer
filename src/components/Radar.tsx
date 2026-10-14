"use client";

import { useMemo, useState } from "react";
import type { ScoredPost } from "@/lib/scorer";

type Meta = { model: string; ms: number; tokens: number | null; unscored: number; unverifiedQuotes: number };

const INTENT_LABEL: Record<ScoredPost["intent"], string> = {
  asking_for_recommendation: "Asking for a tool",
  switching_from_competitor: "Switching from a competitor",
  has_problem_you_solve: "Has the problem",
  hiring_or_budget: "Has budget",
  researching: "Researching",
  self_promotion: "Self-promotion",
  not_relevant: "Not relevant",
};

function tier(score: number) {
  if (score >= 7) return { name: "Hot", ring: "border-accent text-accent-ink bg-accent-soft", bar: "bg-accent" };
  if (score >= 5) return { name: "Warm", ring: "border-warn text-warn bg-warn-soft", bar: "bg-warn" };
  return { name: "Cold", ring: "border-line text-faint bg-paper", bar: "bg-faint" };
}

function ago(utc: number) {
  const h = Math.max(0, Math.round((Date.now() / 1000 - utc) / 3600));
  return h < 1 ? "just now" : h < 48 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export function Radar({ sampleProduct }: { sampleProduct: string }) {
  const [product, setProduct] = useState(sampleProduct);
  const [source, setSource] = useState<"sample" | "reddit">("sample");
  const [subreddit, setSubreddit] = useState("shopify");
  const [keywords, setKeywords] = useState("support");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; redditBlocked?: boolean } | null>(null);
  const [posts, setPosts] = useState<ScoredPost[] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [minScore, setMinScore] = useState(0);

  const shown = useMemo(() => (posts ?? []).filter((p) => p.score10 >= minScore), [posts, minScore]);
  const counts = useMemo(() => {
    const c = { hot: 0, warm: 0, cold: 0 };
    for (const p of posts ?? []) c[p.score10 >= 7 ? "hot" : p.score10 >= 5 ? "warm" : "cold"]++;
    return c;
  }, [posts]);

  async function run(src = source) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, source: src, subreddit, keywords }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ text: data.error ?? "Something went wrong.", redditBlocked: data.redditBlocked });
        return;
      }
      setPosts(data.posts);
      setMeta(data.meta);
      setMinScore(0);
    } catch {
      setError({ text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="h-fit space-y-5 rounded-2xl border border-line bg-panel p-5 lg:sticky lg:top-20"
      >
        <div>
          <label htmlFor="product" className="label">1 · What do you sell?</label>
          <textarea
            id="product"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            rows={4}
            maxLength={600}
            className="mt-2 w-full resize-none rounded-lg border border-line bg-paper p-3 text-sm outline-none focus:border-accent"
          />
        </div>

        <div>
          <p className="label">2 · Where to look</p>
          <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg border border-line bg-paper p-1 text-sm" role="radiogroup">
            {(["sample", "reddit"] as const).map((s) => (
              <button
                type="button"
                key={s}
                role="radio"
                aria-checked={source === s}
                onClick={() => setSource(s)}
                className={`rounded-md py-1.5 ${source === s ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}
              >
                {s === "sample" ? "Sample posts" : "Live Reddit"}
              </button>
            ))}
          </div>
          {source === "reddit" ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="text-xs text-muted">
                Subreddit
                <div className="mt-1 flex items-center rounded-lg border border-line bg-paper focus-within:border-accent">
                  <span className="pl-2.5 font-mono text-faint">r/</span>
                  <input value={subreddit} onChange={(e) => setSubreddit(e.target.value)} maxLength={21} className="w-full bg-transparent px-1 py-2 text-sm text-ink outline-none" />
                </div>
              </label>
              <label className="text-xs text-muted">
                Keywords (optional)
                <input value={keywords} onChange={(e) => setKeywords(e.target.value)} maxLength={100} className="mt-1 w-full rounded-lg border border-line bg-paper px-2.5 py-2 text-sm text-ink outline-none focus:border-accent" />
              </label>
              <p className="col-span-2 text-xs text-faint">Scores the 20 newest matching posts from the last month.</p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-faint">Ten made-up posts in the style of r/shopify, picked to cover every kind of intent.</p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-bad-soft p-3 text-sm text-bad">
            {error.text}
            {error.redditBlocked && (
              <button type="button" onClick={() => { setSource("sample"); run("sample"); }} className="mt-2 block font-medium underline">
                Use the sample posts
              </button>
            )}
          </div>
        )}

        <button disabled={busy} className="w-full rounded-lg bg-accent py-2.5 font-medium text-ink hover:bg-accent-ink hover:text-paper disabled:opacity-50">
          {busy ? "Reading and scoring posts…" : "Find leads"}
        </button>
      </form>

      <div className="min-w-0">
        {!posts && !busy && <EmptyState />}
        {busy && <Skeleton />}
        {posts && !busy && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-line bg-panel px-5 py-4">
              <Stat n={counts.hot} label="hot" tone="text-accent-ink" />
              <Stat n={counts.warm} label="warm" tone="text-warn" />
              <Stat n={counts.cold} label="cold" tone="text-faint" />
              <label className="ml-auto flex items-center gap-3 text-sm text-muted">
                Min score
                <input type="range" min={0} max={10} value={minScore} onChange={(e) => setMinScore(+e.target.value)} className="accent-[var(--accent)]" />
                <span className="w-5 font-mono text-ink">{minScore}</span>
              </label>
              {meta && (
                <p className="w-full font-mono text-[11px] text-faint">
                  {posts.length} posts · 1 batched call to {meta.model} · {(meta.ms / 1000).toFixed(1)}s
                  {meta.tokens ? ` · ${meta.tokens.toLocaleString()} tokens` : ""} · {meta.unverifiedQuotes} unverified quote{meta.unverifiedQuotes === 1 ? "" : "s"}
                </p>
              )}
            </div>
            <ul className="space-y-3">
              {shown.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
              {shown.length === 0 && <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">No posts at this score. Lower the minimum.</li>}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone: string }) {
  return (
    <p className="flex items-baseline gap-1.5">
      <span className={`text-2xl font-semibold tabular-nums ${tone}`}>{n}</span>
      <span className="label">{label}</span>
    </p>
  );
}

function PostCard({ post }: { post: ScoredPost }) {
  const t = tier(post.score10);
  const cold = post.score10 < 5;
  return (
    <li className={`rise grid grid-cols-[56px_minmax(0,1fr)] gap-4 rounded-xl border border-line bg-panel p-4 ${cold ? "opacity-70" : ""}`}>
      <div className="flex flex-col items-center gap-1.5">
        <div className={`grid h-14 w-14 place-items-center rounded-full border-2 ${t.ring}`}>
          <span className="text-xl font-semibold tabular-nums">{post.score10}</span>
        </div>
        <span className="label !text-[10px]">{t.name}</span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-paper px-2 py-0.5 font-mono text-[11px] text-muted">{INTENT_LABEL[post.intent]}</span>
          <span className="font-mono text-[11px] text-faint">
            r/{post.subreddit} · {ago(post.createdUtc)} · {post.score} pts · {post.comments} comments
          </span>
        </div>
        <h3 className="mt-1.5 font-medium leading-snug">
          {post.url ? (
            <a href={post.url} target="_blank" rel="noreferrer" className="hover:text-accent-ink hover:underline">{post.title}</a>
          ) : (
            post.title
          )}
        </h3>
        <p className="mt-1 text-sm text-muted">{post.reason}</p>
        {post.evidence.length > 0 && (
          <ul className="mt-2 space-y-1">
            {post.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 font-mono text-[10px] ${e.verified ? "text-good" : "text-warn"}`} title={e.verified ? "Found word for word in the post" : "Not found in the post"}>
                  {e.verified ? "✓ quote" : "⚠ unverified"}
                </span>
                <span className="border-l-2 border-line pl-2 italic text-ink/80">“{e.quote}”</span>
              </li>
            ))}
          </ul>
        )}
        {post.replyAngle && (
          <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm">
            <span className="label mr-2 !text-accent-ink">Reply angle</span>
            {post.replyAngle}
          </p>
        )}
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full min-h-[420px] place-items-center rounded-2xl border border-dashed border-line p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border border-line">
          <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent" />
        </div>
        <p className="font-medium">Your ranked leads appear here</p>
        <p className="mt-1 text-sm text-muted">
          Every post gets a 0 to 10 score, the reason, the exact words that show intent, and a way to reply that
          helps instead of spamming.
        </p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="grid animate-pulse grid-cols-[56px_1fr] gap-4 rounded-xl border border-line bg-panel p-4">
          <div className="h-14 w-14 rounded-full bg-paper" />
          <div className="space-y-2">
            <div className="h-3 w-1/3 rounded bg-paper" />
            <div className="h-4 w-3/4 rounded bg-paper" />
            <div className="h-3 w-2/3 rounded bg-paper" />
          </div>
        </li>
      ))}
    </ul>
  );
}
