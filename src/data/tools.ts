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

export type Widget = NumericGroupsWidget | LoanWidget;

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
  // developer / writing clusters added as their tools are built.
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
