// Single source of truth for the tools hub.
// Every page (cluster hubs + tool/long-tail pages) is generated from this data.
// Adding a tool = adding an entry here + (if a new compute shape) an API variant + a widget.

export type Cluster = {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
};

export type Faq = { q: string; a: string };

// ── widget configs (discriminated union by `kind`) ──
export type NumericGroupsWidget = {
  kind: 'numeric-groups';
  groupsDefault: number;
  groupsFixed: boolean; // true = user cannot add/remove groups (e.g. t-test = exactly 2)
  groupLabel: string; // e.g. "Group" or "Sample"
  sample: number[][]; // one-click "Try sample data"
};

export type LoanWidget = {
  kind: 'loan';
  defaults: {
    principal: number;
    rate: number; // annual %
    years: number;
    extra: number; // extra payment per period
    frequency: 'monthly' | 'biweekly';
  };
  emphasizeExtra: boolean; // surface the extra-payment field prominently
  showFrequency: boolean; // show the monthly/biweekly toggle
};

export type TextWidget = {
  kind: 'text';
  placeholder: string;
  sample: string; // one-click "Try sample text"
  action?: string; // primary-button label (default: "Analyze readability")
  minWords?: number; // minimum words before submit (default: 10)
};

export type RegexWidget = {
  kind: 'regex';
  mode: 'match' | 'replace';
  patternDefault: string;
  flagsDefault: string[]; // subset of IGNORECASE|MULTILINE|DOTALL|VERBOSE|ASCII
  testDefault: string;
  replaceDefault?: string; // only used in replace mode
};

export type SavingsWidget = {
  kind: 'savings';
  defaults: {
    principal: number; // initial deposit
    contribution: number; // per-period contribution
    rate: number; // annual %
    years: number;
    frequency: 'monthly' | 'annually'; // contribution + compounding frequency
  };
};

export type JsonWidget = {
  kind: 'json';
  mode: 'pretty' | 'minify';
  sample: string;
  strict?: boolean; // validator mode: reject non-JSON instead of accepting Python literals
  action?: string; // primary-button label override
};

export type Widget =
  | NumericGroupsWidget
  | LoanWidget
  | TextWidget
  | RegexWidget
  | SavingsWidget
  | JsonWidget;

