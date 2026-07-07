/** @type {import('astro').AstroGlobal} */
export const SITE = {
  title: 'FunctionPedia',
  description: 'Every Excel & Google Sheets function explained with real examples, common errors, and Google Sheets equivalents.',
  url: 'https://functionpedia.com',
  domain: 'functionpedia.com',
  author: 'FunctionPedia',
  keywords: ['excel functions', 'google sheets functions', 'excel formulas', 'spreadsheet functions', 'vlookup', 'xlookup', 'if function'],
};

export const CATEGORIES = [
  { slug: 'financial', name: 'Financial Functions', icon: '💰', description: 'Loan payments, interest rates, investments, and depreciation calculations', count: 55 },
  { slug: 'statistical', name: 'Statistical Functions', icon: '📊', description: 'Averages, standard deviations, correlations, and forecasting', count: 43 },
  { slug: 'math', name: 'Math & Trigonometry Functions', icon: '🔢', description: 'Rounding, sums, products, and mathematical operations', count: 33 },
  { slug: 'text', name: 'Text Functions', icon: '📝', description: 'String manipulation, concatenation, and text formatting', count: 20 },
  { slug: 'datetime', name: 'Date & Time Functions', icon: '📅', description: 'Date calculations, time formatting, and duration tracking', count: 20 },
  { slug: 'database', name: 'Database Functions', icon: '🗄️', description: 'Query and aggregate data with criteria-based functions', count: 13 },
  { slug: 'lookup', name: 'Lookup & Reference Functions', icon: '🔍', description: 'Find and retrieve data across your spreadsheet with VLOOKUP, XLOOKUP, INDEX/MATCH', count: 9 },
  { slug: 'logical', name: 'Logical Functions', icon: '🔀', description: 'Conditional logic, branching, and decision-making in formulas', count: 10 },
  { slug: 'array', name: 'Dynamic Array Functions', icon: '📦', description: 'FILTER, SORT, UNIQUE — modern array functions for Excel 365', count: 7 },
  { slug: 'information', name: 'Information Functions', icon: 'ℹ️', description: 'Check cell types, errors, and metadata about your data', count: 9 },
  { slug: 'google-sheets', name: 'Google Sheets Functions', icon: '🟢', description: 'Exclusive Google Sheets functions: QUERY, IMPORTRANGE, ARRAYFORMULA', count: 11 },
];

export const POPULAR_FUNCTIONS = [
  'vlookup', 'xlookup', 'if', 'sumif', 'countif', 'index', 'match', 'pmt', 'filter', 'query',
];
