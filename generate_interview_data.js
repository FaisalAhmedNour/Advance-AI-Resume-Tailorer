import fs from 'fs';

const data = [];
let idCounter = 1;

function add(category, keywords, question, answer) {
    data.push({
        id: `q_${idCounter++}`,
        category,
        keywords,
        question,
        answer
    });
}

// ── BACKEND (25) ──────────────────────────────────────────────────────────
const backendTech = ['Node.js', 'Express', 'Microservices', 'GraphQL', 'REST API', 'WebSockets'];
backendTech.forEach(tech => {
    add('backend', [tech.toLowerCase(), 'backend', 'architecture'],
        `How do you handle scalability when building applications with ${tech}?`,
        `When scaling ${tech} applications, I focus on horizontal scaling by running multiple instances behind a load balancer and keeping the application stateless so any instance can serve any request. I offload CPU-intensive tasks to worker threads or external queues to unblock the main event loop. Additionally, I implement caching strategies, such as using Redis for frequently accessed data, to reduce database load and improve response times.`
    );
    add('backend', [tech.toLowerCase(), 'security', 'auth'],
        `What are the most critical security considerations when deploying a ${tech} service?`,
        `Security for ${tech} requires validating and sanitizing all incoming data to prevent injection attacks and XSS. I ensure that authentication tokens, like JWTs, are securely signed, relatively short-lived, and optimally stored using HttpOnly cookies to mitigate token theft. Furthermore, I apply rate limiting to sensitive endpoints, configure secure CORS policies, and keep all dependencies aggressively patched to avoid known vulnerabilities.`
    );
    add('backend', [tech.toLowerCase(), 'performance', 'bottleneck'],
        `How do you profile and identify performance bottlenecks in a ${tech} environment?`,
        `I start by implementing structured logging and APM tools like Datadog or New Relic to monitor throughput, latency, and error rates across the ${tech} service. If a specific endpoint is slow, I'll use built-in profilers or flame graphs to trace CPU and memory usage down to the function level. Database interactions are often the culprit, so I analyze slow query logs and ensure optimal indexes are utilized before optimizing the application code itself.`
    );
    add('backend', [tech.toLowerCase(), 'error handling', 'robustness'],
        `Describe your strategy for robust error handling in a ${tech} application.`,
        `In a ${tech} application, I centralize error handling using an application-wide error middleware to catch both synchronous and asynchronous exceptions without crashing the process. I differentiate between operational errors (e.g., invalid input, network timeouts) which can be handled gracefully, and programmer errors (e.g., null references) which require failing fast and restarting the pod. All errors are logged with stack traces to an external aggregation service for alerting and debugging.`
    );
});
// Need 1 more to make 25 if 6 tech * 4 = 24. Let's add 1 extra.
add('backend', ['jwt', 'authentication', 'security'],
    `What is JSON Web Token (JWT) and how does it maintain state?`,
    `JWT is an open standard for securely transmitting information between parties as a JSON object, which is digitally signed to verify authenticity. Unlike traditional session IDs, JWTs are stateless; the server does not need to query a database to validate a session because the token payload itself contains the user claims. Implementing JWTs usually involves securely storing the token on the client and verifying the cryptographic signature on every protected request.`
);

// ── FRONTEND (25) ─────────────────────────────────────────────────────────
const frontendTech = ['React', 'Next.js', 'TypeScript', 'Redux', 'Vue'];
frontendTech.forEach(tech => {
    add('frontend', [tech.toLowerCase(), 'performance', 'rendering'],
        `What strategies do you use to optimize rendering performance in ${tech}?`,
        `To optimize ${tech}, I utilize code splitting to ensure users only download the JavaScript necessary for the current route, reducing the initial load time. I heavily employ memoization techniques to prevent unnecessary component re-renders when state or props haven't actually changed. Furthermore, I implement virtualized lists for large datasets and defer loading below-the-fold images or heavy components using lazy loading.`
    );
    add('frontend', [tech.toLowerCase(), 'state management', 'architecture'],
        `How do you determine the appropriate state management strategy when building with ${tech}?`,
        `Choosing a state management approach in ${tech} depends heavily on the scope and complexity of the data. For local UI state, I stick to built-in component state to keep things simple and isolated. For global application data like user sessions or cached API responses, I'll leverage a dedicated global store or a robust data-fetching library that handles caching, deduping, and background synchronization out of the box.`
    );
    add('frontend', [tech.toLowerCase(), 'accessibility', 'a11y'],
        `How do you ensure that your ${tech} applications remain accessible to all users?`,
        `Building accessible ${tech} applications starts with using semantic HTML tags and establishing a logical DOM structure to support screen readers natively. I rigorously test components for keyboard navigability, ensuring focus traps work correctly inside modals and focus outlines are distinctly visible. Additionally, I utilize automated accessibility linters in the CI pipeline to catch missing ARIA attributes and low color contrast ratios before PRs are merged.`
    );
    add('frontend', [tech.toLowerCase(), 'testing', 'quality'],
        `Describe your testing methodology for complex components in a ${tech} project.`,
        `My testing strategy for ${tech} favors integration tests that simulate actual user interactions rather than testing implementation details or internal state. I use modern testing libraries to mount components and interact with them via accessible roles, mocking out external API calls using service workers. For highly crucial user flows, such as checkout or authentication, I complement this with End-to-End tests running in headless browsers to verify the full stack integration.`
    );
});
// 5 extra to make 25
['Tailwind', 'CSS Modules', 'Webpack', 'Vite', 'Service Workers'].forEach(tech => {
    add('frontend', [tech.toLowerCase(), 'frontend', 'tooling'],
        `Explain the role of ${tech} in modern web development architectures.`,
        `${tech} fundamentally shifts how we handle frontend assets by optimizing the developer experience and production build times. It streamlines dependency management, applies advanced code transformations, and enforces consistency across a large codebase. By leveraging its caching and bundling mechanisms, engineering teams can ship smaller payloads to the client while maintaining rapid iteration cycles locally.`
    );
});

