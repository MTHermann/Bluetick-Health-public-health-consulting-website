import { defaultAuthor } from './siteContent.js'

// Repository review queue only; never import this module into public pages or build outputs.
export const blogDrafts = [
  {
    status: 'pending-approval',
    post: {
      slug: 'missing-data-handling-health-research',
      title: 'Missing Data Handling in Health Research: Practical Strategies and Pitfalls',
      datePublished: null,
      author: defaultAuthor,
      keywords: ['missing data', 'multiple imputation', 'sensitivity analysis', 'health research', 'biostatistics'],
      excerpt:
        'A practical guide to assessing missingness, choosing defensible analysis methods, and reporting uncertainty without overstating what incomplete health data can tell us.',
      summary:
        'Understand missing-data mechanisms, complete-case analysis, multiple imputation, and sensitivity analyses for transparent clinical and public health research.',
      paragraphs: [
        'Missing data are not simply empty cells to be filled. In health research, missed visits, incomplete questionnaires, and unavailable laboratory results can change who is represented in an analysis. Begin by reporting missingness for each variable, describing patterns across visits and participant groups, and distinguishing values that are unavailable from those that are not applicable. This article focuses on statistical handling after collection, rather than the database practices covered in our data management guide.',
        'Method choice depends on why observations are missing. Missing completely at random means missingness is unrelated to observed or unobserved values. Missing at random allows missingness to depend on observed information, while missing not at random means it still depends on unobserved values after conditioning on observed data. Observed patterns can inform these assumptions but cannot establish that missingness is ignorable. Clinical context and knowledge of follow-up processes are essential.',
        'Complete-case analysis is straightforward but discards information and can introduce selection bias; its validity depends on the estimand, model, and missingness mechanism. Replacing missing values with a single mean generally understates uncertainty and distorts relationships. Multiple imputation instead creates several plausible completed datasets, analyses each using the planned model, and pools estimates and variances. It requires a suitable imputation model and does not automatically correct bias.',
        'An imputation plan should include the analysis outcome, relevant predictors, and auxiliary variables that help explain missingness or predict missing values. Respect variable types, plausible ranges, interactions, and clustering or repeated measures. Inspect imputation diagnostics and compare observed and imputed distributions. Choose enough imputations for stable estimates and standard errors, and record the model specification and random seed so that the analysis can be reproduced.',
        'Sensitivity analyses should examine how conclusions change under plausible departures from the main assumptions, including missing-not-at-random scenarios where appropriate. Report missing-data counts, the rationale for the chosen method, diagnostics, pooled uncertainty, and sensitivity results alongside the primary findings. If conclusions depend strongly on unverifiable assumptions, say so explicitly. The objective is a defensible account of uncertainty, not the appearance of a complete dataset.',
      ],
    },
  },
  {
    status: 'pending-approval',
    post: {
      slug: 'data-visualization-health-decision-making',
      title: 'Data Visualization for Health Decision-Making',
      datePublished: null,
      author: defaultAuthor,
      keywords: ['data visualization', 'health decision-making', 'public health communication', 'uncertainty', 'dashboards'],
      excerpt:
        'Turn health findings into clear, accessible graphics that support decisions while preserving denominators, uncertainty, and essential context.',
      summary:
        'Choose effective charts for health decisions, communicate uncertainty, and avoid misleading comparisons in reports, presentations, and dashboards.',
      paragraphs: [
        'A useful health visualisation starts with a decision rather than a chart type. Does a programme manager need to identify service gaps, compare facilities, or understand a change over time? Define the audience, the action under consideration, and the measure that supports it. Unlike an analysis-method tutorial, this guide focuses on communicating existing findings so that policymakers and programme teams can understand both the signal and its limitations.',
        'Match the chart to the question. Line charts support comparisons over time, while dot plots or bars can compare categories. Distributions often need histograms or box plots rather than a single average. Label units, time periods, sources, and denominators clearly. Counts describe workload, whereas rates or proportions support different comparisons; neither should silently substitute for the other when population sizes or reporting completeness vary.',
        'Show uncertainty when estimates inform decisions. Confidence intervals can help readers assess precision, while prediction intervals describe uncertainty around future observations. Explain which interval is shown and avoid presenting small apparent differences as conclusive rankings. Distinguish observed data from modelled values, mark interruptions in reporting, and make missing observations visible rather than implying a continuous measured trend.',
        'Design choices can either clarify or distort evidence. Bar charts generally need a zero baseline because bar length encodes magnitude; any restricted axis on other charts should be explicit and justified. Avoid three-dimensional effects, overloaded legends, and colour scales that exaggerate differences. Use readable labels, adequate contrast, and symbols or direct labels alongside colour so that the message remains accessible in print and to readers with colour-vision differences.',
        'Test the graphic with its intended audience: can readers identify the main finding, its uncertainty, and the decision it supports? Pair each chart with a short interpretation and a source note, and provide an accessible table or text summary where practical. Maps and small-group displays also require disclosure-risk review before release. A successful visualisation makes evidence easier to use without concealing limitations or exposing sensitive health information.',
      ],
    },
  },
  {
    status: 'pending-approval',
    post: {
      slug: 'health-equity-analysis-health-outcomes',
      title: 'Health Equity Analysis: Measuring and Interpreting Inequality in Health Outcomes',
      datePublished: null,
      author: defaultAuthor,
      keywords: ['health equity', 'health inequalities', 'absolute differences', 'relative differences', 'public health'],
      excerpt:
        'Measure health outcome gaps with transparent comparisons, appropriate uncertainty, and careful attention to social context and representation.',
      summary:
        'Explore absolute and relative inequality measures, standardisation, and responsible interpretation when assessing equity in health outcomes and access.',
      paragraphs: [
        'Health equity analysis asks who benefits from health services and who continues to experience avoidable disadvantage. Inequality describes a measurable difference; inequity involves a judgement about whether that difference is unfair and avoidable. Start with a defined outcome, population, time period, and equity question. Choose comparison groups with contextual input rather than treating routinely available categories as a complete account of social disadvantage.',
        'Check representation before calculating gaps. Incomplete follow-up, poorly recorded demographic variables, and survey non-response can hide disadvantage. Report subgroup denominators and data completeness, and account for survey weights, clustering, or repeated observations where the design requires them. Examine age composition and consider standardisation when comparing populations, making the reference population and the distinction between crude and standardised estimates explicit.',
        'Present absolute and relative measures together. In a hypothetical example, adverse-outcome rates of 20 and 10 per 1,000 correspond to an absolute difference of 10 per 1,000 and a rate ratio of 2. If those rates fall to 10 and 4 per 1,000, the absolute gap narrows to 6 while the ratio rises to 2.5. Both descriptions are correct, demonstrating why a single measure can give an incomplete picture of progress.',
        'For ordered socioeconomic groups, slope and relative indices of inequality can summarise gradients across the distribution, but their assumptions and scale need explanation. For all comparisons, report uncertainty and avoid interpreting unstable small-subgroup estimates as reliable rankings. Adjusted analyses answer different questions from crude comparisons: controlling for variables on a pathway from social disadvantage to an outcome may obscure part of the inequality of interest.',
        'Interpret findings with communities and programme partners rather than attributing differences to group identity itself. Observed gaps do not establish their causes, and area-level patterns cannot automatically be applied to individuals. Review privacy risks, especially for small or intersecting groups, and explain any suppression or aggregation. Link findings to feasible actions and track both overall improvement and the distribution of benefits over time.',
      ],
    },
  },
]
