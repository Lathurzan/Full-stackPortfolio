export const caseStudies = [
  {
    slug: "ai-chatbot",
    title: "AI Chatbot Platform",
    description: "A conversational AI assistant that understands user intent, integrates with backend services, and scales to many concurrent users.",
    image: "/images/case-studies/ai-chatbot-cover.png",
    stack: ["Node.js", "Next.js", "MongoDB", "OpenAI"],
    hasCaseStudy: true,
    problem: `Users needed an on-site assistant that could answer product and support questions, route complex requests to specialized services, and preserve context across sessions while staying cost-efficient at scale.`,
    architecture: `A modular microservices-style architecture: Next.js frontend (SSR for SEO), a stateless REST API load-balanced across replicas, an async job queue for heavy processing, and a separate AI service that talks to the model provider securely. Frontend calls the API which orchestrates model prompts, caching, and external system calls.`,
    backend: `Backend exposes REST endpoints for chat, session management, and integrations. It validates and sanitizes user input, manages prompt templates, and stores session state in Redis for fast access. A worker pool processes long-running tasks and enrichment (embedding generation, vector indexing).`,
    aiIntegration: `Uses a hybrid approach: retrieval-augmented generation (RAG) for factual answers backed by vector search, plus prompt orchestration to keep costs constant. Embeddings are stored in a vector DB and the system limits token usage per request while caching frequent queries.`,
    databaseDesign: `Primary data in MongoDB (users, conversations metadata) and Redis for session state/short TTL caches. Vector embeddings are stored in a vector-enabled index (e.g., Pinecone or self-hosted FAISS) with a mapping to source documents. Backups and TTL policies are in place for compliance.`,
    challenges: `Controlling hallucinations, prompt engineering for domain-specific knowledge, managing costs for high-volume model calls, and ensuring low-latency user experience. We mitigated these with RAG, answer verification heuristics, rate-limiting, and an LRU cache for recent responses.`,
    deployment: `Frontend deployed on Vercel, backend on a managed container service (e.g., Render or Railway) behind an API gateway; database on MongoDB Atlas; vector index on Pinecone; Cloudflare edge for static caching and security. CI/CD via GitHub Actions with infrastructure as code for reproducible deployments.`,
  },

  {
    slug: "realtime-analytics",
    title: "Real-time Analytics Platform",
    description: "A platform for ingesting, aggregating, and visualizing real-time metrics from client apps with retention, drill-downs, and alerting.",
    image: "/images/case-studies/realtime-analytics-cover.png",
    stack: ["TypeScript", "Express", "MongoDB", "Redis", "WebSockets"],
    hasCaseStudy: true,
    problem: `Product teams required an actionable analytics dashboard with near-real-time updates, flexible rollups, and low operational cost while preserving historical data for trends.`,
    architecture: `Event ingestion via a lightweight collector API, stream processing pipeline for aggregation, and a frontend dashboard subscribing to WebSocket channels for live updates. Aggregates are persisted into time-series-friendly collections and pre-computed rollups.`,
    backend: `Collector API accepts batched events, validates schema, and enqueues them for processing. A set of workers consumes the queue, updates aggregate documents, and updates caches for fast reads. Admin APIs expose reports, filtering, and export endpoints.`,
    aiIntegration: `Optional anomaly detection uses a small ML worker that periodically analyzes aggregates and flags statistical anomalies. For root-cause suggestions, a light-weight model is used to surface probable causes from correlated signals.`,
    databaseDesign: `MongoDB stores raw events (retention policy) and materialized aggregates (per-minute, per-hour). Redis stores hot aggregates and serves as a pub/sub layer for live updates to the dashboard. Archival to object storage for long-term retention.`,
    challenges: `Balancing write throughput with the need for timely aggregates, designing shard keys to avoid hotspots, and keeping real-time dashboards snappy. Solutions included batching, incremental aggregation, and read caches.`,
    deployment: `Kubernetes or managed containers for the processing workers, a managed MongoDB cluster with appropriate indexes, Redis managed instance, and a CDN in front of the dashboard. Automated scaling based on ingestion metrics and alerts wired into PagerDuty.`,
  },
];

export default caseStudies;
