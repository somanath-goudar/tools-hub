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
};

export type RegexWidget = {
  kind: 'regex';
  mode: 'match' | 'replace';
  patternDefault: string;
  flagsDefault: string[]; // subset of IGNORECASE|MULTILINE|DOTALL|VERBOSE|ASCII
  testDefault: string;
  replaceDefault?: string; // only used in replace mode
};

export type Widget = NumericGroupsWidget | LoanWidget | TextWidget | RegexWidget;

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
