/**
 * Reads recent posts from Reddit. Uses app-only OAuth when REDDIT_CLIENT_ID and
 * REDDIT_CLIENT_SECRET are set (reliable from cloud hosts), otherwise the public
 * JSON endpoints, which Reddit sometimes blocks from datacenter IPs.
 */

export type Post = {
  id: string;
  subreddit: string;
  title: string;
  body: string;
  author: string;
  url: string;
  score: number;
  comments: number;
  createdUtc: number;
};

const UA = "web:reddit-lead-radar:1.0 (by /u/shahsawar92)";
let token: { value: string; expiresAt: number } | null = null;

async function oauthToken(): Promise<string | null> {
  const id = process.env.REDDIT_CLIENT_ID;
  const secret = process.env.REDDIT_CLIENT_SECRET;
  if (!id || !secret) return null;
  if (token && token.expiresAt > Date.now() + 60_000) return token.value;
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return token.value;
}

export class RedditError extends Error {}

export async function fetchPosts(subreddit: string, keywords: string, limit = 20): Promise<Post[]> {
  const sub = subreddit.replace(/^\/?r\//i, "").trim();
  if (!/^[A-Za-z0-9_]{2,21}$/.test(sub)) throw new RedditError("That doesn't look like a subreddit name.");

  const q = keywords.trim();
  const bearer = await oauthToken();
  const host = bearer ? "https://oauth.reddit.com" : "https://www.reddit.com";
  const ext = bearer ? "" : ".json";
  const url = q
    ? `${host}/r/${sub}/search${ext}?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&t=month&limit=${limit}&raw_json=1`
    : `${host}/r/${sub}/new${ext}?limit=${limit}&raw_json=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": UA, ...(bearer && { Authorization: `Bearer ${bearer}` }) },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);

  if (!res) throw new RedditError("Reddit didn't respond. Try again, or use the sample posts.");
  if (res.status === 404 || res.status === 403) {
    throw new RedditError(res.status === 404 ? "That subreddit doesn't exist or is private." : "Reddit blocked the request. Try the sample posts instead.");
  }
  if (!res.ok) throw new RedditError(`Reddit returned an error (${res.status}). Try the sample posts instead.`);

  const json = (await res.json()) as { data?: { children?: { data: Record<string, unknown> }[] } };
  return (json.data?.children ?? [])
    .map(({ data: d }) => ({
      id: String(d.id),
      subreddit: String(d.subreddit),
      title: String(d.title ?? ""),
      body: String(d.selftext ?? "").slice(0, 1500),
      author: String(d.author ?? ""),
      url: `https://www.reddit.com${String(d.permalink ?? "")}`,
      score: Number(d.score ?? 0),
      comments: Number(d.num_comments ?? 0),
      createdUtc: Number(d.created_utc ?? 0),
    }))
    .filter((p) => !p.title.startsWith("[removed]"));
}
