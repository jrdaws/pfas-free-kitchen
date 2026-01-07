# Machine Learning for Preview & Export System

## Research Question

Can we use machine learning to improve preview/export quality by:
1. Generating multiple variants
2. Testing them against each other ("battling")
3. Learning from user preferences and outcomes

**Answer**: Yes, and here's how.

---

## Part 1: What Can Be ML-Optimized?

### 1.1 Preview Generation

| Component | ML Application | Battle Criteria |
|-----------|---------------|-----------------|
| **Hero Sections** | Generate 3-5 variants with different layouts, copy, CTAs | User selection, engagement metrics |
| **Color Schemes** | Generate palettes from inspiration + variations | A/B test click-through, user preference |
| **Copy/Headlines** | Multiple headline variants with different angles | Conversion rate, time on page |
| **Component Selection** | Which components for which project type | Export success rate, user satisfaction |
| **Layout Decisions** | Grid vs. list, sidebar position, etc. | User preference, usability metrics |

### 1.2 Export Quality

| Component | ML Application | Battle Criteria |
|-----------|---------------|-----------------|
| **Code Structure** | Different architectural patterns | Build success, Lighthouse score |
| **Component Composition** | Monolithic vs. atomic components | Developer feedback, code reuse |
| **Styling Approach** | Tailwind inline vs. extracted classes | Bundle size, maintainability |
| **State Management** | Context vs. Zustand vs. Jotai | Performance, developer preference |

---

## Part 2: Architecture - The Battle System

### 2.1 Variant Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    VARIANT GENERATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Input ─────┬──────────────────────────────────────────┐   │
│  (config)        │                                          │   │
│                  ▼                                          │   │
│            ┌──────────┐                                     │   │
│            │ Variant  │                                     │   │
│            │ Generator│                                     │   │
│            └────┬─────┘                                     │   │
│                 │                                           │   │
│    ┌────────────┼────────────┐                             │   │
│    ▼            ▼            ▼                             │   │
│ ┌──────┐   ┌──────┐   ┌──────┐                            │   │
│ │ V1   │   │ V2   │   │ V3   │    N Variants              │   │
│ │Claude│   │GPT-4 │   │Gemini│    (different models/      │   │
│ │Sonnet│   │ Turbo│   │ Pro  │     prompts/params)        │   │
│ └──┬───┘   └──┬───┘   └──┬───┘                            │   │
│    │          │          │                                 │   │
│    └──────────┼──────────┘                                 │   │
│               ▼                                            │   │
│         ┌──────────┐                                       │   │
│         │ Variant  │                                       │   │
│         │  Store   │                                       │   │
│         └──────────┘                                       │   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Battle Arena System

```
┌─────────────────────────────────────────────────────────────────┐
│                      BATTLE ARENA                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    MATCHUP                              │     │
│  │                                                         │     │
│  │   ┌──────────┐         VS         ┌──────────┐         │     │
│  │   │ Variant  │                    │ Variant  │         │     │
│  │   │    A     │                    │    B     │         │     │
│  │   │          │                    │          │         │     │
│  │   │ [Select] │                    │ [Select] │         │     │
│  │   └──────────┘                    └──────────┘         │     │
│  │                                                         │     │
│  │   Evaluation Criteria:                                  │     │
│  │   □ User Selection (manual)                            │     │
│  │   □ Build Success (automated)                          │     │
│  │   □ Lighthouse Score (automated)                       │     │
│  │   □ Visual Similarity to Inspiration (AI-judged)      │     │
│  │   □ Code Quality Score (linting + complexity)         │     │
│  │                                                         │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    LEADERBOARD                          │     │
│  │                                                         │     │
│  │   Model/Prompt       Wins    Losses   Win Rate   Elo   │     │
│  │   ─────────────────────────────────────────────────────│     │
│  │   Claude Sonnet v2    45       12      78.9%    1847   │     │
│  │   GPT-4 Turbo         38       19      66.7%    1723   │     │
│  │   Gemini 1.5 Pro      29       28      50.9%    1612   │     │
│  │   Claude Sonnet v1    22       35      38.6%    1498   │     │
│  │                                                         │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Learning Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                      LEARNING LOOP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. GENERATE          2. BATTLE            3. LEARN            │
│   ───────────         ─────────            ────────             │
│                                                                  │
│   ┌─────────┐        ┌─────────┐        ┌─────────┐            │
│   │Generate │───────▶│ Users   │───────▶│ Update  │            │
│   │Variants │        │ Choose  │        │ Weights │            │
│   └─────────┘        └─────────┘        └─────────┘            │
│        ▲                                      │                  │
│        │                                      │                  │
│        └──────────────────────────────────────┘                  │
│                                                                  │
│   Learning Updates:                                              │
│   • Which model wins for which project type                     │
│   • Which prompt strategies work best                           │
│   • Which patterns users prefer                                 │
│   • Which features correlate with satisfaction                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Implementation Plan

### 3.1 Data Model

```typescript
// Variant tracking
interface GeneratedVariant {
  id: string;
  projectId: string;
  generatorConfig: {
    model: 'claude-sonnet' | 'gpt-4' | 'gemini-pro';
    promptVersion: string;
    temperature: number;
    systemPrompt: string;
  };
  output: {
    preview: string;       // HTML/React code
    screenshot?: string;   // Base64
    metrics: {
      generationTime: number;
      tokenCount: number;
      cost: number;
    };
  };
  createdAt: Date;
}