export type ToolPage = {
  cluster: string; // cluster slug
  slug: string; // url slug within the cluster
  primaryKeyword: string;
  title: string; // <title> — keyword first, brand last
  h1: string;
  metaDescription: string;
  intro: string; // keyword-rich first paragraph, rendered static
  api: { group: string; test: string }; // endpoint group + variant the island calls
  widget: Widget;
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
  {
    slug: 'finance',
    name: 'Finance',
    emoji: '💰',
    blurb:
      'Free finance calculators with full schedules and charts — loan amortization, extra-payment and biweekly scenarios, payoff timelines. No signup, nothing stored.',
  },
  {
    slug: 'writing',
    name: 'Writing',
    emoji: '✍️',
    blurb:
      'Free writing calculators that score your text instantly — readability grades, reading ease, reading level and reading time. Paste your text, get plain-English feedback. No signup, nothing stored.',
  },
  {
    slug: 'developer',
    name: 'Developer',
    emoji: '💻',
    blurb:
      'Free developer tools that run real Python under the hood — regex tester (Python re flavor), pattern matching, capture groups and substitution. No signup, nothing stored.',
  },
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
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 2,
      groupsFixed: true,
      groupLabel: 'Group',
      sample: [
        [23, 25, 21, 30, 28, 26, 24, 27, 29, 22],
        [31, 35, 29, 38, 34, 36, 33, 37, 32, 40],
      ],
    },
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
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 2,
      groupsFixed: true,
      groupLabel: 'Condition',
      sample: [
        [88, 92, 75, 80, 95, 70, 85, 90],
        [91, 95, 80, 86, 98, 78, 89, 96],
      ],
    },
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
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 3,
      groupsFixed: false,
      groupLabel: 'Group',
      sample: [
        [55, 60, 52, 58, 63],
        [70, 72, 68, 74, 71],
        [65, 67, 63, 69, 66],
      ],
    },
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
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 2,
      groupsFixed: true,
      groupLabel: 'Group',
      sample: [
        [7, 5, 8, 6, 9, 4, 7, 6],
        [12, 10, 14, 11, 13, 9, 15, 12],
      ],
    },
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

  // ── Statistics · Descriptive stats (single-data-set numeric-groups widget + scipy `describe`) ──
  {
    cluster: 'statistics',
    slug: 'standard-deviation-calculator',
    primaryKeyword: 'standard deviation calculator',
    title: 'Standard Deviation Calculator — Sample & Population, with Steps',
    h1: 'Standard Deviation Calculator',
    metaDescription:
      'Free standard deviation calculator. Paste your data to get the sample (s) and population (σ) standard deviation, plus variance, mean, and the full set of descriptive statistics.',
    intro:
      'Calculate the standard deviation of your data in one step. Paste a list of numbers and get both the sample standard deviation (s) and the population standard deviation (σ), along with the variance, mean, median and a full descriptive-statistics breakdown — so you can see exactly how spread out your data is.',
    api: { group: 'stats', test: 'describe' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your data',
      sample: [[85, 90, 78, 92, 88, 76, 95, 89, 84, 91]],
    },
    explainerHtml: `
      <h2>Sample vs population standard deviation</h2>
      <p><strong>Standard deviation</strong> measures how spread out a set of numbers is around the mean. A small standard deviation means the values cluster tightly around the average; a large one means they are widely scattered. It is the square root of the variance, which puts it back in the same units as your data.</p>
      <p>The key choice is <strong>sample</strong> versus <strong>population</strong>:</p>
      <ul>
        <li><strong>Sample standard deviation (s)</strong> divides by <em>n − 1</em> (Bessel’s correction). Use it when your data is a <em>sample</em> drawn from a larger group you want to make inferences about — this is the most common case.</li>
        <li><strong>Population standard deviation (σ)</strong> divides by <em>n</em>. Use it only when your data represents the <em>entire</em> population.</li>
      </ul>
      <p>This calculator reports both so you can pick the right one, and it shows the variance, mean, median, range and quartiles alongside. The formula for the sample version is <code>s = √[ Σ(xᵢ − x̄)² / (n − 1) ]</code>. Your numbers are computed in memory and nothing is stored.</p>
    `,
    faq: [
      {
        q: 'Should I use sample or population standard deviation?',
        a: 'Use the sample standard deviation (dividing by n − 1) when your data is a sample from a larger population, which is the usual situation. Use the population standard deviation (dividing by n) only when your data covers the entire population.',
      },
      {
        q: 'What is the difference between standard deviation and variance?',
        a: 'Variance is the average of the squared differences from the mean; standard deviation is its square root. Standard deviation is in the same units as your data, which makes it easier to interpret.',
      },
      {
        q: 'What does a high standard deviation mean?',
        a: 'A high standard deviation means the values are spread out widely from the mean; a low one means they are clustered close to it. It is a direct measure of variability.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Your numbers are computed in memory and the result is returned. Nothing is saved.',
      },
    ],
    related: ['variance-calculator', 'mean-median-mode-calculator', 'descriptive-statistics-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'mean-median-mode-calculator',
    primaryKeyword: 'mean median mode calculator',
    title: 'Mean, Median, Mode Calculator — Free, with Range & Steps',
    h1: 'Mean, Median & Mode Calculator',
    metaDescription:
      'Free mean, median and mode calculator. Paste your numbers to get the mean (average), median, mode and range instantly — plus standard deviation and full descriptive statistics.',
    intro:
      'Find the mean, median and mode of any data set at once. Paste your numbers to get the mean (average), the median (middle value), the mode (most frequent value) and the range — along with standard deviation, quartiles and a full descriptive-statistics summary.',
    api: { group: 'stats', test: 'describe' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your data',
      sample: [[4, 8, 15, 16, 16, 23, 42, 16, 8]],
    },
    explainerHtml: `
      <h2>Mean, median and mode — the three averages</h2>
      <p>These three “measures of central tendency” each describe the centre of your data in a different way, and which one is most useful depends on your data’s shape.</p>
      <ul>
        <li><strong>Mean</strong> — the arithmetic average: add up all the values and divide by how many there are. It uses every value, but is sensitive to outliers.</li>
        <li><strong>Median</strong> — the middle value when the numbers are sorted (or the average of the two middle values). It is robust to outliers, which is why incomes and house prices are usually reported as medians.</li>
        <li><strong>Mode</strong> — the value that appears most often. A data set can have one mode, several modes, or none if every value is unique.</li>
      </ul>
      <p>When the mean and median are close, your data is roughly symmetric. When the mean is pulled well above or below the median, the data is skewed and the median is often the more honest summary. This calculator reports all three plus the range and full descriptive statistics, so you can compare them at a glance. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'What is the difference between mean, median and mode?',
        a: 'The mean is the arithmetic average, the median is the middle value when the data is sorted, and the mode is the most frequently occurring value. They can differ a lot when the data is skewed or has outliers.',
      },
      {
        q: 'When should I use the median instead of the mean?',
        a: 'Use the median when your data has outliers or is skewed, because it is not distorted by extreme values. This is why median income and median house price are commonly reported instead of the mean.',
      },
      {
        q: 'Can a data set have more than one mode?',
        a: 'Yes. A data set can be bimodal or multimodal if several values tie for the highest frequency, and it has no mode if every value occurs exactly once. This calculator lists all modes it finds.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Everything is computed in memory and nothing you enter is saved.',
      },
    ],
    related: ['standard-deviation-calculator', 'variance-calculator', 'descriptive-statistics-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'variance-calculator',
    primaryKeyword: 'variance calculator',
    title: 'Variance Calculator — Sample & Population Variance, Free',
    h1: 'Variance Calculator',
    metaDescription:
      'Free variance calculator. Paste your data to get the sample variance (s²) and population variance (σ²), plus standard deviation, mean and full descriptive statistics.',
    intro:
      'Calculate the variance of your data set instantly. Paste your numbers to get both the sample variance (s²) and the population variance (σ²), along with the standard deviation, mean and a complete descriptive-statistics breakdown.',
    api: { group: 'stats', test: 'describe' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your data',
      sample: [[12, 15, 17, 20, 22, 25, 30, 18, 16, 19]],
    },
    explainerHtml: `
      <h2>What variance measures</h2>
      <p><strong>Variance</strong> quantifies how far a set of numbers is spread out from their mean. It is calculated by taking each value’s difference from the mean, squaring it (so positives and negatives don’t cancel out), and averaging those squared differences. Because the differences are squared, variance is in <em>squared units</em> — which is why people often take its square root, the standard deviation, to get back to the original units.</p>
      <p>As with standard deviation, there are two versions:</p>
      <ul>
        <li><strong>Sample variance (s²)</strong> divides the sum of squared differences by <em>n − 1</em>. Use this when your data is a sample of a larger population.</li>
        <li><strong>Population variance (σ²)</strong> divides by <em>n</em>. Use this when your data is the whole population.</li>
      </ul>
      <p>This calculator reports both, plus the standard deviation and the rest of the descriptive statistics. A larger variance means more variability in your data. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'What is the difference between sample and population variance?',
        a: 'Sample variance divides by n − 1 and is used when your data is a sample of a larger group. Population variance divides by n and is used when your data is the entire population. This tool shows both.',
      },
      {
        q: 'Why is variance squared?',
        a: 'Variance squares each deviation from the mean so that positive and negative differences do not cancel out. The trade-off is that variance is in squared units, which is why standard deviation (its square root) is often preferred for interpretation.',
      },
      {
        q: 'How is variance related to standard deviation?',
        a: 'Standard deviation is simply the square root of the variance. Variance emphasises larger deviations more (because of squaring), while standard deviation is in the same units as the data.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Calculations run in memory and the result is returned; nothing is saved.',
      },
    ],
    related: ['standard-deviation-calculator', 'mean-median-mode-calculator', 'descriptive-statistics-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'descriptive-statistics-calculator',
    primaryKeyword: 'descriptive statistics calculator',
    title: 'Descriptive Statistics Calculator — Mean, SD, Quartiles & More',
    h1: 'Descriptive Statistics Calculator',
    metaDescription:
      'Free descriptive statistics calculator. Paste your data to get count, mean, median, mode, standard deviation, variance, quartiles, IQR, skewness and kurtosis — all at once.',
    intro:
      'Get a complete statistical summary of your data in one click. Paste your numbers to compute count, sum, mean, median and mode, sample and population standard deviation and variance, minimum, maximum, range, quartiles, interquartile range, standard error, coefficient of variation, skewness and kurtosis.',
    api: { group: 'stats', test: 'describe' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your data',
      sample: [[23, 29, 20, 32, 25, 27, 24, 31, 26, 28, 30, 22]],
    },
    explainerHtml: `
      <h2>Reading a descriptive-statistics summary</h2>
      <p><strong>Descriptive statistics</strong> summarise a data set with a handful of numbers that describe its centre, its spread, and its shape — the first thing any analyst looks at before doing anything more complex.</p>
      <ul>
        <li><strong>Centre</strong> — the mean, median and mode tell you where the typical value sits.</li>
        <li><strong>Spread</strong> — the range, variance, standard deviation, quartiles and interquartile range (IQR) describe how dispersed the values are. The IQR (Q3 − Q1) captures the middle 50% and resists outliers.</li>
        <li><strong>Shape</strong> — <strong>skewness</strong> measures asymmetry (positive = a long right tail; negative = a long left tail; near 0 = symmetric), while <strong>kurtosis</strong> (reported as excess kurtosis) measures how heavy the tails are compared with a normal distribution.</li>
        <li><strong>Precision</strong> — the standard error of the mean (SEM) estimates how much the sample mean would vary from sample to sample, and the coefficient of variation (CV) expresses the standard deviation as a percentage of the mean for easy comparison across data sets.</li>
      </ul>
      <p>Together these give you a full picture of your data before any hypothesis testing. All values are computed in memory and nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'What are descriptive statistics?',
        a: 'Descriptive statistics are numbers that summarise a data set — measures of centre (mean, median, mode), spread (range, variance, standard deviation, IQR) and shape (skewness, kurtosis). They describe the data without drawing inferences beyond it.',
      },
      {
        q: 'What does skewness tell me?',
        a: 'Skewness measures asymmetry. Positive skew means a longer tail on the right (some high outliers), negative skew means a longer tail on the left, and a value near zero means the data is roughly symmetric.',
      },
      {
        q: 'What is the interquartile range (IQR)?',
        a: 'The IQR is the third quartile minus the first quartile (Q3 − Q1) — the range of the middle 50% of your data. It is a measure of spread that is not affected by extreme outliers.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. All statistics are computed in memory and the result is returned; nothing you enter is saved.',
      },
    ],
    related: ['standard-deviation-calculator', 'mean-median-mode-calculator', 'variance-calculator'],
  },

  // ── Statistics · Confidence intervals (single-data-set numeric-groups widget + scipy `confint`) ──
  {
    cluster: 'statistics',
    slug: 'confidence-interval-calculator',
    primaryKeyword: 'confidence interval calculator',
    title: 'Confidence Interval Calculator — 90%, 95% & 99%, Free',
    h1: 'Confidence Interval Calculator',
    metaDescription:
      'Free confidence interval calculator. Paste your data to get the 90%, 95% and 99% confidence intervals for the mean, with margin of error, standard error and the t critical value.',
    intro:
      'Calculate the confidence interval for the mean of your data. Paste your sample and get the 90%, 95% and 99% confidence intervals at once — along with the mean, standard error, margin of error and the t critical value — computed with the Student’s t-distribution so the result is accurate for small samples.',
    api: { group: 'stats', test: 'confint' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your sample',
      sample: [[12, 15, 14, 10, 13, 16, 11, 14, 12, 15]],
    },
    explainerHtml: `
      <h2>What a confidence interval tells you</h2>
      <p>A <strong>confidence interval</strong> is a range, calculated from your sample, that is likely to contain the true population mean. A 95% confidence interval means that if you repeated the sampling many times, about 95% of the intervals you’d build would capture the real mean. It expresses the <em>uncertainty</em> in your estimate — a narrow interval means a precise estimate, a wide one means more uncertainty.</p>
      <p>The interval is <code>x̄ ± t* × (s / √n)</code>, where <em>x̄</em> is the sample mean, <em>s</em> the sample standard deviation, <em>n</em> the sample size, and <em>t*</em> the critical value from the <strong>t-distribution</strong> for your confidence level and degrees of freedom (n − 1). Using the t-distribution (rather than the normal z) makes the interval correct even for small samples — that’s why this calculator uses it throughout.</p>
      <p>This tool reports the <strong>90%, 95% and 99%</strong> intervals together so you can see the trade-off: higher confidence gives a wider interval. It also shows the margin of error and t critical value behind the 95% interval. Your data is computed in memory and nothing is stored.</p>
    `,
    faq: [
      {
        q: 'What does a 95% confidence interval mean?',
        a: 'It means that if you repeated your sampling many times and built an interval each time, about 95% of those intervals would contain the true population mean. It is a statement about the method’s long-run reliability, not a 95% probability for one specific interval.',
      },
      {
        q: 'Why use the t-distribution instead of the normal (z)?',
        a: 'When the population standard deviation is unknown and estimated from the sample — which is almost always — the t-distribution gives correct, slightly wider intervals, especially for small samples. This calculator uses the t-distribution with n − 1 degrees of freedom.',
      },
      {
        q: 'Why is the 99% interval wider than the 95%?',
        a: 'Higher confidence requires capturing the mean more often, so the interval must be wider. There is a direct trade-off between confidence level and precision.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Calculations run in memory and the result is returned; nothing you enter is saved.',
      },
    ],
    related: ['mean-confidence-interval-calculator', 'standard-error-calculator', 'margin-of-error-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'mean-confidence-interval-calculator',
    primaryKeyword: 'confidence interval for the mean calculator',
    title: 'Confidence Interval for the Mean Calculator — t-based, Free',
    h1: 'Confidence Interval for the Mean',
    metaDescription:
      'Free calculator for the confidence interval of a mean. Paste your sample to get the t-based 90%, 95% and 99% intervals, margin of error, standard error and degrees of freedom.',
    intro:
      'Estimate the confidence interval for a population mean from your sample data. Paste your numbers to get the t-based 90%, 95% and 99% confidence intervals for the mean, along with the sample mean, standard error, margin of error and degrees of freedom.',
    api: { group: 'stats', test: 'confint' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your sample',
      sample: [[5.1, 4.9, 5.3, 5.0, 4.8, 5.2, 5.0, 4.7, 5.4, 5.1, 4.9, 5.2]],
    },
    explainerHtml: `
      <h2>Estimating a population mean</h2>
      <p>When you measure a <strong>sample</strong>, the sample mean is your best single guess for the whole population’s mean — but it’s rarely exactly right. A <strong>confidence interval for the mean</strong> turns that single guess into an honest range that accounts for sampling variability.</p>
      <p>The width of the interval depends on three things: how much your data <strong>varies</strong> (larger standard deviation → wider interval), how <strong>big</strong> your sample is (more data → narrower interval, because the standard error shrinks with √n), and your chosen <strong>confidence level</strong>. The formula is <code>x̄ ± t* · s/√n</code>, evaluated with the t-distribution and n − 1 degrees of freedom.</p>
      <p>This calculator gives the 90%, 95% and 99% intervals from a single paste, so you can report whichever your field expects (95% is the most common). It’s the right tool whenever you have raw sample data and want to state how precisely you’ve pinned down the mean. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'How do I calculate a confidence interval for the mean?',
        a: 'Take the sample mean and add/subtract the margin of error, which is the t critical value times the standard error (s/√n). This tool does it automatically and reports the 90%, 95% and 99% intervals.',
      },
      {
        q: 'What sample size do I need?',
        a: 'There is no fixed minimum, but larger samples give narrower, more precise intervals because the standard error decreases with the square root of n. The t-distribution keeps small-sample intervals valid.',
      },
      {
        q: 'What is the difference between this and a confidence interval for a proportion?',
        a: 'This interval is for a mean of continuous measurements. A proportion (percentage) uses a different formula based on p and n. This tool handles the mean of numeric data.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Everything is computed in memory and nothing you enter is saved.',
      },
    ],
    related: ['confidence-interval-calculator', 'standard-error-calculator', 'margin-of-error-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'standard-error-calculator',
    primaryKeyword: 'standard error calculator',
    title: 'Standard Error Calculator — Standard Error of the Mean (SEM)',
    h1: 'Standard Error Calculator',
    metaDescription:
      'Free standard error calculator. Paste your data to get the standard error of the mean (SEM), along with the mean, standard deviation, sample size and confidence intervals.',
    intro:
      'Calculate the standard error of the mean (SEM) for your data. Paste your sample to get the SEM, the sample mean and standard deviation, the sample size, and the resulting confidence intervals — everything you need to report how precisely your sample estimates the population mean.',
    api: { group: 'stats', test: 'confint' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your sample',
      sample: [[98, 102, 95, 110, 100, 97, 105, 99, 101, 96]],
    },
    explainerHtml: `
      <h2>Standard error vs standard deviation</h2>
      <p>The <strong>standard error of the mean (SEM)</strong> measures how precisely your sample mean estimates the true population mean. It is easy to confuse with the standard deviation, but they answer different questions:</p>
      <ul>
        <li><strong>Standard deviation (s)</strong> describes the spread of the individual data points.</li>
        <li><strong>Standard error (SEM)</strong> describes the spread of the <em>sample mean</em> — how much it would jump around if you took many samples.</li>
      </ul>
      <p>The formula is <code>SEM = s / √n</code>. Crucially, the standard error <strong>shrinks as your sample grows</strong>: quadruple the sample size and you halve the standard error. That’s why bigger studies produce more precise estimates and narrower confidence intervals. The SEM is the building block of the confidence interval — multiply it by the t critical value to get the margin of error.</p>
      <p>This calculator reports the SEM alongside the mean, standard deviation, sample size and the confidence intervals it produces. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'What is the standard error of the mean?',
        a: 'The standard error of the mean (SEM) is the standard deviation divided by the square root of the sample size (s/√n). It estimates how much the sample mean would vary from sample to sample.',
      },
      {
        q: 'What is the difference between standard error and standard deviation?',
        a: 'Standard deviation measures the spread of individual data points; standard error measures the precision of the sample mean. SEM is always smaller than s and decreases as the sample size grows.',
      },
      {
        q: 'How does sample size affect the standard error?',
        a: 'The standard error is inversely proportional to the square root of the sample size. Increasing n by a factor of four halves the standard error, giving a more precise estimate of the mean.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Calculations run in memory and nothing you enter is saved.',
      },
    ],
    related: ['confidence-interval-calculator', 'mean-confidence-interval-calculator', 'margin-of-error-calculator'],
  },
  {
    cluster: 'statistics',
    slug: 'margin-of-error-calculator',
    primaryKeyword: 'margin of error calculator',
    title: 'Margin of Error Calculator — for a Sample Mean, Free',
    h1: 'Margin of Error Calculator',
    metaDescription:
      'Free margin of error calculator for a sample mean. Paste your data to get the 95% margin of error (and 90%/99%), based on the t critical value and the standard error.',
    intro:
      'Calculate the margin of error for a sample mean from your data. Paste your numbers to get the margin of error at the 95% confidence level (plus 90% and 99% via the confidence intervals), along with the t critical value, standard error and the resulting interval.',
    api: { group: 'stats', test: 'confint' },
    widget: {
      kind: 'numeric-groups',
      groupsDefault: 1,
      groupsFixed: true,
      groupLabel: 'Your sample',
      sample: [[72, 68, 75, 70, 71, 69, 73, 74, 70, 72, 68, 71]],
    },
    explainerHtml: `
      <h2>What the margin of error means</h2>
      <p>The <strong>margin of error</strong> is the “plus or minus” you see attached to an estimate — it’s half the width of a confidence interval. For a sample mean it is <code>t* × (s / √n)</code>: the t critical value for your confidence level multiplied by the standard error. Report your result as <em>mean ± margin of error</em>.</p>
      <p>Two things shrink the margin of error and so tighten your estimate: a <strong>larger sample</strong> (the √n in the denominator) and <strong>lower variability</strong> in the data. Raising the confidence level (say from 95% to 99%) <em>increases</em> the margin of error, because you’re demanding a range that’s right more often.</p>
      <p>Note this calculator computes the margin of error for the <strong>mean of numeric data</strong>. The margin of error quoted for opinion polls is a related but different formula based on a proportion and sample size. Here, paste your measurements and get the margin of error and the full interval. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'How is the margin of error calculated?',
        a: 'For a sample mean, the margin of error is the t critical value times the standard error (t* · s/√n). It equals half the width of the confidence interval, so the interval is mean ± margin of error.',
      },
      {
        q: 'How can I reduce the margin of error?',
        a: 'Increase your sample size (the most reliable way, since error falls with √n), reduce variability in your measurements, or accept a lower confidence level. Larger samples give a smaller margin of error.',
      },
      {
        q: 'Is this the same as the polling margin of error?',
        a: 'Not exactly. This computes the margin of error for the mean of numeric data. Opinion polls report the margin of error for a proportion, which uses a different formula based on the percentage and sample size.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Everything is computed in memory and nothing you enter is saved.',
      },
    ],
    related: ['confidence-interval-calculator', 'mean-confidence-interval-calculator', 'standard-error-calculator'],
  },

  // ── Finance · Loan amortization (one shared loan widget + pure-Python endpoint) ──
  {
    cluster: 'finance',
    slug: 'amortization-schedule',
    primaryKeyword: 'amortization schedule',
    title: 'Amortization Schedule Calculator — Free, with Full Table & Chart',
    h1: 'Amortization Schedule Calculator',
    metaDescription:
      'Free amortization schedule calculator. Enter your loan amount, rate and term to see the full month-by-month payment table, total interest, a payoff chart, and download it as CSV.',
    intro:
      'Generate a complete loan amortization schedule. Enter your loan amount, interest rate and term to see your monthly payment, total interest paid, a month-by-month breakdown of principal versus interest, a payoff chart, and a downloadable CSV — with optional extra payments to see how much interest you can save.',
    api: { group: 'finance', test: 'amortize' },
    widget: {
      kind: 'loan',
      defaults: { principal: 300000, rate: 6.5, years: 30, extra: 0, frequency: 'monthly' },
      emphasizeExtra: false,
      showFrequency: false,
    },
    explainerHtml: `
      <h2>How an amortization schedule works</h2>
      <p>An <strong>amortization schedule</strong> is the month-by-month plan that shows exactly how each loan payment is split between <strong>interest</strong> and <strong>principal</strong>. Early in the loan, most of your payment goes to interest because the balance is large; over time the balance shrinks, so more of each payment chips away at the principal. The total payment stays the same each month, but its makeup shifts steadily toward principal.</p>
      <p>The calculator computes your fixed monthly payment with the standard formula <code>M = P · r · (1+r)<sup>n</sup> / ((1+r)<sup>n</sup> − 1)</code>, where <em>P</em> is the loan amount, <em>r</em> the monthly interest rate, and <em>n</em> the number of payments. It then walks the loan forward month by month so you can see the running balance, cumulative interest, and the exact payoff date.</p>
      <p>Add an <strong>extra monthly payment</strong> to see its outsized effect: because every extra dollar comes straight off the principal, it stops accruing interest for the rest of the loan, so even small extras can cut years off the term and save thousands in interest. The chart shows your balance falling over time, and you can download the full schedule as a CSV for your records.</p>
    `,
    faq: [
      {
        q: 'How is a monthly mortgage payment calculated?',
        a: 'The fixed payment is M = P·r·(1+r)^n / ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate (annual rate ÷ 12), and n is the total number of monthly payments. This calculator applies that formula and then builds the full schedule.',
      },
      {
        q: 'Why does so much of my early payment go to interest?',
        a: 'Interest is charged on the outstanding balance, which is highest at the start. So early payments are mostly interest and only a little principal. As the balance falls, the split shifts toward principal.',
      },
      {
        q: 'How much do extra payments save?',
        a: 'Extra payments reduce the principal directly, so they remove all the future interest that principal would have accrued. Enter an extra monthly amount to see the exact interest saved and how many months earlier the loan is paid off.',
      },
      {
        q: 'Can I download the amortization schedule?',
        a: 'Yes. After calculating, use the Download CSV button to save the full month-by-month table for spreadsheets or your records. Nothing is stored on our servers.',
      },
    ],
    related: [
      'amortization-calculator-with-extra-payments',
      'biweekly-mortgage-calculator',
      'loan-payoff-calculator',
    ],
  },
  {
    cluster: 'finance',
    slug: 'amortization-calculator-with-extra-payments',
    primaryKeyword: 'amortization calculator with extra payments',
    title: 'Amortization Calculator with Extra Payments — See Interest Saved',
    h1: 'Amortization Calculator with Extra Payments',
    metaDescription:
      'Free amortization calculator with extra payments. See how an extra monthly amount cuts your loan term and total interest, with a side-by-side payoff comparison and full schedule.',
    intro:
      'See exactly how extra payments accelerate your loan. Enter your loan and an extra monthly amount to compare payoff time and total interest with and without the extra — including the months saved, the interest saved, and the full updated amortization schedule.',
    api: { group: 'finance', test: 'amortize' },
    widget: {
      kind: 'loan',
      defaults: { principal: 300000, rate: 6.5, years: 30, extra: 200, frequency: 'monthly' },
      emphasizeExtra: true,
      showFrequency: false,
    },
    explainerHtml: `
      <h2>Why extra payments save so much</h2>
      <p>When you pay <strong>extra</strong> on a loan, the entire extra amount goes straight to <strong>principal</strong>. That matters because interest is only ever charged on the remaining balance — so every dollar of principal you remove early stops generating interest for the <em>entire rest</em> of the loan. On a 30-year mortgage, an extra $200 a month can shave years off the term and save tens of thousands in interest.</p>
      <p>This calculator runs the loan twice — once with your scheduled payment and once with the extra added — and shows the difference: <strong>months saved</strong>, <strong>interest saved</strong>, and the new payoff date. The schedule below reflects your accelerated plan, and you can download it as a CSV.</p>
    `,
    faq: [
      {
        q: 'Is it better to pay extra each month or make one lump sum?',
        a: 'Both reduce principal and therefore interest. A consistent extra monthly payment is easy to budget and starts saving interest immediately; a lump sum has a bigger one-time effect. This tool models a recurring extra payment.',
      },
      {
        q: 'Does paying extra reduce my monthly payment?',
        a: 'No — your required monthly payment stays the same. Extra payments shorten the loan term and reduce total interest instead, so you finish paying earlier.',
      },
      {
        q: 'How much interest will I actually save?',
        a: 'It depends on your rate, balance and how early you pay. Enter your numbers and an extra amount to see the exact interest saved and months removed for your specific loan.',
      },
      {
        q: 'Is my financial data stored?',
        a: 'No. Calculations run in memory and the result is returned; nothing you enter is saved.',
      },
    ],
    related: ['amortization-schedule', 'biweekly-mortgage-calculator', 'loan-payoff-calculator'],
  },
  {
    cluster: 'finance',
    slug: 'biweekly-mortgage-calculator',
    primaryKeyword: 'biweekly mortgage calculator',
    title: 'Biweekly Mortgage Calculator — Payoff Time & Interest Saved',
    h1: 'Biweekly Mortgage Calculator',
    metaDescription:
      'Free biweekly mortgage calculator. See how paying half your mortgage every two weeks (26 payments a year) shortens your loan and cuts total interest versus monthly payments.',
    intro:
      'Compare a biweekly mortgage plan against standard monthly payments. Paying half your monthly amount every two weeks means 26 half-payments — the equivalent of 13 monthly payments — each year, which quietly knocks years off your loan. See the payoff time and interest saved for your numbers.',
    api: { group: 'finance', test: 'amortize' },
    widget: {
      kind: 'loan',
      defaults: { principal: 300000, rate: 6.5, years: 30, extra: 0, frequency: 'biweekly' },
      emphasizeExtra: false,
      showFrequency: true,
    },
    explainerHtml: `
      <h2>How biweekly payments pay off your mortgage faster</h2>
      <p>With a <strong>biweekly mortgage</strong> you pay half of your monthly payment every two weeks. Because there are 52 weeks in a year, that’s <strong>26 half-payments</strong> — the equivalent of <strong>13 full monthly payments</strong> instead of 12. That one extra monthly payment per year goes entirely to principal, so a biweekly schedule typically pays off a 30-year mortgage several years early and saves a substantial amount of interest, without you having to come up with a big lump sum.</p>
      <p>This calculator compares the biweekly schedule against the standard monthly plan for the same loan and shows the <strong>months saved</strong> and <strong>interest saved</strong>. Switch the frequency toggle to see both side by side.</p>
    `,
    faq: [
      {
        q: 'How does a biweekly mortgage save money?',
        a: 'Paying half the monthly amount every two weeks results in 26 payments a year — equivalent to 13 monthly payments. The extra payment each year goes to principal, shortening the loan and reducing total interest.',
      },
      {
        q: 'How many years does biweekly payment take off a 30-year mortgage?',
        a: 'It varies with rate and balance, but biweekly payments commonly cut roughly 4–6 years off a 30-year mortgage. Enter your numbers to see the exact figure.',
      },
      {
        q: 'Does my lender need to offer biweekly payments?',
        a: 'Not necessarily — the same effect comes from making one extra monthly payment per year, or adding 1/12 of your payment to each monthly payment. Watch out for third-party biweekly services that charge fees.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Everything is computed in memory and nothing you enter is saved.',
      },
    ],
    related: [
      'amortization-schedule',
      'amortization-calculator-with-extra-payments',
      'loan-payoff-calculator',
    ],
  },
  {
    cluster: 'finance',
    slug: 'loan-payoff-calculator',
    primaryKeyword: 'loan payoff calculator',
    title: 'Loan Payoff Calculator — Payoff Date, Total Interest & Schedule',
    h1: 'Loan Payoff Calculator',
    metaDescription:
      'Free loan payoff calculator. Find out exactly when your loan will be paid off, how much total interest you’ll pay, and how extra payments move up your payoff date.',
    intro:
      'Find your exact loan payoff date and total interest. Enter your loan amount, rate and term — and optionally an extra monthly payment — to see when the balance hits zero, the total interest you’ll pay, and a full payoff schedule you can download.',
    api: { group: 'finance', test: 'amortize' },
    widget: {
      kind: 'loan',
      defaults: { principal: 25000, rate: 9.0, years: 5, extra: 0, frequency: 'monthly' },
      emphasizeExtra: true,
      showFrequency: false,
    },
    explainerHtml: `
      <h2>Knowing your real payoff date</h2>
      <p>A <strong>loan payoff calculator</strong> answers the question every borrower actually cares about: <em>when am I done, and how much will it cost me?</em> By walking your loan forward payment by payment, it pins down the exact payoff month, the total of every payment you’ll make, and the share of that total which is pure interest.</p>
      <p>The real power is in the <strong>extra payment</strong> field. Because extra money comes off the principal — the part that generates interest — even a modest extra each month can pull your payoff date forward and cut the interest bill. Enter an extra amount to see your new payoff date, the months saved, and the interest saved, then download the full schedule as a CSV.</p>
    `,
    faq: [
      {
        q: 'How do I calculate my loan payoff date?',
        a: 'Start from the balance and apply each payment: interest accrues on the balance, the rest reduces principal, and you repeat until the balance reaches zero. This calculator does that automatically and returns the exact payoff month.',
      },
      {
        q: 'How can I pay off my loan faster?',
        a: 'Add an extra amount to each payment. Because extra payments reduce principal directly, they remove future interest and bring the payoff date forward. Enter an extra amount to see the effect.',
      },
      {
        q: 'What is the total cost of my loan?',
        a: 'It is the sum of every payment, which equals the principal plus all interest. The calculator shows both the total paid and the total interest separately.',
      },
      {
        q: 'Is my information stored?',
        a: 'No. Calculations run in memory and the result is returned; nothing you enter is saved.',
      },
    ],
    related: [
      'amortization-schedule',
      'amortization-calculator-with-extra-payments',
      'biweekly-mortgage-calculator',
    ],
  },

  // ── Finance · Compound interest / savings (shared savings widget + pure-Python `compound`) ──
  {
    cluster: 'finance',
    slug: 'compound-interest-calculator',
    primaryKeyword: 'compound interest calculator',
    title: 'Compound Interest Calculator — Free, with Growth Chart',
    h1: 'Compound Interest Calculator',
    metaDescription:
      'Free compound interest calculator. See how your money grows with regular contributions — future value, total interest earned, a year-by-year table and a growth chart. Nothing stored.',
    intro:
      'See exactly how compound interest grows your money over time. Enter an initial deposit, a regular monthly or annual contribution, an interest rate and a time horizon to get your future balance, total interest earned, a year-by-year breakdown and a growth chart — with a downloadable schedule.',
    api: { group: 'finance', test: 'compound' },
    widget: {
      kind: 'savings',
      defaults: { principal: 10000, contribution: 500, rate: 7, years: 20, frequency: 'monthly' },
    },
    explainerHtml: `
      <h2>How compound interest works</h2>
      <p><strong>Compound interest</strong> is interest earned on both your original money <em>and</em> on the interest it has already earned. That feedback loop is what makes savings grow faster and faster over time — Einstein reputedly called it the eighth wonder of the world. The longer your money compounds, the more dramatic the effect.</p>
      <p>This calculator grows your balance period by period using <code>A = P(1 + r/n)<sup>nt</sup></code> for the lump sum, plus the future value of your regular contributions. Three levers drive the result:</p>
      <ul>
        <li><strong>Rate</strong> — even a couple of extra percentage points compounds into a large difference over decades.</li>
        <li><strong>Time</strong> — the single most powerful factor; starting earlier beats contributing more later.</li>
        <li><strong>Contributions</strong> — regular deposits add fresh principal that then compounds too.</li>
      </ul>
      <p>The growth chart shows your balance rising against the total you’ve contributed — the widening gap between the two lines is the compound interest at work. Switch between monthly and annual compounding to compare, and download the full year-by-year schedule. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'What is compound interest?',
        a: 'Compound interest is interest calculated on your initial principal and also on the accumulated interest from previous periods. Unlike simple interest, it causes balances to grow at an accelerating rate.',
      },
      {
        q: 'How is compound interest calculated?',
        a: 'For a lump sum the formula is A = P(1 + r/n)^(nt), where P is principal, r the annual rate, n the number of compounding periods per year and t the years. This tool also adds the compounded growth of your regular contributions.',
      },
      {
        q: 'Does compounding more often earn more?',
        a: 'Yes, slightly. More frequent compounding (monthly vs annually) earns a bit more because interest starts earning interest sooner. The difference grows with higher rates and longer time horizons.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Calculations run in memory and the result is returned; nothing you enter is saved.',
      },
    ],
    related: ['savings-calculator', 'investment-calculator', 'savings-goal-calculator'],
  },
  {
    cluster: 'finance',
    slug: 'savings-calculator',
    primaryKeyword: 'savings calculator',
    title: 'Savings Calculator — Project Your Balance with Contributions',
    h1: 'Savings Calculator',
    metaDescription:
      'Free savings calculator. Project how your savings grow with regular deposits and interest — future balance, total contributed, interest earned, a chart and a year-by-year table.',
    intro:
      'Project how much your savings will grow. Enter your starting balance, a regular deposit, your interest rate and how long you’ll save, and see your future balance, how much you contributed, how much is interest, and a year-by-year growth chart you can download.',
    api: { group: 'finance', test: 'compound' },
    widget: {
      kind: 'savings',
      defaults: { principal: 1000, contribution: 200, rate: 4, years: 10, frequency: 'monthly' },
    },
    explainerHtml: `
      <h2>Planning your savings</h2>
      <p>A <strong>savings calculator</strong> shows what consistent saving plus interest adds up to over time. The two biggest factors in your final balance are how much you put in regularly and how long you keep at it — interest then quietly multiplies the result.</p>
      <p>The key insight most people miss is how much of the final balance comes from <strong>interest</strong> rather than deposits. Early on, your balance is almost entirely the money you put in; but over many years the interest component grows until it can rival or exceed your total contributions. The chart makes this visible: the blue balance line pulls away from the green “total contributed” line as compounding takes over.</p>
      <p>Use it to test scenarios — what if you save $50 more a month, or for five more years, or find an account paying one point more? Each tweak updates your projected balance instantly. The full year-by-year schedule is downloadable, and nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'How much will my savings grow?',
        a: 'It depends on your starting balance, how much and how often you contribute, the interest rate and the time horizon. Enter your numbers to see the projected future balance and how much of it is interest.',
      },
      {
        q: 'How much should I save each month?',
        a: 'A common guideline is to save 15–20% of income, but the right amount depends on your goals. Use the calculator to work backwards: try different monthly amounts and see which reaches your target.',
      },
      {
        q: 'What interest rate should I assume?',
        a: 'Use the rate your savings account or investment actually pays. High-yield savings accounts and CDs vary; for long-term investing many people model a conservative average return. The tool lets you test any rate.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Everything is computed in memory and nothing you enter is saved.',
      },
    ],
    related: ['compound-interest-calculator', 'investment-calculator', 'savings-goal-calculator'],
  },
  {
    cluster: 'finance',
    slug: 'investment-calculator',
    primaryKeyword: 'investment calculator',
    title: 'Investment Calculator — Future Value with Regular Investing',
    h1: 'Investment Calculator',
    metaDescription:
      'Free investment calculator. Estimate the future value of an investment with regular contributions and compound growth — total invested, returns, a growth chart and yearly breakdown.',
    intro:
      'Estimate the future value of your investments. Enter an initial amount, a recurring contribution, an expected annual return and a time horizon to project your portfolio’s growth — including total invested, investment returns, a growth chart and a year-by-year breakdown.',
    api: { group: 'finance', test: 'compound' },
    widget: {
      kind: 'savings',
      defaults: { principal: 5000, contribution: 500, rate: 8, years: 30, frequency: 'monthly' },
    },
    explainerHtml: `
      <h2>Projecting investment growth</h2>
      <p>An <strong>investment calculator</strong> applies the same compound-growth maths as a savings calculator, but is usually used with a higher assumed annual return to reflect markets rather than a savings account. Because returns compound, small differences in rate and time produce enormous differences in the final amount.</p>
      <p>The classic illustration is starting early: an investor who contributes for the first decade and then stops can end up ahead of someone who starts a decade later and contributes for far longer — purely because the early money has more time to compound. Time in the market is the dominant variable.</p>
      <p>This tool projects your portfolio’s future value from your initial investment plus regular contributions at your chosen return, shows how much is your own money versus growth, and charts the trajectory. A few important caveats: real returns vary year to year (this assumes a steady average), and the figures are before inflation, taxes and fees. Use it for planning, not as a guarantee. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'What rate of return should I use for investments?',
        a: 'That is your choice and depends on your assets. Many people model long-term stock-market investing with a conservative average annual return, but actual returns vary widely year to year. This calculator assumes a steady average for simplicity.',
      },
      {
        q: 'Does this account for inflation, taxes or fees?',
        a: 'No. The projection is a gross figure before inflation, taxes and fees. To estimate purchasing power, you can enter an inflation-adjusted (real) rate of return instead of the nominal rate.',
      },
      {
        q: 'Why does starting early matter so much?',
        a: 'Because returns compound, money invested earlier has more time to grow on itself. Starting a decade earlier can outweigh contributing larger amounts later — time is the most powerful factor.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Calculations run in memory and nothing you enter is saved.',
      },
    ],
    related: ['compound-interest-calculator', 'savings-calculator', 'savings-goal-calculator'],
  },
  {
    cluster: 'finance',
    slug: 'savings-goal-calculator',
    primaryKeyword: 'savings goal calculator',
    title: 'Savings Goal Calculator — See If You’ll Reach Your Target',
    h1: 'Savings Goal Calculator',
    metaDescription:
      'Free savings goal calculator. Enter your deposit, monthly contribution, rate and timeframe to project your balance and see whether you’ll reach your savings goal, with a chart.',
    intro:
      'Find out whether your plan will reach your savings goal. Enter your current savings, your regular contribution, an interest rate and a timeframe to project your future balance — then compare it against your target to see if you’re on track, ahead, or need to save a little more.',
    api: { group: 'finance', test: 'compound' },
    widget: {
      kind: 'savings',
      defaults: { principal: 2000, contribution: 300, rate: 5, years: 5, frequency: 'monthly' },
    },
    explainerHtml: `
      <h2>Reaching a savings goal</h2>
      <p>A <strong>savings goal calculator</strong> helps you answer a concrete question: “If I save this much for this long, where will I end up?” Project your future balance, compare it to your target — a house deposit, an emergency fund, a holiday, a car — and adjust the inputs until the projection clears your goal.</p>
      <p>There are three dials to turn when you’re short of a goal:</p>
      <ul>
        <li><strong>Contribute more</strong> each month — the most direct lever, and the one fully in your control.</li>
        <li><strong>Give it more time</strong> — extending the deadline lets compounding do more of the work.</li>
        <li><strong>Earn a higher rate</strong> — helpful, but don’t rely on it for short-term goals where market risk matters.</li>
      </ul>
      <p>For near-term goals (a year or two) most of the balance will be your own contributions, so saving more is what moves the needle. For long-term goals, interest does an increasing share of the lifting. Project your plan, see the year-by-year path on the chart, and tweak until you’re comfortably on track. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'How do I know if I’ll reach my savings goal?',
        a: 'Enter your current savings, regular contribution, interest rate and timeframe. The calculator projects your future balance, which you can compare against your target to see whether you are on track.',
      },
      {
        q: 'What if the projection falls short of my goal?',
        a: 'You have three options: increase your monthly contribution, extend your timeframe, or seek a higher interest rate. For short-term goals, increasing contributions is usually the most reliable lever.',
      },
      {
        q: 'Should I rely on interest to reach a short-term goal?',
        a: 'For goals within a year or two, most of your balance comes from contributions, not interest — and chasing higher returns adds risk. Compounding helps most over longer horizons.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Everything is computed in memory and nothing you enter is saved.',
      },
    ],
    related: ['compound-interest-calculator', 'savings-calculator', 'investment-calculator'],
  },

  // ── Writing · Readability (one shared text widget + pyphen-backed endpoint) ──
  {
    cluster: 'writing',
    slug: 'readability-checker',
    primaryKeyword: 'readability checker',
    title: 'Readability Checker — Free, Instant Reading Score & Grade Level',
    h1: 'Readability Checker',
    metaDescription:
      'Free readability checker. Paste your text to get the Flesch Reading Ease score, grade level, Gunning Fog, SMOG, Coleman-Liau and ARI — with plain-English feedback. Nothing stored.',
    intro:
      'Paste any text and instantly see how readable it is. This readability checker reports the Flesch Reading Ease score, a consensus grade level, and five standard readability formulas (Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and ARI) — plus word, sentence and complex-word counts — so you can edit toward clearer, simpler writing.',
    api: { group: 'text', test: 'readability' },
    widget: {
      kind: 'text',
      placeholder: 'Paste your text here — an article, email, essay or paragraph (at least 10 words)…',
      sample:
        'Good writing is clear writing. When you keep your sentences short and choose plain words, more people understand you the first time they read your work. Long, tangled sentences full of jargon force readers to slow down and reread, and many simply give up. Aim for one idea per sentence, prefer common words over fancy ones, and read your draft aloud to catch anything that trips the tongue.',
    },
    explainerHtml: `
      <h2>What a readability score actually measures</h2>
      <p>A <strong>readability score</strong> estimates how much education a reader needs to understand your text on the first try. Almost every formula combines two signals: <strong>sentence length</strong> (words per sentence) and <strong>word difficulty</strong> (syllables or letters per word). Short sentences made of short words score as easy; long sentences packed with multi-syllable words score as hard.</p>
      <p>This checker runs six well-established formulas at once so you are not relying on a single number:</p>
      <ul>
        <li><strong>Flesch Reading Ease</strong> — a 0–100 score where higher is easier. 60–70 is plain English aimed at the general public.</li>
        <li><strong>Flesch-Kincaid Grade</strong> — translates that into a U.S. school grade level.</li>
        <li><strong>Gunning Fog</strong>, <strong>SMOG</strong>, <strong>Coleman-Liau</strong> and <strong>ARI</strong> — independent grade-level estimates that weight word and sentence complexity differently.</li>
      </ul>
      <p>Because each formula has quirks, the <strong>consensus grade level</strong> — the average of the grade-based scores — is usually the most reliable single takeaway. Syllables are counted with a built-in hyphenation dictionary, so the analysis runs entirely on the server in milliseconds; your text is never stored.</p>
      <p>To lower a score, the fastest wins are: split long sentences, swap multi-syllable words for everyday ones, and cut filler. Aiming for Grade 8 or below makes text comfortable for a general audience, which is why most newspapers and marketing copy target that range.</p>
    `,
    faq: [
      {
        q: 'What is a good readability score?',
        a: 'For general audiences, aim for a Flesch Reading Ease of 60–70 and a grade level around 7–8. Most newspapers and popular websites write at roughly an 8th-grade level so the widest audience can follow easily.',
      },
      {
        q: 'How is the reading grade level calculated?',
        a: 'Each formula combines average sentence length with average word difficulty (syllables or letters per word). This tool averages five grade-based formulas — Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and ARI — into a single consensus grade.',
      },
      {
        q: 'How many words do I need to paste?',
        a: 'At least 10 words, but readability formulas are statistical, so the longer the sample the more reliable the result. A few paragraphs gives a much steadier score than a single sentence.',
      },
      {
        q: 'Is my text stored or used to train anything?',
        a: 'No. Your text is sent to the calculator, scored in memory, and the result is returned. Nothing is saved and nothing is used for any other purpose.',
      },
    ],
    related: [
      'flesch-kincaid-calculator',
      'gunning-fog-index-calculator',
      'reading-level-calculator',
    ],
  },
  {
    cluster: 'writing',
    slug: 'flesch-kincaid-calculator',
    primaryKeyword: 'flesch kincaid calculator',
    title: 'Flesch-Kincaid Calculator — Reading Ease & Grade Level, Free',
    h1: 'Flesch-Kincaid Calculator',
    metaDescription:
      'Free Flesch-Kincaid calculator. Paste your text to get the Flesch Reading Ease score and the Flesch-Kincaid Grade Level instantly, with the other major readability formulas alongside.',
    intro:
      'Calculate the Flesch Reading Ease score and the Flesch-Kincaid Grade Level for any text. Paste your writing to see both Flesch scores plus Gunning Fog, SMOG, Coleman-Liau and ARI for comparison — with a plain-English reading-level verdict you can act on.',
    api: { group: 'text', test: 'readability' },
    widget: {
      kind: 'text',
      placeholder: 'Paste your text to compute its Flesch Reading Ease and Flesch-Kincaid grade…',
      sample:
        'The Flesch reading tests are the most widely used readability formulas in the world. Rudolf Flesch developed the Reading Ease score in 1948, and it was later adapted with John Kincaid into a grade-level formula for the United States Navy. Today the same two formulas are built into popular word processors and are used to keep government forms, insurance policies and school materials readable for ordinary people.',
    },
    explainerHtml: `
      <h2>Flesch Reading Ease vs Flesch-Kincaid Grade Level</h2>
      <p>The two Flesch formulas use the <em>same</em> inputs — average words per sentence and average syllables per word — but report on different scales.</p>
      <p><strong>Flesch Reading Ease</strong> is a 0–100 score where <em>higher means easier</em>:</p>
      <p style="margin-left:1rem"><code>206.835 − 1.015 × (words ÷ sentences) − 84.6 × (syllables ÷ words)</code></p>
      <p>Roughly: 90–100 is very easy (5th grade), 60–70 is plain English (8th–9th grade), and below 30 is very difficult (college-graduate level).</p>
      <p><strong>Flesch-Kincaid Grade Level</strong> rescales the same signals into a U.S. school grade so the number <em>is</em> the reading level:</p>
      <p style="margin-left:1rem"><code>0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59</code></p>
      <p>A result of 8.0 means an average 8th grader should understand the text. Because the two formulas move in opposite directions, a high Reading Ease score lines up with a low grade level — both signalling easier text. This calculator computes both at once, along with four other formulas so you can sanity-check the grade.</p>
    `,
    faq: [
      {
        q: 'What is the difference between Flesch Reading Ease and Flesch-Kincaid Grade Level?',
        a: 'They use the same inputs but different scales. Reading Ease is 0–100 where higher is easier; Flesch-Kincaid Grade Level converts that into a U.S. school grade, where the number is the grade a reader needs.',
      },
      {
        q: 'What is a good Flesch Reading Ease score?',
        a: 'For a general audience, 60–70 is the sweet spot — plain English readable by most adults. Scores above 70 are easy and breezy; scores below 50 are fairly difficult and suit a specialist or academic audience.',
      },
      {
        q: 'How do I lower my Flesch-Kincaid grade level?',
        a: 'Shorten sentences and replace long, multi-syllable words with shorter everyday ones. Both changes reduce the two inputs the formula depends on, pulling the grade level down.',
      },
      {
        q: 'Is the calculation the same as Microsoft Word?',
        a: 'It uses the identical published Flesch and Flesch-Kincaid formulas. Tiny differences can occur because tools count syllables and sentences slightly differently, but results are directly comparable.',
      },
    ],
    related: [
      'readability-checker',
      'gunning-fog-index-calculator',
      'reading-level-calculator',
    ],
  },
  {
    cluster: 'writing',
    slug: 'gunning-fog-index-calculator',
    primaryKeyword: 'gunning fog index calculator',
    title: 'Gunning Fog Index Calculator — Free, Instant Fog Score',
    h1: 'Gunning Fog Index Calculator',
    metaDescription:
      'Free Gunning Fog Index calculator. Paste your text to get the Fog score (years of education needed to read it), with complex-word count and the other major readability formulas.',
    intro:
      'Calculate the Gunning Fog Index for any text. Paste your writing to get the Fog score — an estimate of the years of formal education a reader needs — along with the complex-word count that drives it, and the Flesch, SMOG, Coleman-Liau and ARI scores for comparison.',
    api: { group: 'text', test: 'readability' },
    widget: {
      kind: 'text',
      placeholder: 'Paste your text to compute its Gunning Fog Index…',
      sample:
        'The Gunning Fog Index was created by businessman Robert Gunning in 1952, after he became convinced that newspapers and business writing were full of needless complexity he called fog. The formula rewards short sentences and penalises complex words of three or more syllables. A passage with a Fog Index of twelve requires the reading level of a high-school senior, while well-written material for a broad audience usually scores between eight and ten.',
    },
    explainerHtml: `
      <h2>How the Gunning Fog Index works</h2>
      <p>The <strong>Gunning Fog Index</strong> estimates the number of years of formal education a person needs to understand a piece of text on the first reading. A score of 12 means a high-school senior could read it; a score of 16 means a college graduate. The formula is:</p>
      <p style="margin-left:1rem"><code>0.4 × [ (words ÷ sentences) + 100 × (complex words ÷ words) ]</code></p>
      <p><strong>Complex words</strong> are the heart of the index: words with <em>three or more syllables</em>. The more polysyllabic words you pack in, and the longer your sentences, the higher (foggier) the score. This is why the fastest way to clear fog is to break up long sentences and swap heavy words for plain ones.</p>
      <p>Robert Gunning designed the index in 1952 specifically for business and news writing, and it remains a favourite for evaluating reports, manuals and corporate communications. As a rule of thumb: aim for a Fog Index under 12 for a general audience, and under 10 for writing meant to be effortless. This calculator shows the complex-word count it found so you can see exactly what is driving your score, and reports five other formulas alongside it.</p>
    `,
    faq: [
      {
        q: 'What is a good Gunning Fog Index score?',
        a: 'Under 12 is readable for a wide audience (high-school level), and under 10 is comfortable for almost everyone. Scores above 14–16 indicate dense, specialist or academic writing that many readers will struggle with.',
      },
      {
        q: 'What counts as a complex word in the Fog Index?',
        a: 'A complex (polysyllabic) word is one with three or more syllables. This calculator counts those and shows the total, since reducing them is the most direct way to lower your Fog score.',
      },
      {
        q: 'How can I reduce my Gunning Fog score?',
        a: 'Two levers: shorten your sentences, and replace three-plus-syllable words with shorter everyday alternatives. Both directly reduce the terms in the formula.',
      },
      {
        q: 'Is the Gunning Fog Index better than Flesch-Kincaid?',
        a: 'Neither is strictly better — they weight word difficulty differently. Fog focuses on complex-word density, Flesch-Kincaid on average syllables per word. Using both, as this tool does, gives a more robust picture.',
      },
    ],
    related: [
      'readability-checker',
      'flesch-kincaid-calculator',
      'reading-level-calculator',
    ],
  },
  {
    cluster: 'writing',
    slug: 'reading-level-calculator',
    primaryKeyword: 'reading level calculator',
    title: 'Reading Level Calculator — Free Grade Level & Reading Time',
    h1: 'Reading Level Calculator',
    metaDescription:
      'Free reading level calculator. Paste your text to get its grade level, reading ease, estimated reading time and complexity — averaged across six readability formulas. Nothing stored.',
    intro:
      'Find the reading level of any text in seconds. Paste your writing to get a consensus grade level averaged across six readability formulas, the Flesch Reading Ease score, estimated reading time, and the sentence- and word-complexity stats behind the number — all in plain English.',
    api: { group: 'text', test: 'readability' },
    widget: {
      kind: 'text',
      placeholder: 'Paste your text to find its reading level…',
      sample:
        'Knowing the reading level of your writing helps you match it to your audience. A children s book should sit around a second or third grade level, a popular blog post around eighth grade, and a legal contract often climbs past the level of a college graduate. By measuring the grade level before you publish, you can decide whether to simplify your words and shorten your sentences so the right readers can follow along without effort.',
    },
    explainerHtml: `
      <h2>What "reading level" means and how to use it</h2>
      <p>A <strong>reading level</strong> expresses how hard a text is as a U.S. school grade: Grade 5 is upper-elementary, Grade 8 is middle school, Grade 12 is a high-school senior, and Grade 13+ is college and beyond. Matching your reading level to your audience is one of the highest-leverage edits you can make — text that is two grades above its readers loses them quickly.</p>
      <p>Different formulas can disagree by a grade or two, so this calculator reports a <strong>consensus reading level</strong>: the average of five grade-based formulas (Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and ARI). That smooths out the quirks of any single formula and gives you one number to act on, backed by the individual scores if you want to dig in.</p>
      <p>Typical targets: general-public web content and email aim for <strong>Grade 7–8</strong>; clear instructions and health information aim for <strong>Grade 6</strong> or below; academic and technical writing naturally runs <strong>Grade 13+</strong>. The tool also estimates <strong>reading time</strong> at an average adult pace so you know how long your piece takes to get through. Nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'What reading level should I write for?',
        a: 'For a general audience, aim for Grade 7–8. For instructions, forms or health content meant to reach everyone, aim for Grade 6 or lower. Academic and technical writing naturally sits higher, around college level.',
      },
      {
        q: 'How is the consensus reading level calculated?',
        a: 'It averages five established grade-level formulas — Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and ARI. Averaging reduces the error any single formula can introduce, giving a steadier estimate.',
      },
      {
        q: 'How is reading time estimated?',
        a: 'From the word count at an average adult silent-reading speed of about 230 words per minute. It is an estimate — dense or technical text takes longer, familiar text goes faster.',
      },
      {
        q: 'Can I lower the reading level of my text?',
        a: 'Yes. Shorten sentences, use shorter and more common words, and keep one idea per sentence. Re-paste your edited text to watch the grade level drop.',
      },
    ],
    related: [
      'readability-checker',
      'flesch-kincaid-calculator',
      'gunning-fog-index-calculator',
    ],
  },

  // ── Writing · Text counts (shared text widget + pure-Python `count` endpoint) ──
  {
    cluster: 'writing',
    slug: 'word-counter',
    primaryKeyword: 'word counter',
    title: 'Word Counter — Free Online Word & Character Count',
    h1: 'Word Counter',
    metaDescription:
      'Free online word counter. Paste your text to instantly count words, characters, sentences and paragraphs, with reading time, unique words and keyword density. Nothing stored.',
    intro:
      'Count the words in your text instantly. Paste or type below to get an accurate word count along with characters (with and without spaces), sentences, paragraphs, unique words, estimated reading and speaking time, and the most frequent keywords — useful for essays, articles, assignments and posts with length limits.',
    api: { group: 'text', test: 'count' },
    widget: {
      kind: 'text',
      action: 'Count text',
      minWords: 1,
      placeholder: 'Paste or type your text here to count words, characters, sentences and more…',
      sample:
        'Good writing is rewriting. The first draft gets your ideas onto the page; every draft after that makes them clearer. Count your words as you edit and you will quickly see where you can tighten a sentence, cut a redundant phrase, or split an overlong paragraph into something a reader can actually follow.',
    },
    explainerHtml: `
      <h2>How this word counter works</h2>
      <p>A <strong>word counter</strong> tallies the number of words in your text, where a word is any sequence of characters separated by spaces — the same way Microsoft Word and Google Docs count. It updates as you type a live count, and on submit it adds a full breakdown: characters (with and without spaces), sentences, paragraphs, unique words and more.</p>
      <p>Word and character counts matter whenever there is a limit to hit. Essays and assignments specify a word count; meta descriptions and tweets cap characters; abstracts and bios often have both. Seeing the numbers as you edit makes it easy to trim to length without guesswork.</p>
      <p>The tool also estimates <strong>reading time</strong> (at about 230 words per minute, typical adult silent reading) and <strong>speaking time</strong> (about 130 words per minute), which is handy for speeches and presentations. Everything is computed instantly and nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'How does the word counter count words?',
        a: 'It counts words as sequences of characters separated by whitespace, the same method word processors use. Hyphenated terms count as one word, and numbers count as words too.',
      },
      {
        q: 'How many pages is my word count?',
        a: 'As a rough guide, a typical double-spaced page in 12pt font is about 250–300 words, so 1,000 words is roughly 3–4 pages. Exact length depends on font, spacing and margins.',
      },
      {
        q: 'What is the reading time based on?',
        a: 'Reading time assumes an average adult silent reading speed of about 230 words per minute; speaking time assumes about 130 words per minute. Both are estimates and vary by person and material.',
      },
      {
        q: 'Is my text stored?',
        a: 'No. Your text is counted in memory and the result returned. Nothing is saved.',
      },
    ],
    related: ['character-counter', 'sentence-counter', 'keyword-density-checker'],
  },
  {
    cluster: 'writing',
    slug: 'character-counter',
    primaryKeyword: 'character counter',
    title: 'Character Counter — Count Characters With & Without Spaces',
    h1: 'Character Counter',
    metaDescription:
      'Free character counter. Paste your text to count characters with and without spaces instantly, plus words, sentences and reading time. Perfect for tweets, meta tags and bios.',
    intro:
      'Count the characters in your text instantly, both with and without spaces. Paste or type below to check your length against tweet, SMS, meta description and bio limits — with word, sentence and paragraph counts and reading time included.',
    api: { group: 'text', test: 'count' },
    widget: {
      kind: 'text',
      action: 'Count characters',
      minWords: 1,
      placeholder: 'Paste or type your text here to count characters with and without spaces…',
      sample:
        'Meta descriptions should be around 150 to 160 characters so Google shows them in full. This sentence is here to help you see exactly how the character count changes as you add or remove text.',
    },
    explainerHtml: `
      <h2>Why character count matters</h2>
      <p>A <strong>character counter</strong> reports how many characters your text contains, both <strong>with spaces</strong> (the total length) and <strong>without spaces</strong> (just the visible glyphs). Many platforms enforce character limits, so knowing your exact length saves you from being cut off.</p>
      <p>Common limits worth remembering:</p>
      <ul>
        <li><strong>SEO title tags</strong> — about 60 characters before Google truncates them.</li>
        <li><strong>Meta descriptions</strong> — roughly 150–160 characters.</li>
        <li><strong>X / Twitter posts</strong> — 280 characters.</li>
        <li><strong>SMS</strong> — 160 characters per message segment.</li>
      </ul>
      <p>This tool counts both totals and shows word, sentence and paragraph counts alongside, so you can trim to fit any limit. Counting happens instantly in your browser request and nothing is stored.</p>
    `,
    faq: [
      {
        q: 'Does the character count include spaces?',
        a: 'It shows both. “Characters (with spaces)” is the total length including spaces and line breaks; “characters (no spaces)” counts only the visible characters. Use whichever your platform’s limit refers to.',
      },
      {
        q: 'How many characters is a tweet?',
        a: 'A post on X (Twitter) allows 280 characters. This counter shows your character total live so you can stay within the limit.',
      },
      {
        q: 'What is the ideal meta description length?',
        a: 'Aim for about 150–160 characters so search engines display the full description without cutting it off. Title tags are shorter, around 60 characters.',
      },
      {
        q: 'Is my text stored?',
        a: 'No. The text is counted in memory and the result returned; nothing is saved.',
      },
    ],
    related: ['word-counter', 'sentence-counter', 'keyword-density-checker'],
  },
  {
    cluster: 'writing',
    slug: 'sentence-counter',
    primaryKeyword: 'sentence counter',
    title: 'Sentence Counter — Count Sentences & Paragraphs Online',
    h1: 'Sentence & Paragraph Counter',
    metaDescription:
      'Free sentence counter. Paste your text to count sentences and paragraphs instantly, plus average words per sentence, words, characters and reading time. Nothing stored.',
    intro:
      'Count the sentences and paragraphs in your text instantly. Paste or type below to see how many sentences and paragraphs you have, your average sentence length, and full word and character counts — a quick way to check pacing and structure as you edit.',
    api: { group: 'text', test: 'count' },
    widget: {
      kind: 'text',
      action: 'Count sentences',
      minWords: 1,
      placeholder: 'Paste or type your text here to count sentences and paragraphs…',
      sample:
        'Short sentences are punchy. They land. Longer sentences, by contrast, let you develop an idea, add nuance, and guide the reader through a more complex thought without losing them along the way. Mixing the two keeps your writing from feeling either choppy or exhausting.',
    },
    explainerHtml: `
      <h2>Sentences, paragraphs and pacing</h2>
      <p>A <strong>sentence counter</strong> tells you how many sentences and paragraphs your text contains, plus the <strong>average words per sentence</strong> — one of the strongest signals of how easy your writing is to read. Sentences are detected by terminal punctuation (. ! ?), and paragraphs by blank-line breaks.</p>
      <p>Average sentence length is a useful editing target. Plain-English guidance suggests an average of <strong>15–20 words per sentence</strong>; much higher and readers start to lose the thread. Varying sentence length — mixing short, punchy sentences with longer ones — keeps prose from feeling monotonous, whether choppy or exhausting.</p>
      <p>Use this tool to spot run-on sentences, check that paragraphs aren’t becoming walls of text, and keep your pacing tight. All counts are computed instantly and nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'How are sentences counted?',
        a: 'Sentences are counted by terminal punctuation marks — periods, exclamation marks and question marks. Abbreviations and decimals can occasionally affect the count slightly, but it is accurate for ordinary prose.',
      },
      {
        q: 'What is a good average sentence length?',
        a: 'For general readability, aim for an average of about 15–20 words per sentence. Mixing shorter and longer sentences keeps writing engaging while staying easy to follow.',
      },
      {
        q: 'How are paragraphs detected?',
        a: 'Paragraphs are separated by blank lines (a line break with an empty line between blocks of text). Each non-empty block counts as one paragraph.',
      },
      {
        q: 'Is my text stored?',
        a: 'No. Everything is counted in memory and nothing you enter is saved.',
      },
    ],
    related: ['word-counter', 'character-counter', 'keyword-density-checker'],
  },
  {
    cluster: 'writing',
    slug: 'keyword-density-checker',
    primaryKeyword: 'keyword density checker',
    title: 'Keyword Density Checker — Free Word Frequency Tool',
    h1: 'Keyword Density Checker',
    metaDescription:
      'Free keyword density checker. Paste your text to see your most frequent keywords and their density percentage, plus word, sentence and character counts. Great for SEO content.',
    intro:
      'Check the keyword density of your content in seconds. Paste your text to see the most frequently used words, how many times each appears, and its density as a percentage of total words — so you can confirm your target keywords are present without over-stuffing.',
    api: { group: 'text', test: 'count' },
    widget: {
      kind: 'text',
      action: 'Check density',
      minWords: 1,
      placeholder: 'Paste your article or page copy here to check keyword density…',
      sample:
        'Keyword density is the percentage of times a keyword appears in your content relative to the total word count. Good SEO content uses its target keyword naturally, without keyword stuffing. Aim for a keyword density that reads smoothly to a human, because modern search engines reward helpful content over repetition.',
    },
    explainerHtml: `
      <h2>Using keyword density the right way</h2>
      <p><strong>Keyword density</strong> is how often a word appears in your text as a percentage of the total word count. A density of 2% means the word makes up 2 of every 100 words. This checker ranks your most frequent meaningful words (ignoring common stop words like “the” and “and”) and shows each one’s count and density.</p>
      <p>Density is a useful sanity check, not a target to game. The old advice to hit a specific percentage is outdated — modern search engines reward content that reads naturally and answers the query, and they penalise obvious <strong>keyword stuffing</strong>. As a loose guideline, a primary keyword appearing around <strong>1–2%</strong> of the time usually signals relevance without sounding repetitive.</p>
      <p>Use this tool to confirm your target term actually appears (and in related forms), to catch a word you’ve unintentionally overused, and to find the natural themes in a draft. All analysis happens instantly and nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'What is a good keyword density?',
        a: 'There is no exact ideal, but around 1–2% for a primary keyword is a reasonable, natural-sounding range. Focus on writing for readers; modern search engines reward helpful content rather than a specific density figure.',
      },
      {
        q: 'What is keyword stuffing?',
        a: 'Keyword stuffing is repeating a keyword unnaturally often to try to manipulate rankings. It hurts readability and can trigger search-engine penalties, so it is best avoided.',
      },
      {
        q: 'Why are words like “the” and “and” excluded?',
        a: 'Common stop words appear in almost all text and carry little meaning, so they are filtered out of the ranking to surface the keywords that actually describe your content.',
      },
      {
        q: 'Is my text stored?',
        a: 'No. The analysis runs in memory and the result is returned; nothing you paste is saved.',
      },
    ],
    related: ['word-counter', 'character-counter', 'sentence-counter'],
  },

  // ── Developer · Regex (one shared regex widget + stdlib `re` endpoint) ──
  {
    cluster: 'developer',
    slug: 'python-regex-tester',
    primaryKeyword: 'python regex tester',
    title: 'Python Regex Tester — Test re Patterns Online, Free',
    h1: 'Python Regex Tester',
    metaDescription:
      'Free online Python regex tester. Test your pattern against text using Python’s actual re engine — see every match, capture groups, named groups and offsets, with live flags. Nothing stored.',
    intro:
      'Test regular expressions against the real Python re engine, right in your browser. Enter a pattern and test string to see every match highlighted, with capture groups, named groups and character offsets — and toggle flags like IGNORECASE, MULTILINE, DOTALL and VERBOSE. Because it runs Python, not JavaScript, the results match exactly what re.finditer would give you in your own code.',
    api: { group: 'regex', test: 'match' },
    widget: {
      kind: 'regex',
      mode: 'match',
      patternDefault: '(?P<user>\\w+)@(?P<domain>\\w+\\.\\w+)',
      flagsDefault: ['IGNORECASE'],
      testDefault: 'Email alice@example.com or BOB@Site.ORG for details. Bad: notanemail.',
    },
    explainerHtml: `
      <h2>Why test regex with Python instead of JavaScript?</h2>
      <p>Most online regex testers run in your browser, which means they use the <strong>JavaScript</strong> regex engine. But Python’s <code>re</code> module has a <em>different flavour</em>, and a pattern that works in one can behave differently — or not compile at all — in the other. This tester runs your pattern through Python’s actual <code>re</code> engine on the server, so what you see is exactly what your Python code will do.</p>
      <p>Differences that bite people include:</p>
      <ul>
        <li><strong>Named groups</strong> use <code>(?P&lt;name&gt;...)</code> in Python, not <code>(?&lt;name&gt;...)</code>.</li>
        <li><strong>Backreferences</strong> in substitutions use <code>\\1</code> or <code>\\g&lt;name&gt;</code>, not <code>$1</code>.</li>
        <li><strong>re.VERBOSE</strong> (the <code>X</code> flag) lets you write multi-line, commented patterns — there is no JavaScript equivalent.</li>
        <li><strong>Inline flags</strong>, possessive quantifiers and other syntax differ subtly between engines.</li>
      </ul>
      <p>Enter a pattern and some text, flip on the flags you need, and every match is highlighted inline. Each match is broken out with its numbered and named capture groups and its start/end offsets — the same values <code>match.start()</code> and <code>match.group()</code> return in code. If your pattern has a syntax error, you get Python’s exact error message, which is the fastest way to debug a regex that won’t compile. Nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'Does this use the real Python regex engine?',
        a: 'Yes. Your pattern and text are sent to a Python function that runs re.finditer, so the matches, groups and offsets are exactly what your own Python code would produce — not a JavaScript approximation.',
      },
      {
        q: 'How do named groups work in Python regex?',
        a: 'Python uses the syntax (?P<name>...) to define a named group and (?P=name) to backreference it. This differs from JavaScript’s (?<name>...). The tester shows each named group’s captured value.',
      },
      {
        q: 'What do the flags do?',
        a: 'IGNORECASE matches regardless of case, MULTILINE makes ^ and $ match at line breaks, DOTALL makes . match newlines, VERBOSE allows whitespace and comments in the pattern, and ASCII restricts \\w, \\d, \\s to ASCII.',
      },
      {
        q: 'Is my pattern or test data stored?',
        a: 'No. The pattern and text are evaluated in memory and the result is returned. Nothing is saved.',
      },
    ],
    related: ['regex-capture-groups', 'regex-findall', 'regex-replace'],
  },
  {
    cluster: 'developer',
    slug: 'regex-capture-groups',
    primaryKeyword: 'regex capture groups',
    title: 'Regex Capture Groups Tester — See Numbered & Named Groups',
    h1: 'Regex Capture Groups Tester',
    metaDescription:
      'Free regex capture-groups tester. Run a Python pattern and see exactly what each numbered and named group captures for every match, with offsets. Great for debugging group indexes.',
    intro:
      'See exactly what every capture group grabs. Enter a Python regex with parentheses and a test string, and this tester breaks out each match into its numbered groups (\\1, \\2, …) and named groups ((?P<name>…)), so you can confirm group indexes before you write match.group(n) in your code.',
    api: { group: 'regex', test: 'match' },
    widget: {
      kind: 'regex',
      mode: 'match',
      patternDefault: '(\\d{4})-(\\d{2})-(\\d{2})',
      flagsDefault: [],
      testDefault: 'Invoices dated 2026-06-07 and 2025-12-31 are overdue.',
    },
    explainerHtml: `
      <h2>Understanding capture groups</h2>
      <p>A <strong>capture group</strong> is any part of a pattern wrapped in parentheses. Each group captures the text it matched so you can pull it out afterwards. Groups are numbered <em>left to right by their opening parenthesis</em>, starting at 1 — group 0 is always the whole match. So in <code>(\\d{4})-(\\d{2})-(\\d{2})</code>, group 1 is the year, group 2 the month, group 3 the day.</p>
      <p><strong>Named groups</strong> let you label a group instead of counting parentheses: <code>(?P&lt;year&gt;\\d{4})</code>. You then read it with <code>match.group('year')</code> or from <code>match.groupdict()</code>. Naming makes patterns far easier to maintain because inserting a new group earlier in the pattern won’t silently shift all your indexes.</p>
      <p>This tester lists, for every match, the value captured by each numbered <em>and</em> named group. If an optional group like <code>(abc)?</code> didn’t participate in the match, its value is shown as <code>None</code> — exactly what Python returns. That makes it easy to spot off-by-one group-index bugs before they reach your code. Use a <strong>non-capturing group</strong> <code>(?:...)</code> when you need grouping for alternation or quantifiers but don’t want it to consume a group number.</p>
    `,
    faq: [
      {
        q: 'How are regex capture groups numbered?',
        a: 'Groups are numbered by the position of their opening parenthesis, left to right, starting at 1. Group 0 is the entire match. Nested groups are numbered by their opening bracket too.',
      },
      {
        q: 'What is the difference between a capturing and non-capturing group?',
        a: 'A capturing group (...) stores what it matched and gets a group number. A non-capturing group (?:...) groups for alternation or quantifiers without capturing, so it does not consume a group number.',
      },
      {
        q: 'Why does a group show None?',
        a: 'If a group is optional (for example (abc)?) and did not take part in the match, Python returns None for that group. The tester shows None so you can see exactly which groups participated.',
      },
      {
        q: 'How do I name a group in Python?',
        a: 'Use (?P<name>...) to capture into a named group, then read it with match.group("name") or match.groupdict(). Named groups make patterns easier to maintain than numbered ones.',
      },
    ],
    related: ['python-regex-tester', 'regex-findall', 'regex-replace'],
  },
  {
    cluster: 'developer',
    slug: 'regex-findall',
    primaryKeyword: 'regex find all matches',
    title: 'Regex Find All Matches — Extract Every Match Online (Python)',
    h1: 'Regex Find All Matches',
    metaDescription:
      'Free tool to find all regex matches in text. Paste a Python pattern and a string to extract every non-overlapping match (like re.findall / re.finditer), highlighted with offsets.',
    intro:
      'Extract every match of a pattern from your text, the way Python’s re.findall and re.finditer do. Paste a pattern and a block of text to get all non-overlapping matches highlighted inline, counted, and listed with their positions — perfect for pulling emails, numbers, tags or IDs out of a log or document.',
    api: { group: 'regex', test: 'match' },
    widget: {
      kind: 'regex',
      mode: 'match',
      patternDefault: '#\\w+',
      flagsDefault: [],
      testDefault: 'Loving the #sunset and #beach vibes today! #Travel #travel again.',
    },
    explainerHtml: `
      <h2>Finding every match in a string</h2>
      <p>Often you don’t want just the first match — you want <em>all</em> of them: every email in a document, every hashtag in a post, every error code in a log. In Python that’s the job of <code>re.findall</code> (which returns the matched strings) and <code>re.finditer</code> (which returns full match objects with positions and groups). This tool runs <code>finditer</code>, so you get the count, the highlighted matches in context, and each match’s start/end offset.</p>
      <p>A few things worth knowing about finding all matches:</p>
      <ul>
        <li>Matches are <strong>non-overlapping</strong> — after each match, scanning resumes at the end of it. Overlapping matches need lookaheads.</li>
        <li>The <strong>global</strong> behaviour is automatic in Python — there is no <code>g</code> flag like JavaScript; <code>findall</code> always scans the whole string.</li>
        <li>Add <strong>IGNORECASE</strong> to catch <code>#Travel</code> and <code>#travel</code> together, or keep it off to treat them separately.</li>
        <li>If your pattern has groups, <code>re.findall</code> returns the groups instead of the whole match — use this tester (which shows both the full match and its groups) to avoid that gotcha.</li>
      </ul>
      <p>The results highlight every match inside your original text so you can see precisely what was caught and what was skipped. Nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'What is the difference between re.findall and re.finditer?',
        a: 're.findall returns a list of the matched strings (or group tuples if the pattern has groups). re.finditer returns match objects with positions and groups. This tool uses finditer so you get matches, offsets and groups together.',
      },
      {
        q: 'Why does re.findall return tuples instead of full matches?',
        a: 'When your pattern contains capture groups, re.findall returns the groups rather than the entire match. To get the whole match, use finditer (as this tool does) or remove the groups / make them non-capturing.',
      },
      {
        q: 'Can regex find overlapping matches?',
        a: 'Not by default — matches are non-overlapping, so scanning continues after each match. To find overlapping matches you wrap the pattern in a lookahead, e.g. (?=(your-pattern)).',
      },
      {
        q: 'Does Python need a global flag like JavaScript?',
        a: 'No. Python’s findall and finditer always scan the entire string, so there is no equivalent of JavaScript’s g flag.',
      },
    ],
    related: ['python-regex-tester', 'regex-capture-groups', 'regex-replace'],
  },
  {
    cluster: 'developer',
    slug: 'regex-replace',
    primaryKeyword: 'regex replace online',
    title: 'Regex Replace Online — Test re.sub Substitutions, Free',
    h1: 'Regex Replace (re.sub) Tester',
    metaDescription:
      'Free online regex replace tool. Test Python re.sub substitutions — use \\1 and \\g<name> backreferences in the replacement, see the result and replacement count instantly.',
    intro:
      'Test regex find-and-replace the way Python’s re.sub does it. Enter a pattern, a replacement string (with \\1 or \\g<name> backreferences), and your text to see the substituted result and how many replacements were made — before you run it on real files or in your code.',
    api: { group: 'regex', test: 'replace' },
    widget: {
      kind: 'regex',
      mode: 'replace',
      patternDefault: '(\\d{4})-(\\d{2})-(\\d{2})',
      flagsDefault: [],
      testDefault: 'Due 2026-06-07, paid 2025-12-31.',
      replaceDefault: '\\3/\\2/\\1',
    },
    explainerHtml: `
      <h2>How re.sub substitutions work</h2>
      <p>Python’s <code>re.sub(pattern, replacement, text)</code> replaces every non-overlapping match of <em>pattern</em> with <em>replacement</em> and returns the new string. This tester uses <code>re.subn</code>, which does the same thing but also tells you <strong>how many replacements</strong> were made — handy for confirming your pattern hit exactly what you expected.</p>
      <p>The real power is in the replacement string, where you can reference what you captured:</p>
      <ul>
        <li><strong>Numbered backreferences</strong> — <code>\\1</code>, <code>\\2</code>, … insert the text captured by that group. Reordering a date from <code>YYYY-MM-DD</code> to <code>DD/MM/YYYY</code> is just <code>\\3/\\2/\\1</code>.</li>
        <li><strong>Named backreferences</strong> — <code>\\g&lt;name&gt;</code> inserts a named group, and <code>\\g&lt;0&gt;</code> inserts the whole match.</li>
        <li>Note Python uses <code>\\1</code>, <strong>not</strong> JavaScript’s <code>$1</code> — a common source of confusion.</li>
      </ul>
      <p>Add flags like <strong>IGNORECASE</strong> or <strong>MULTILINE</strong> to control matching, type your replacement, and the output updates so you can verify the transformation before committing it. Nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'How do backreferences work in re.sub?',
        a: 'In the replacement string, \\1, \\2, … insert the text captured by that numbered group, and \\g<name> inserts a named group. \\g<0> inserts the entire match. Python uses \\1, not JavaScript’s $1.',
      },
      {
        q: 'How can I count how many replacements were made?',
        a: 'Use re.subn, which returns both the new string and the number of substitutions. This tester reports the replacement count for you automatically.',
      },
      {
        q: 'Why is my replacement not substituting groups?',
        a: 'Make sure you use Python syntax: \\1 or \\g<1> for numbered groups and \\g<name> for named ones. The dollar-sign syntax ($1) from JavaScript does not work in Python’s re.sub.',
      },
      {
        q: 'Is my text stored?',
        a: 'No. The substitution runs in memory and only the result is returned; nothing you enter is saved.',
      },
    ],
    related: ['python-regex-tester', 'regex-capture-groups', 'regex-findall'],
  },

  // ── Developer · JSON tools (shared json widget + stdlib json/ast endpoint, group "jsonfmt") ──
  {
    cluster: 'developer',
    slug: 'json-formatter',
    primaryKeyword: 'json formatter',
    title: 'JSON Formatter — Free Online JSON Formatter & Validator',
    h1: 'JSON Formatter',
    metaDescription:
      'Free online JSON formatter and validator. Paste JSON to pretty-print it with your chosen indent, sort keys, validate with exact error location, or minify. Also converts Python dicts.',
    intro:
      'Format and validate JSON instantly. Paste your JSON to pretty-print it with 2-space, 4-space or tab indentation, optionally sort keys alphabetically, and validate it with the exact error line and column if something is wrong. It even accepts Python dict and list literals and converts them to valid JSON.',
    api: { group: 'jsonfmt', test: 'format' },
    widget: {
      kind: 'json',
      mode: 'pretty',
      sample: '{"name":"Ada","langs":["Python","JS"],"active":true,"meta":{"age":36,"city":"London"}}',
    },
    explainerHtml: `
      <h2>Formatting and validating JSON</h2>
      <p>A <strong>JSON formatter</strong> takes compact or messy JSON and re-indents it into a clean, readable structure — and in doing so tells you whether it’s valid. This tool runs Python’s own <code>json</code> parser on the server, so validation is exact: if the JSON is malformed you get the precise <strong>line and column</strong> of the problem, the same message you’d see in your code.</p>
      <p>Useful options:</p>
      <ul>
        <li><strong>Indent</strong> — choose 2 spaces, 4 spaces or tabs to match your project’s style.</li>
        <li><strong>Sort keys</strong> — order object keys alphabetically, which makes diffs and comparisons far easier.</li>
        <li><strong>Minify</strong> — collapse to a single line with no whitespace for the smallest payload.</li>
      </ul>
      <p>A Python bonus: paste a <strong>Python dict or list literal</strong> — with single quotes, <code>True</code>/<code>False</code>/<code>None</code> — and the tool will parse it and emit valid JSON (<code>true</code>/<code>false</code>/<code>null</code>). Your data is parsed in memory and nothing is stored.</p>
    `,
    faq: [
      {
        q: 'How do I know if my JSON is valid?',
        a: 'Paste it and format. If it is valid you get the formatted output and a green “Valid” badge; if not, you get the exact error message with the line and column where parsing failed.',
      },
      {
        q: 'Can this convert a Python dictionary to JSON?',
        a: 'Yes. If the input is not valid JSON, the tool tries to read it as a Python literal (single quotes, True/False/None) and converts it to proper JSON with true/false/null.',
      },
      {
        q: 'What is the difference between formatting and minifying?',
        a: 'Formatting (pretty-printing) adds indentation and line breaks for readability. Minifying removes all unnecessary whitespace to produce the smallest possible single-line JSON, useful for transmission.',
      },
      {
        q: 'Is my JSON stored?',
        a: 'No. It is parsed and formatted in memory and the result returned. Nothing is saved.',
      },
    ],
    related: ['json-validator', 'json-beautifier', 'json-minifier'],
  },
  {
    cluster: 'developer',
    slug: 'json-validator',
    primaryKeyword: 'json validator',
    title: 'JSON Validator — Check JSON Syntax with Error Location',
    h1: 'JSON Validator',
    metaDescription:
      'Free online JSON validator. Paste JSON to check whether it is valid and get the exact line and column of any syntax error, powered by Python’s json parser. Nothing stored.',
    intro:
      'Validate your JSON and pinpoint any error. Paste JSON to instantly check whether it is syntactically valid — and if not, get the exact line and column and a clear message describing what went wrong, using Python’s strict json parser.',
    api: { group: 'jsonfmt', test: 'format' },
    widget: {
      kind: 'json',
      mode: 'pretty',
      strict: true,
      action: 'Validate JSON',
      sample: '{\n  "id": 42,\n  "tags": ["a", "b",],\n  "ok": true\n}',
    },
    explainerHtml: `
      <h2>Validating JSON the strict way</h2>
      <p>A <strong>JSON validator</strong> checks that your text follows the JSON specification exactly. JSON is stricter than many people expect, and the most common mistakes are easy to miss by eye:</p>
      <ul>
        <li><strong>Trailing commas</strong> — <code>[1, 2,]</code> or <code>{"a": 1,}</code> are invalid in JSON (the sample above has one).</li>
        <li><strong>Single quotes</strong> — strings and keys must use double quotes.</li>
        <li><strong>Unquoted keys</strong> — every object key must be a quoted string.</li>
        <li><strong>Python/JS values</strong> — <code>True</code>, <code>None</code>, <code>NaN</code>, <code>undefined</code> are not valid JSON (use <code>true</code>, <code>null</code>).</li>
      </ul>
      <p>This validator uses Python’s <code>json</code> module, which reports the precise <strong>line and column</strong> of the first error — so instead of a vague “invalid JSON”, you know exactly where to look. When the input is valid, it also pretty-prints it for you. Nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'Why is my JSON invalid?',
        a: 'The most common causes are trailing commas, single quotes instead of double quotes, unquoted keys, or using Python/JavaScript values like True, None or undefined. The validator shows the exact line and column of the first error.',
      },
      {
        q: 'Are trailing commas allowed in JSON?',
        a: 'No. Unlike JavaScript, JSON does not permit a trailing comma after the last element of an array or object. Remove it to make the JSON valid.',
      },
      {
        q: 'Does the validator show where the error is?',
        a: 'Yes. It reports the line and column of the first syntax error along with a description, using Python’s json parser, so you can jump straight to the problem.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Validation runs in memory and nothing you paste is saved.',
      },
    ],
    related: ['json-formatter', 'json-beautifier', 'json-minifier'],
  },
  {
    cluster: 'developer',
    slug: 'json-beautifier',
    primaryKeyword: 'json beautifier',
    title: 'JSON Beautifier — Pretty-Print JSON Online, Free',
    h1: 'JSON Beautifier',
    metaDescription:
      'Free JSON beautifier. Paste minified or messy JSON to pretty-print it with clean indentation and optional sorted keys. Validates as it formats. Nothing stored.',
    intro:
      'Beautify minified or messy JSON into clean, readable, indented form. Paste your JSON, choose your indentation and whether to sort keys, and get nicely formatted output you can copy — with validation built in so you know it’s correct.',
    api: { group: 'jsonfmt', test: 'format' },
    widget: {
      kind: 'json',
      mode: 'pretty',
      sample: '{"order":{"id":1001,"items":[{"sku":"A1","qty":2},{"sku":"B7","qty":1}],"paid":true}}',
    },
    explainerHtml: `
      <h2>Why beautify JSON?</h2>
      <p>Minified JSON — all on one line with no spaces — is efficient for machines but painful for humans. A <strong>JSON beautifier</strong> expands it into an indented, hierarchical layout where the structure is obvious at a glance, which makes debugging API responses, config files and logs dramatically easier.</p>
      <p>This beautifier lets you pick <strong>2 spaces, 4 spaces or tabs</strong> to match your editor, and optionally <strong>sort object keys alphabetically</strong> so the same data always formats identically — handy when comparing two responses in a diff. Because it parses with Python’s <code>json</code> module, beautifying also validates: if the input isn’t valid JSON, you’ll get the exact location of the error instead of garbled output.</p>
      <p>Paste, beautify, and copy the clean result. It even accepts Python dict literals and turns them into proper JSON. Nothing you paste is stored.</p>
    `,
    faq: [
      {
        q: 'What does beautifying JSON do?',
        a: 'It re-formats JSON with indentation and line breaks so the structure is easy to read, the opposite of minifying. The data itself is unchanged — only the whitespace and layout.',
      },
      {
        q: 'Can I choose the indentation?',
        a: 'Yes. You can pretty-print with 2 spaces, 4 spaces or tabs, and optionally sort the keys alphabetically for consistent, diff-friendly output.',
      },
      {
        q: 'Does beautifying also validate the JSON?',
        a: 'Yes. The input must be parsed before it can be re-formatted, so invalid JSON is caught and reported with the exact line and column of the error.',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Everything runs in memory and nothing you paste is saved.',
      },
    ],
    related: ['json-formatter', 'json-validator', 'json-minifier'],
  },
  {
    cluster: 'developer',
    slug: 'json-minifier',
    primaryKeyword: 'json minifier',
    title: 'JSON Minifier — Minify & Compress JSON Online, Free',
    h1: 'JSON Minifier',
    metaDescription:
      'Free JSON minifier. Paste JSON to strip all whitespace and compress it to a single line, reducing payload size. Validates as it minifies and shows the size saved. Nothing stored.',
    intro:
      'Minify your JSON to the smallest possible size. Paste formatted JSON to strip out all whitespace and line breaks, producing a compact single-line string ideal for transmission, storage or embedding — with validation built in and the output size shown.',
    api: { group: 'jsonfmt', test: 'format' },
    widget: {
      kind: 'json',
      mode: 'minify',
      sample: '{\n  "name": "Ada",\n  "langs": ["Python", "JS"],\n  "active": true,\n  "meta": {\n    "age": 36\n  }\n}',
    },
    explainerHtml: `
      <h2>Minifying JSON to shrink payloads</h2>
      <p>A <strong>JSON minifier</strong> removes every unnecessary character — spaces, tabs and newlines between tokens — to produce the most compact valid JSON possible. The data is identical; it just takes fewer bytes, which means faster network transfers and smaller storage, especially across many API calls.</p>
      <p>Minification is the counterpart to beautifying: you beautify while developing and debugging, then minify for production payloads, embedding JSON in a URL or a data attribute, or storing it compactly. This tool shows the resulting <strong>character count</strong> so you can see exactly how much smaller the output is.</p>
      <p>As with the formatter, minifying first <strong>parses and validates</strong> your JSON using Python’s <code>json</code> module, so you can’t accidentally produce broken output — invalid input is flagged with the exact error location. Paste, minify, and copy. Nothing you enter is stored.</p>
    `,
    faq: [
      {
        q: 'What does minifying JSON do?',
        a: 'It removes all whitespace between tokens, collapsing the JSON to a single compact line. The data is unchanged but the byte size is smaller, which speeds up transfer and reduces storage.',
      },
      {
        q: 'Does minifying change my data?',
        a: 'No. Only whitespace and formatting are removed. Keys, values, order and structure stay exactly the same — it is purely a size optimisation.',
      },
      {
        q: 'Is minified JSON still valid?',
        a: 'Yes. The minifier parses and validates your JSON first, so the compact output is guaranteed to be valid JSON (assuming the input was, or could be read as a Python literal).',
      },
      {
        q: 'Is my data stored?',
        a: 'No. Minification runs in memory and nothing you paste is saved.',
      },
    ],
    related: ['json-formatter', 'json-validator', 'json-beautifier'],
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
