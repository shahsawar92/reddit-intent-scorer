import { Footer, Header, Hero } from "@/components/Chrome";
import { Radar } from "@/components/Radar";
import { APP } from "@/app.config";
import { SAMPLE_PRODUCT } from "@/lib/samples";

export default function Page() {
  return (
    <>
      <Header app={APP.name} repo={APP.repo} />
      <main className="flex-1">
        <Hero kicker="Live demo · LLM classification with structured output" title="Find the Reddit posts that" accent="want to buy.">
          Describe what you sell and pick a subreddit. AI reads the newest posts, scores each one for buying intent and
          quotes the exact words that show it. Every quote is checked against the post, so you can see when the model
          made something up.
        </Hero>
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <Radar sampleProduct={SAMPLE_PRODUCT} />
        </section>
        <section className="mx-auto mt-16 mb-16 max-w-6xl px-4 sm:px-6">
          <p className="label">Under the hood</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Built to be trusted, not just to look clever</h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["One batched call", "All posts go to the model in a single request with a JSON schema, so 20 posts cost one call, not 20."],
              ["Validated output", "The response is parsed with Zod, scores are clamped to 0 to 10, and any post the model skipped is flagged instead of dropped."],
              ["Quotes checked in code", "Each evidence quote must appear word for word in the post. If it doesn't, the card says unverified."],
              ["Posts treated as untrusted", "Post text is fenced off and the model is told to ignore instructions inside it, so a post can't hijack the scoring."],
            ].map(([t, d]) => (
              <div key={t} className="bg-panel p-5">
                <p className="font-medium">{t}</p>
                <p className="mt-1.5 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            This is the scoring step for a Reddit monitoring SaaS I built in Node.js, where scrapers feed a Redis queue
            and a matcher alerts users in real time. Keyword matching finds posts; this step decides which ones are worth
            a reply.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