// Battle result
interface BattleResult {
  id: string;
  variantA: string;        // Variant ID
  variantB: string;
  winner: 'A' | 'B' | 'tie';
  context: {
    projectType: string;   // SaaS, ecommerce, etc.
    userExperience: 'beginner' | 'intermediate' | 'expert';
    criteria: string[];    // What user was judging
  };
  automatedScores?: {
    variantA: MetricScores;
    variantB: MetricScores;
  };
  createdAt: Date;
  userId?: string;
}

interface MetricScores {
  lighthousePerformance: number;
  lighthouseAccessibility: number;
  buildSuccess: boolean;
  bundleSize: number;
  codeComplexity: number;
  visualSimilarityToInspiration?: number;
}

// Leaderboard entry
interface ModelLeaderboard {
  modelConfig: string;     // Hash of config
  displayName: string;
  stats: {
    totalBattles: number;
    wins: number;
    losses: number;
    ties: number;
    eloRating: number;
  };
  byProjectType: Record<string, {
    wins: number;
    losses: number;
  }>;
}
```

### 3.2 API Routes

```typescript
// Generate variants for a project
POST /api/variants/generate
{
  projectConfig: ProjectConfig,
  count: 3,                          // How many variants
  models: ['claude-sonnet', 'gpt-4'] // Which models to use
}

// Get variants for comparison
GET /api/variants/:projectId

// Submit battle result
POST /api/battles/submit
{
  variantA: string,
  variantB: string,
  winner: 'A' | 'B' | 'tie',
  criteria: string[]
}

// Get leaderboard
GET /api/leaderboard
GET /api/leaderboard/:projectType

