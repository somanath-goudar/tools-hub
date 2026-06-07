// Single source of truth for the tools hub.
// Every page (cluster hubs + tool/long-tail pages) is generated from this data.
// Adding a tool = adding an entry here + (if a new compute shape) an API variant.

export type Cluster = {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
};

export type Faq = { q: string; a: string };

export type ToolPage = {
  cluster: string; // cluster slug
  slug: string; // url slug within the cluster
  primaryKeyword: string;
  title: string; // <title> — keyword first, brand last
  h1: string;
  metaDescription: string;
  intro: string; // keyword-rich first paragraph, rendered static
  /** API endpoint group + variant the island calls. */
  api: { group: string; test: string };
  /** Calculator config for the "numeric groups" widget. */
  widget: {
    kind: 'numeric-groups';
    groupsDefault: number;
    groupsFixed: boolean; // true = user cannot add/remove groups (e.g. t-test = exactly 2)
    groupLabel: string; // e.g. "Group" or "Sample"
  };
  sample: number[][]; // one-click "Try sample data"
  explainerHtml: string; // 300-600 word explainer (static HTML)
  faq: Faq[];
  related: string[]; // slugs within the same cluster
};

export const CLUSTERS: Cluster[] = [
  {
    slug: 'statistics',
    name: 'Statistics',
    emoji: '📊',
    blurb:
      'Free statistics calculators for students and researchers — hypothesis tests, descriptive stats, probability, and more. No signup, instant results, plain-English interpretation.',
  },
  // finance / developer / writing clusters added as their tools are built.
];