// ── SYSTEM DESIGN (25) ────────────────────────────────────────────────────
const sysConcepts = ['Caching', 'Load Balancing', 'Message Queues', 'Sharding', 'Rate Limiting', 'CDN'];
sysConcepts.forEach(concept => {
    add('system-design', [concept.toLowerCase(), 'scalability', 'architecture'],
        `In a high-throughput distributed system, how would you leverage ${concept}?`,
        `Integrating ${concept} is critical for scaling high-throughput applications as it significantly mitigates performance bottlenecks and single points of failure. By implementing it strategically, we can distribute traffic spikes, reduce the burden on our primary databases, and ensure consistent availability even during partial network degradation. The key challenge lies in orchestrating cache invalidation or handling distributed consensus, which requires careful configuration of TTLs and network partitions.`
    );
    add('system-design', [concept.toLowerCase(), 'trade-offs', 'consistency'],
        `What are the primary trade-offs you consider when implementing ${concept}?`,
        `The introduction of ${concept} fundamentally requires balancing strict data consistency against system availability and latency. It adds an additional layer of architectural complexity, requiring specialized monitoring, failover mechanics, and deployment pipelines. While it substantially increases request throughput, engineers must be prepared to handle eventual consistency anomalies, stale data scenarios, and potential configuration drift across the distributed cluster.`
    );
    add('system-design', [concept.toLowerCase(), 'failure', 'resilience'],
        `How does ${concept} improve fault tolerance, and what happens if it fails entirely?`,
        `${concept} isolates failures by acting as a buffer or redundant pathway, ensuring that targeted outages don't cascade into total system collapse. If the ${concept} layer itself fails, the architecture must rely on fallback mechanisms—such as graceful degradation to slower data sources or deploying circuit breakers to prevent overwhelming downstream services. Automated health checks and self-healing orchestrators are required to rapidly replace the failing nodes.`
    );
    add('system-design', [concept.toLowerCase(), 'metrics', 'monitoring'],
        `Which key metrics would you monitor to ensure your ${concept} implementation remains healthy?`,
        `To accurately monitor ${concept}, I would track saturation metrics like memory utilization, network I/O, and CPU load to anticipate scaling thresholds. Specifically against the operational layer, I monitor hit rates, queue depths, and eviction counts to ensure the configuration aligns with the actual traffic patterns. Anomalies in p99 processing latency or an uptick in connection timeouts usually serve as the first warning signs of impending degradation.`
    );
});
add('system-design', ['cap theorem', 'consistency', 'availability', 'partition tolerance'],
    `Explain the CAP theorem and how it influences your architectural decisions.`,
    `The CAP theorem states that a distributed data store can only guarantee two of three attributes: Consistency, Availability, and Partition tolerance. Because network partitions are inevitable in real-world infrastructure, I must inherently choose between Availability (AP) and Consistency (CP). For systems like financial ledgers, I design for CP to prevent incorrect read/writes, whereas for social media feeds, I optimize for AP to keep the platform highly responsive despite temporary data staleness.`
);