// Get recommendations based on project type
GET /api/recommendations/:projectType
```

### 3.3 UI Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    PREVIEW COMPARISON VIEW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Choose your preferred version:          [Skip] [Neither] │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────┐     ┌─────────────────────┐           │
│  │                     │     │                     │           │
│  │   Version A         │     │   Version B         │           │
│  │   (Claude Sonnet)   │     │   (GPT-4 Turbo)     │           │
│  │                     │     │                     │           │
│  │   ┌─────────────┐   │     │   ┌─────────────┐   │           │
│  │   │   Preview   │   │     │   │   Preview   │   │           │
│  │   │   Render    │   │     │   │   Render    │   │           │
│  │   │             │   │     │   │             │   │           │
│  │   │             │   │     │   │             │   │           │
│  │   └─────────────┘   │     │   └─────────────┘   │           │
│  │                     │     │                     │           │
│  │   [Choose This ✓]   │     │   [Choose This ✓]   │           │
│  │                     │     │                     │           │
│  └─────────────────────┘     └─────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Why did you choose this version?                         │   │
│  │  □ Better layout  □ Better colors  □ Better copy         │   │
│  │  □ More professional  □ More creative  □ Other: [____]   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 4: Battle Types

### 4.1 User-Judged Battles (Manual)

**When**: During preview step, show user 2-3 variants
**Criteria**: User preference, subjective quality
**Data Captured**: Selection + reasoning tags

```typescript
// Example battle flow
async function showPreviewBattle(projectConfig: ProjectConfig) {
  // Generate 2 variants with different models
  const variants = await generateVariants(projectConfig, {
    count: 2,
    models: ['claude-sonnet', 'gpt-4']
  });
  
  // Show comparison UI
  const result = await showComparisonModal(variants);
  
  // Record battle result
  await recordBattle({
    variantA: variants[0].id,
    variantB: variants[1].id,
    winner: result.choice,
    criteria: result.reasons
  });
  
  // Return winning variant for preview
  return variants[result.choice === 'A' ? 0 : 1];
}
```

### 4.2 Automated Battles (Metrics)

**When**: Background process, CI/CD
**Criteria**: Objective metrics (Lighthouse, build success, etc.)
**Data Captured**: Scores per variant

```typescript
// Automated quality testing
async function runAutomatedBattle(variantA: Variant, variantB: Variant) {
  // Export both variants
  const exportA = await exportVariant(variantA);
  const exportB = await exportVariant(variantB);
  
  // Run builds
  const buildA = await runBuild(exportA);
  const buildB = await runBuild(exportB);
  
  // Run Lighthouse
  const lighthouseA = await runLighthouse(exportA);
  const lighthouseB = await runLighthouse(exportB);
  
  // Calculate scores
  const scoreA = calculateOverallScore(buildA, lighthouseA);
  const scoreB = calculateOverallScore(buildB, lighthouseB);
  
  return {
    winner: scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'tie',
    scores: { A: scoreA, B: scoreB },
    details: { buildA, buildB, lighthouseA, lighthouseB }
  };
}
```

### 4.3 AI-Judged Battles (Visual)

**When**: Comparing visual similarity to inspiration
**Criteria**: How well does output match inspiration URL?
**Data Captured**: Similarity scores

```typescript
// AI visual comparison
async function runVisualBattle(
  variantA: Variant, 
  variantB: Variant,
  inspirationScreenshot: string
) {
  const prompt = `
    Compare these two website screenshots to the inspiration image.
    Rate each on a scale of 1-10 for:
    1. Visual similarity to inspiration
    2. Professional quality
    3. Modern design adherence
    4. Color harmony
    5. Typography quality
    
    Return JSON: { variantA: scores, variantB: scores, winner: 'A'|'B'|'tie' }
  `;
  
  const result = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', data: inspirationScreenshot } },
        { type: 'image', source: { type: 'base64', data: variantA.screenshot } },
        { type: 'image', source: { type: 'base64', data: variantB.screenshot } },
        { type: 'text', text: prompt }
      ]
    }]
  });
  
  return JSON.parse(result.content[0].text);
}
```

---

## Part 5: Learning & Optimization

### 5.1 What We Learn

| Data Point | Learning Outcome |
|------------|-----------------|
| Model wins by project type | Route SaaS to Claude, E-commerce to GPT-4 |
| Prompt version performance | Evolve prompts based on wins |
| User preference patterns | Personalize recommendations |
| Feature correlation | Which features predict success |
| Time-of-day patterns | Optimize when to generate |

### 5.2 Model Selection Strategy

```typescript
// Dynamic model selection based on battle history
async function selectBestModel(projectConfig: ProjectConfig) {
  const leaderboard = await getLeaderboard(projectConfig.template);
  
  // Get top performer for this project type
  const topModel = leaderboard[0];
  
  // But occasionally try challengers (exploration)
  const explorationRate = 0.1;
  if (Math.random() < explorationRate) {
    // Pick a random non-top model to give it a chance
    const challenger = leaderboard[Math.floor(Math.random() * leaderboard.length)];
    return challenger.modelConfig;
  }
  
  return topModel.modelConfig;
}
```

### 5.3 Prompt Evolution

```typescript
// Evolve prompts based on battle results
interface PromptGenome {
  id: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  stopSequences: string[];
  // Fitness from battles
  fitness: number;
  generation: number;
}

