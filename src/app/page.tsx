import { Integrate } from "@/components/Integrate";
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
        <Integrate
          c={{
            title: "Get your Reddit leads delivered instead",
            intro: "The demo scores one search at a time. Your version watches Reddit for you and only tells you about the posts worth replying to.",
            options: [
              { name: "Always-on monitoring", detail: "Your subreddits and keywords are checked around the clock, and every new post is scored against your product." },
              { name: "Alerts where you work", detail: "Hot leads arrive by email, Slack or WhatsApp with the score, the reason and a suggested reply angle." },
              { name: "Send leads to your CRM", detail: "Push qualified posts into HubSpot, Pipedrive, Notion or a Google Sheet so your sales process picks them up." },
              { name: "Tuned to your product", detail: "The scoring rubric is adjusted with examples of what a good lead looks like for you, so fewer false alarms reach you." },
            ],
            needs: ["A short description of your product and ideal customer", "The subreddits and keywords to watch", "Where alerts should go"],
            timeline: "Monitoring and alerts running in about a week.",
          }}
        />
      </main>
      <Footer />
    </>
  );
}