export const TOOLS: ToolPage[] = [
  // ── Statistics · Hypothesis tests (one shared numeric-groups widget + scipy endpoint) ──
  {
    cluster: 'statistics',
    slug: 't-test-calculator',
    primaryKeyword: 't test calculator',
    title: 'T Test Calculator (Independent Two-Sample) — Free with Steps',
    h1: 'T-Test Calculator',
    metaDescription:
      'Free independent two-sample t-test calculator. Paste your two groups, get the t statistic, p-value, degrees of freedom, effect size (Cohen’s d) and a plain-English verdict — APA formatted.',
    intro:
      'Run an independent two-sample t-test in your browser. Paste two groups of numbers and get the t statistic, degrees of freedom, p-value, 95% confidence interval, and Cohen’s d effect size — with a plain-English verdict and an APA-formatted result you can copy straight into your paper.',
    api: { group: 'stats', test: 'ttest_ind' },
    widget: { kind: 'numeric-groups', groupsDefault: 2, groupsFixed: true, groupLabel: 'Group' },
    sample: [
      [23, 25, 21, 30, 28, 26, 24, 27, 29, 22],
      [31, 35, 29, 38, 34, 36, 33, 37, 32, 40],
    ],
    explainerHtml: `
      <h2>How to interpret a two-sample t-test</h2>
      <p>An <strong>independent two-sample t-test</strong> checks whether the means of two separate groups are different enough that the difference is unlikely to be due to chance. It is the right test when you have two unrelated samples of a continuous measurement — for example, test scores for a control group versus a treatment group.</p>
      <p>The calculator returns four numbers that matter:</p>
      <ul>
        <li><strong>t statistic</strong> — how big the difference is relative to the spread in the data. Bigger absolute values mean a stronger signal.</li>
        <li><strong>p-value</strong> — the probability of seeing a difference this large if the two groups really had the same mean. If <em>p &lt; 0.05</em>, the difference is conventionally called statistically significant.</li>
        <li><strong>degrees of freedom (df)</strong> — based on your sample sizes; reported for completeness and APA write-ups.</li>
        <li><strong>Cohen’s d</strong> — the effect size. A p-value tells you <em>if</em> there is a difference; Cohen’s d tells you <em>how big</em> it is (0.2 small, 0.5 medium, 0.8 large).</li>
      </ul>
      <p>This tool uses <strong>Welch’s t-test</strong> by default, which does not assume the two groups have equal variances — the safer choice recommended by most modern statistics guidance. Your data never leaves the request: numbers are computed and the result returned, nothing is stored.</p>
    `,
    faq: [
      {
        q: 'What is a good p-value for a t-test?',
        a: 'By convention, a p-value below 0.05 is considered statistically significant, meaning the observed difference between the two group means is unlikely to be due to chance. Some fields use stricter thresholds such as 0.01.',
      },
      {
        q: 'Should I use a paired or independent t-test?',
        a: 'Use an independent t-test when the two groups contain different, unrelated subjects. Use a paired t-test when the same subjects are measured twice (for example, before and after a treatment).',
      },
      {
        q: 'What is Cohen’s d?',
        a: 'Cohen’s d is the standardized effect size — the difference between the two means expressed in standard-deviation units. Roughly, 0.2 is a small effect, 0.5 medium, and 0.8 or above large.',
      },
      {
        q: 'Does this t-test assume equal variances?',
        a: 'No. This calculator uses Welch’s t-test by default, which does not assume the two groups have equal variances and is robust when sample sizes differ.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Your numbers are sent to the calculator, the statistics are computed in memory, and the result is returned. Nothing is saved.',
      },
    ],
    related: ['paired-t-test-calculator', 'anova-calculator', 'mann-whitney-u-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'paired-t-test-calculator',
    primaryKeyword: 'paired t test calculator',
    title: 'Paired T-Test Calculator — Free, with Effect Size & Steps',
    h1: 'Paired T-Test Calculator',
    metaDescription:
      'Free paired (dependent) samples t-test calculator. Paste your before/after values and get the t statistic, p-value, mean difference, Cohen’s d and a plain-English verdict.',
    intro:
      'Run a paired-samples t-test (also called a dependent t-test) for before/after or matched data. Paste two equal-length columns and get the t statistic, degrees of freedom, p-value, mean difference and Cohen’s d — with a plain-English verdict and APA-formatted output.',
    api: { group: 'stats', test: 'ttest_paired' },
    widget: { kind: 'numeric-groups', groupsDefault: 2, groupsFixed: true, groupLabel: 'Condition' },
    sample: [
      [88, 92, 75, 80, 95, 70, 85, 90],
      [91, 95, 80, 86, 98, 78, 89, 96],
    ],
    explainerHtml: `
      <h2>When to use a paired t-test</h2>
      <p>A <strong>paired t-test</strong> compares two measurements taken on the <em>same</em> subjects — for example, each student’s score before and after a course, or each patient’s blood pressure on two days. Because the two columns are linked subject-by-subject, the test analyses the <strong>difference</strong> within each pair, which removes person-to-person variability and makes it more powerful than an independent t-test when the design is matched.</p>
      <p>Both columns must be the <strong>same length</strong> and in the <strong>same order</strong> (row 1 of column A pairs with row 1 of column B). The calculator reports the t statistic, degrees of freedom, p-value, the mean of the differences, and Cohen’s d for paired data so you can judge both significance and effect size.</p>
    `,
    faq: [
      {
        q: 'What is the difference between a paired and independent t-test?',
        a: 'A paired t-test is used when the same subjects are measured twice (before/after). An independent t-test is used when the two groups are made up of different subjects.',
      },
      {
        q: 'Do both columns need to be the same length?',
        a: 'Yes. A paired t-test requires equal-length columns because each value in the first column is matched to the value in the same position in the second column.',
      },
      {
        q: 'What does a significant paired t-test mean?',
        a: 'A p-value below 0.05 means the average change between the two conditions is unlikely to be zero by chance — there is evidence of a real before/after difference.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Values are computed in memory and the result is returned; nothing is saved.',
      },
    ],
    related: ['t-test-calculator', 'anova-calculator', 'mann-whitney-u-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'anova-calculator',
    primaryKeyword: 'anova calculator',
    title: 'One-Way ANOVA Calculator — Free, with F, p-value & η²',
    h1: 'One-Way ANOVA Calculator',
    metaDescription:
      'Free one-way ANOVA calculator. Paste two or more groups and get the F statistic, p-value, degrees of freedom and eta-squared effect size, with a plain-English verdict.',
    intro:
      'Run a one-way ANOVA to compare the means of two or more groups at once. Paste each group as a column and get the F statistic, both degrees of freedom, the p-value and eta-squared (η²) effect size — with a plain-English verdict and APA-formatted output.',
    api: { group: 'stats', test: 'anova' },
    widget: { kind: 'numeric-groups', groupsDefault: 3, groupsFixed: false, groupLabel: 'Group' },
    sample: [
      [55, 60, 52, 58, 63],
      [70, 72, 68, 74, 71],
      [65, 67, 63, 69, 66],
    ],
    explainerHtml: `
      <h2>What a one-way ANOVA tells you</h2>
      <p>A <strong>one-way ANOVA</strong> (analysis of variance) tests whether <em>three or more</em> group means are all equal, in a single test. Running many t-tests instead would inflate your false-positive rate; ANOVA controls that by asking one overall question: is there any difference between the groups?</p>
      <p>The <strong>F statistic</strong> is the ratio of variation <em>between</em> groups to variation <em>within</em> groups. A large F with a <strong>p-value below 0.05</strong> means at least one group mean differs from the others — though ANOVA alone does not tell you <em>which</em> one (that needs a post-hoc test). The calculator also reports <strong>eta-squared (η²)</strong>, the proportion of total variance explained by group membership: roughly 0.01 small, 0.06 medium, 0.14 large.</p>
    `,
    faq: [
      {
        q: 'How many groups do I need for ANOVA?',
        a: 'ANOVA works with two or more groups, but it is most useful with three or more. With exactly two groups it gives the same p-value as an independent t-test.',
      },
      {
        q: 'What does a significant ANOVA result mean?',
        a: 'A p-value below 0.05 means at least one group mean is different from the others. It does not tell you which group — that requires a post-hoc test such as Tukey’s HSD.',
      },
      {
        q: 'What is eta-squared?',
        a: 'Eta-squared (η²) is the effect size for ANOVA — the share of total variance explained by the grouping. Guidelines: about 0.01 small, 0.06 medium, 0.14 large.',
      },
      {
        q: 'Do the groups need to be the same size?',
        a: 'No. One-way ANOVA handles unequal group sizes. Just paste each group as its own column.',
      },
    ],
    related: ['t-test-calculator', 'paired-t-test-calculator', 'mann-whitney-u-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'mann-whitney-u-calculator',
    primaryKeyword: 'mann whitney u calculator',
    title: 'Mann-Whitney U Test Calculator — Free Non-Parametric Test',
    h1: 'Mann-Whitney U Test Calculator',
    metaDescription:
      'Free Mann-Whitney U test calculator (Wilcoxon rank-sum). Paste two groups and get the U statistic, z, p-value and effect size — the non-parametric alternative to the t-test.',
    intro:
      'Run a Mann-Whitney U test (Wilcoxon rank-sum), the non-parametric alternative to the independent t-test, when your data is ordinal or not normally distributed. Paste two groups and get the U statistic, z approximation, p-value and rank-biserial effect size with a plain-English verdict.',
    api: { group: 'stats', test: 'mannwhitney' },
    widget: { kind: 'numeric-groups', groupsDefault: 2, groupsFixed: true, groupLabel: 'Group' },
    sample: [
      [7, 5, 8, 6, 9, 4, 7, 6],
      [12, 10, 14, 11, 13, 9, 15, 12],
    ],
    explainerHtml: `
      <h2>When to use the Mann-Whitney U test</h2>
      <p>The <strong>Mann-Whitney U test</strong> (also called the Wilcoxon rank-sum test) compares two independent groups <em>without</em> assuming the data is normally distributed. Instead of comparing means, it ranks all the values together and checks whether one group tends to have higher ranks than the other. That makes it the right choice for <strong>ordinal data</strong> (e.g. Likert ratings), skewed data, or small samples where a t-test’s normality assumption is doubtful.</p>
      <p>The calculator returns the <strong>U statistic</strong>, a <strong>z approximation</strong>, the <strong>p-value</strong>, and the <strong>rank-biserial correlation</strong> as an effect size. A p-value below 0.05 means the two distributions differ in location — one group reliably tends to score higher than the other.</p>
    `,
    faq: [
      {
        q: 'When should I use Mann-Whitney instead of a t-test?',
        a: 'Use the Mann-Whitney U test when your data is ordinal, clearly non-normal, or your samples are small. It compares ranks rather than means, so it does not require the normality assumption of a t-test.',
      },
      {
        q: 'Is the Mann-Whitney U test the same as the Wilcoxon rank-sum test?',
        a: 'Yes. The Mann-Whitney U test and the Wilcoxon rank-sum test are mathematically equivalent and give the same p-value.',
      },
      {
        q: 'What effect size goes with Mann-Whitney?',
        a: 'The rank-biserial correlation is the standard effect size. It ranges from -1 to 1; values further from zero indicate a stronger separation between the two groups.',
      },
      {
        q: 'Do the two groups need equal sizes?',
        a: 'No. The Mann-Whitney U test handles unequal group sizes.',
      },
    ],
    related: ['t-test-calculator', 'paired-t-test-calculator', 'anova-calculator'],
  },
];

// ── helpers ──
export function toolsInCluster(clusterSlug: string): ToolPage[] {
  return TOOLS.filter((t) => t.cluster === clusterSlug);
}

export function getTool(cluster: string, slug: string): ToolPage | undefined {
  return TOOLS.find((t) => t.cluster === cluster && t.slug === slug);
}

export function getCluster(slug: string): Cluster | undefined {
  return CLUSTERS.find((c) => c.slug === slug);
}