async function evolvePrompts() {
  // Get top performing prompts
  const topPrompts = await getTopPrompts(10);
  
  // Crossover: Combine elements from winners
  const children = crossover(topPrompts);
  
  // Mutation: Small random changes
  const mutated = mutate(children, 0.1);
  
  // Create new generation
  await createPromptGeneration(mutated);
}
```

---

## Part 6: Implementation Phases

### Phase 1: Basic Variant Generation (Week 1)

- [ ] Generate 2 variants per preview
- [ ] Simple A/B comparison UI
- [ ] Store battle results in Supabase
- [ ] Basic leaderboard display

### Phase 2: Automated Metrics (Week 2)

- [ ] Lighthouse integration
- [ ] Build success tracking
- [ ] Bundle size measurement
- [ ] Code complexity scoring

### Phase 3: Visual AI Judging (Week 3)

- [ ] Screenshot comparison
- [ ] Inspiration similarity scoring
- [ ] AI quality rating

### Phase 4: Learning Loop (Week 4)

- [ ] Model selection based on history
- [ ] Prompt evolution system
- [ ] Personalized recommendations
- [ ] A/B test the A/B system (meta!)

---

## Part 7: Technical Requirements

### Infrastructure

| Component | Technology |
|-----------|------------|
| Variant Storage | Supabase (PostgreSQL) |
| Battle Queue | Upstash Redis |
| Screenshots | Playwright + Vercel Blob |
| Lighthouse | Lighthouse CI |
| Model APIs | Anthropic, OpenAI, Google AI |

### Cost Considerations

| Operation | Est. Cost | Frequency |
|-----------|-----------|-----------|
| Generate 2 variants | ~$0.02 | Per preview |
| Lighthouse run | Free (self-hosted) | Per export |
| AI visual comparison | ~$0.01 | Per battle |
| Storage | ~$0.001 | Per variant |

**Monthly estimate for 1000 users**: ~$500

---

## Part 8: Example User Flow

```
1. User configures project
   └── Selects: SaaS template, dark mode, Stripe integration

2. System generates 3 variants
   └── Claude Sonnet (high creativity)
   └── GPT-4 (balanced)  
   └── Claude Sonnet (focused prompt)

3. User sees comparison modal
   └── "Which preview do you prefer?"
   └── Shows 2 at a time (tournament style)

4. User picks Variant A
   └── Tags: "Better colors", "More professional"

5. System records battle
   └── Variant A wins
   └── Updates Claude Sonnet ELO +15
   └── Updates GPT-4 ELO -15

6. User exports chosen variant
   └── Background: Run Lighthouse
   └── Background: Record export success

7. Next user with similar config
   └── System routes to Claude Sonnet (higher ELO for SaaS)
   └── But 10% chance to try GPT-4 (exploration)
```

---

## Part 9: Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| User preference accuracy | 70%+ | Top model selected by users |
| Export success rate | 95%+ | Builds without errors |
| Lighthouse score | 90+ avg | Automated testing |
| User satisfaction | 4.5/5 | Post-export survey |
| Model selection efficiency | 80%+ | Users don't change default |

---

## Part 10: Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API costs spike | High | Cap variants per user, cache results |
| Users skip battles | Medium | Make it optional, reward participation |
| Model API downtime | Medium | Fallback to cached best performer |
| Overfitting to power users | Medium | Weight by user diversity |
| Prompt evolution diverges | Low | Keep baseline prompt as anchor |

---

## Conclusion

Yes, we can absolutely apply ML to the preview/export system. The key insight is that we don't need to train a custom model - we can use existing LLMs and **learn which configurations work best** through a battle/tournament system.

This gives us:
1. **Better outputs** - Always use what works
2. **Continuous improvement** - Learn from every user
3. **Personalization** - Adapt to user preferences
4. **Cost optimization** - Route to cheapest model that wins

---

*Research by Research Agent*
*(RESEARCH AGENT)*

