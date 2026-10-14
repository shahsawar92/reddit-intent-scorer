import { z } from "zod";
import { aiErrorResponse } from "@/lib/gemini";
import { clientIp, limitResponse, rateLimit } from "@/lib/ratelimit";
import { fetchPosts, RedditError } from "@/lib/reddit";
import { SAMPLE_POSTS } from "@/lib/samples";
import { scorePosts } from "@/lib/scorer";

export const maxDuration = 60;

const Body = z.object({
  product: z.string().trim().min(10, "Describe your product in a sentence or two.").max(600),
  source: z.enum(["reddit", "sample"]),
  subreddit: z.string().max(40).optional().default(""),
  keywords: z.string().max(100).optional().default(""),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }
  const { product, source, subreddit, keywords } = parsed.data;

  const limit = await rateLimit(`rd:${clientIp(req)}`, Number(process.env.RATE_LIMIT_PER_HOUR ?? 10));
  if (!limit.ok) return limitResponse(limit);

  let posts;
  try {
    posts = source === "sample" ? SAMPLE_POSTS : await fetchPosts(subreddit, keywords, 20);
  } catch (err) {
    if (err instanceof RedditError) return Response.json({ error: err.message, redditBlocked: true }, { status: 502 });
    throw err;
  }
  if (posts.length === 0) return Response.json({ error: "No recent posts matched. Try fewer keywords." }, { status: 404 });

  try {
    const out = await scorePosts(product, posts);
    return Response.json({ ...out, remaining: limit.remaining });
  } catch (err) {
    return aiErrorResponse(err);
  }
}
