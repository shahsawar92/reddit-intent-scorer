import type { Post } from "@/lib/reddit";

/** Made-up posts in the style of r/shopify, so the demo works without Reddit. */
export const SAMPLE_PRODUCT =
  "An AI support chatbot for Shopify stores that answers order-status and return questions from live store data, 24/7. $29/month.";

const now = Math.floor(Date.now() / 1000);
const p = (id: string, title: string, body: string, hoursAgo: number, score: number, comments: number): Post => ({
  id,
  subreddit: "shopify (sample)",
  title,
  body,
  author: "sample_user",
  url: "",
  score,
  comments,
  createdUtc: now - hoursAgo * 3600,
});

export const SAMPLE_POSTS: Post[] = [
  p("s1", "Drowning in 'where is my order' emails, what do you use?",
    "We do about 40 orders a day and half my inbox is WISMO. I tried canned replies but it still eats 2 hours a day. Is there a bot that can actually look up the order and answer? Budget is maybe $50/mo.", 3, 41, 28),
  p("s2", "Gorgias is getting too expensive for us",
    "Our bill jumped after we went over the ticket limit. Love the product but we're a 2 person team. Looking for something cheaper that handles the basic stuff automatically.", 9, 22, 17),
  p("s3", "Hit $10k month! Lessons from year one",
    "Long post about what worked: TikTok organic, bundling, and slow shipping killed us early on. Happy to answer questions.", 14, 310, 92),
  p("s4", "Anyone built their own chatbot with the OpenAI API?",
    "I'm a dev and thinking of wiring GPT to our Shopify admin API myself. Is it worth it or am I going to spend a month on it?", 20, 12, 9),
  p("s5", "Customers keep asking about returns at 2am",
    "We sell in the US and UK so half our customers message overnight. By morning they've opened a chargeback because nobody replied. How do you handle support across time zones without hiring?", 6, 35, 21),
  p("s6", "Which theme do you recommend for a jewelry store?",
    "Looking at Dawn vs Prestige. Mostly care about product photos and speed.", 2, 8, 14),
  p("s7", "[Hiring] VA for customer support, 20h/week",
    "Small skincare brand needs someone to answer emails and DMs about orders, returns and product questions. Paying $8/hr.", 30, 5, 3),
  p("s8", "We built an AI support agent, AMA",
    "I'm the founder of a support automation app. Ask me anything about AI support. Link in bio, 20% off this week.", 11, 3, 6),
  p("s9", "Shopify Inbox vs a proper helpdesk?",
    "Currently just using Shopify Inbox. Is it worth moving to a real helpdesk at ~300 orders a month, or overkill?", 28, 18, 24),
  p("s10", "Meme: me refreshing the sales dashboard every 5 minutes",
    "That's it, that's the post.", 1, 520, 40),
];