// ── DATABASE (25) ─────────────────────────────────────────────────────────
const dbConcepts = ['PostgreSQL', 'MongoDB', 'Redis', 'SQL vs NoSQL', 'Database Indexing'];
dbConcepts.forEach(concept => {
    add('database', [concept.toLowerCase(), 'database', 'optimization'],
        `How do you optimize query performance when working with ${concept}?`,
        `Query optimization in ${concept} starts with analyzing the query execution plan to understand how the engine scans the data and where sequential scans result in expensive I/O operations. I introduce composite indexes based on common filter and sort dimensions, being careful not to over-index and degrade write performance. For highly recurrent analytical queries, I look into denormalization or materialized views to pre-compute expensive joins.`
    );
    add('database', [concept.toLowerCase(), 'acid', 'transactions'],
        `Describe the importance of ACID compliance in the context of ${concept}.`,
        `ACID properties (Atomicity, Consistency, Isolation, Durability) are critical for ensuring data integrity, especially during complex multi-step operations where partial failures would corrupt the system state. Using ${concept}, we can wrap distinct operations within a transaction so that they execute securely as a single unit or completely rollback if a constraint is violated. This ensures our critical business logic, such as financial transfers, remains invulnerable to race conditions or sudden server crashes.`
    );
    add('database', [concept.toLowerCase(), 'migration', 'schema'],
        `What is your approach to executing zero-downtime database migrations with ${concept}?`,
        `A zero-downtime migration with ${concept} requires executing the change in multiple backward-compatible phases rather than a single massive schema alteration. First, I apply the database schema changes (like adding a new table or nullable column) without mutating existing data. Once the application is updated to write to both the old and new structures, a background script safely backfills the historical data, allowing us to eventually deprecate and drop the legacy columns in a final, separate deployment.`
    );
    add('database', [concept.toLowerCase(), 'scaling', 'replication'],
        `Explain the difference between read replicas and sharding when scaling ${concept}.`,
        `Scaling ${concept} via read replicas involves duplicating the entire dataset to multiple nodes, which is highly effective for read-heavy applications since queries can be distributed away from the primary writer node. Sharding, conversely, partitions the dataset horizontally across completely distinct servers based on a shard key. While sharding massively scales both read and write capacities to handle enormous datasets, it introduces significant complexity in managing cross-shard aggregations and application routing logic.`
    );
});
['Elasticsearch', 'Cassandra', 'DynamoDB', 'Neo4j', 'Prisma'].forEach(tech => {
    add('database', [tech.toLowerCase(), 'nosql', 'specialized db'],
        `When would you definitively choose ${tech} over a traditional relational database?`,
        `I would choose ${tech} whenever the data model structure inherently resists rigid tabular schemas, or when the sheer volume and velocity of ingestion eclipse the write capacities of a single relational instance. ${tech} is specifically designed to handle highly connected data, unstructured documents, or rapid time-series event streams securely. The trade-off requires abandoning strict SQL compliance and navigating eventual consistency, but it massively unlocks scale for those specific operational constraints.`
    );
});

// ── DEVOPS (10) ───────────────────────────────────────────────────────────
const devopsTech = ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform'];
devopsTech.forEach(tech => {
    add('devops', [tech.toLowerCase(), 'infrastructure', 'deployment'],
        `How does implementing ${tech} streamline the deployment lifecycle?`,
        `Implementing ${tech} significantly reduces the friction between development and production environments by ensuring environmental consistency and programmatic infrastructure. It replaces manual, error-prone server configurations with declarative, version-controlled definitions that can be repeatedly spun up or torn down. This enables continuous integration pipelines to automatically test, build, and seamlessly deploy artifacts, resulting in faster release velocity and reduced mean-time-to-recovery during incidents.`
    );
    add('devops', [tech.toLowerCase(), 'security', 'compliance'],
        `What security best practices do you enforce when managing ${tech}?`,
        `Securing ${tech} requires adhering strongly to the principle of least privilege, ensuring that roles, policies, and service accounts are granted only the precise permissions required to function. I rely on automated scanning tools to catch misconfigurations, hardcoded secrets, or vulnerable dependencies within the infrastructure definitions before they reach production. Furthermore, I mandate strict network isolation, encrypted transit, and immutable audit logging to defend against internal and external threat vectors.`
    );
});

// ── BEHAVIORAL (10) ───────────────────────────────────────────────────────
const behaviors = [
    { k: 'conflict', q: 'Tell me about a time you had a technical disagreement with a colleague.' },
    { k: 'leadership', q: 'Describe a situation where you had to lead a project without formal authority.' },
    { k: 'failure', q: 'Can you share an example of a time when a project you were working on failed?' },
    { k: 'tight deadline', q: 'How do you prioritize tasks when working under an aggressively tight deadline?' },
    { k: 'mentoring', q: 'Tell me about a time you mentored a junior team member.' },
    { k: 'code review', q: 'How do you handle receiving highly critical feedback during a code review?' },
    { k: 'ambiguity', q: 'Describe a time you were assigned a task with extremely ambiguous requirements.' },
    { k: 'learning', q: 'How do you stay up-to-date with new technologies and decide when to adopt them?' },
    { k: 'production bug', q: 'Tell me about the most difficult production bug you ever had to track down.' },
    { k: 'pushback', q: 'Have you ever had to push back against a product requirement? How did you handle it?' }
];

behaviors.forEach(b => {
    add('behavioral', [b.k.toLowerCase(), 'soft skills', 'experience', 'behavioral'],
        b.q,
        `I approach these situations by separating my ego from the objective, focusing exclusively on what drives the best outcome for the user and the business. I lean heavily on transparent, empathetic communication to align stakeholders and ensure all perspectives are validated before moving forward. Ultimately, analyzing historical metrics, seeking external consultation, and applying structured retrospective frameworks ensures that the team successfully navigates the challenge and learns from it collectively.`
    );
});

const jsonOutput = JSON.stringify(data, null, 2);
const outputContent = `export interface InterviewQuestion {
  id: string;
  category: string;
  keywords: string[];
  question: string;
  answer: string;
}

export const interviewData: InterviewQuestion[] = ${jsonOutput};
`;

fs.writeFileSync('frontend/src/data/interviewData.ts', outputContent);
console.log('Successfully generated ' + data.length + ' questions.');
