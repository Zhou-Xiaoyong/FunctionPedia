import fs from 'fs';
import path from 'path';

interface FunctionParameter {
  name: string;
  description: string;
  required: boolean;
}

interface BasicExample {
  description: string;
  formula: string;
  result: string;
  explanation: string;
}

interface AdvancedExample {
  title: string;
  scenario: string;
  description: string;
  formula: string;
  result: string;
  explanation: string;
}

interface HowToStep {
  name: string;
  text: string;
}

interface CommonError {
  error: string;
  cause: string;
  fix: string;
}

interface GoogleSheetsEquivalent {
  description: string;
  formula: string;
  notes?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FunctionData {
  name: string;
  slug: string;
  category: string;
  excelVersion: string;
  description: string;
  tldr: string;
  syntax: string;
  parameters: FunctionParameter[];
  basicExample: BasicExample;
  advancedExamples: AdvancedExample[];
  howItWorks: string;
  howToSteps: HowToStep[];
  limitations: string[];
  commonErrors: CommonError[];
  googleSheetsEquivalent: GoogleSheetsEquivalent;
  faq: FAQItem[];
  relatedFunctions?: string[];
}

const CATEGORIES = {
  statistical: 'statistical',
  math: 'math',
  text: 'text',
  datetime: 'datetime',
  database: 'database',
  engineering: 'engineering',
  information: 'information',
  logical: 'logical',
  lookup: 'lookup',
  array: 'array',
  financial: 'financial',
  'google-sheets': 'google-sheets',
};

const FUNCTION_DEFINITIONS: { name: string; category: keyof typeof CATEGORIES }[] = [
  { name: 'COUNT', category: 'statistical' },
  { name: 'COUNTA', category: 'statistical' },
  { name: 'COUNTBLANK', category: 'statistical' },
  { name: 'SUM', category: 'statistical' },
  { name: 'SUMIF', category: 'statistical' },
  { name: 'SUMIFS', category: 'statistical' },
  { name: 'MAX', category: 'statistical' },
  { name: 'MAXIFS', category: 'statistical' },
  { name: 'MIN', category: 'statistical' },
  { name: 'MINIFS', category: 'statistical' },
  { name: 'STDEV', category: 'statistical' },
  { name: 'STDEVA', category: 'statistical' },
  { name: 'STDEVP', category: 'statistical' },
  { name: 'STDEVPA', category: 'statistical' },
  { name: 'VAR', category: 'statistical' },
  { name: 'VARA', category: 'statistical' },
  { name: 'VARP', category: 'statistical' },
  { name: 'VARPA', category: 'statistical' },
  { name: 'AVERAGE', category: 'statistical' },
  { name: 'AVERAGEIF', category: 'statistical' },
  { name: 'AVERAGEIFS', category: 'statistical' },
  { name: 'MEDIAN', category: 'statistical' },
  { name: 'MODE', category: 'statistical' },
  { name: 'MODE.SNGL', category: 'statistical' },
  { name: 'MODE.MULT', category: 'statistical' },
  { name: 'RANK', category: 'statistical' },
  { name: 'RANK.EQ', category: 'statistical' },
  { name: 'RANK.AVG', category: 'statistical' },
  { name: 'PERCENTILE', category: 'statistical' },
  { name: 'PERCENTILE.EXC', category: 'statistical' },
  { name: 'PERCENTILE.INC', category: 'statistical' },
  { name: 'QUARTILE', category: 'statistical' },
  { name: 'QUARTILE.EXC', category: 'statistical' },
  { name: 'QUARTILE.INC', category: 'statistical' },
  { name: 'CORREL', category: 'statistical' },
  { name: 'PEARSON', category: 'statistical' },
  { name: 'FORECAST', category: 'statistical' },
  { name: 'FORECAST.LINEAR', category: 'statistical' },
  { name: 'LINEST', category: 'statistical' },
  { name: 'TREND', category: 'statistical' },
  { name: 'GROWTH', category: 'statistical' },
  { name: 'ROUND', category: 'math' },
  { name: 'ROUNDUP', category: 'math' },
  { name: 'ROUNDDOWN', category: 'math' },
  { name: 'MROUND', category: 'math' },
  { name: 'INT', category: 'math' },
  { name: 'TRUNC', category: 'math' },
  { name: 'ABS', category: 'math' },
  { name: 'SQRT', category: 'math' },
  { name: 'POWER', category: 'math' },
  { name: 'EXP', category: 'math' },
  { name: 'LN', category: 'math' },
  { name: 'LOG', category: 'math' },
  { name: 'LOG10', category: 'math' },
  { name: 'MOD', category: 'math' },
  { name: 'PI', category: 'math' },
  { name: 'SIN', category: 'math' },
  { name: 'COS', category: 'math' },
  { name: 'TAN', category: 'math' },
  { name: 'ASIN', category: 'math' },
  { name: 'ACOS', category: 'math' },
  { name: 'ATAN', category: 'math' },
  { name: 'ATAN2', category: 'math' },
  { name: 'RADIANS', category: 'math' },
  { name: 'DEGREES', category: 'math' },
  { name: 'SIGN', category: 'math' },
  { name: 'CEILING', category: 'math' },
  { name: 'CEILING.MATH', category: 'math' },
  { name: 'FLOOR', category: 'math' },
  { name: 'FLOOR.MATH', category: 'math' },
  { name: 'PRODUCT', category: 'math' },
  { name: 'SUMPRODUCT', category: 'math' },
  { name: 'LEFT', category: 'text' },
  { name: 'RIGHT', category: 'text' },
  { name: 'MID', category: 'text' },
  { name: 'LEN', category: 'text' },
  { name: 'LENB', category: 'text' },
  { name: 'CONCAT', category: 'text' },
  { name: 'CONCATENATE', category: 'text' },
  { name: 'TEXTJOIN', category: 'text' },
  { name: 'TRIM', category: 'text' },
  { name: 'CLEAN', category: 'text' },
  { name: 'UPPER', category: 'text' },
  { name: 'LOWER', category: 'text' },
  { name: 'PROPER', category: 'text' },
  { name: 'SUBSTITUTE', category: 'text' },
  { name: 'REPLACE', category: 'text' },
  { name: 'REPT', category: 'text' },
  { name: 'FIND', category: 'text' },
  { name: 'SEARCH', category: 'text' },
  { name: 'TEXT', category: 'text' },
  { name: 'VALUE', category: 'text' },
  { name: 'TODAY', category: 'datetime' },
  { name: 'NOW', category: 'datetime' },
  { name: 'YEAR', category: 'datetime' },
  { name: 'MONTH', category: 'datetime' },
  { name: 'DAY', category: 'datetime' },
  { name: 'HOUR', category: 'datetime' },
  { name: 'MINUTE', category: 'datetime' },
  { name: 'SECOND', category: 'datetime' },
  { name: 'DATE', category: 'datetime' },
  { name: 'TIME', category: 'datetime' },
  { name: 'DATEDIF', category: 'datetime' },
  { name: 'DAYS', category: 'datetime' },
  { name: 'WEEKDAY', category: 'datetime' },
  { name: 'WEEKNUM', category: 'datetime' },
  { name: 'EDATE', category: 'datetime' },
  { name: 'EOMONTH', category: 'datetime' },
  { name: 'NETWORKDAYS', category: 'datetime' },
  { name: 'NETWORKDAYS.INTL', category: 'datetime' },
  { name: 'WORKDAY', category: 'datetime' },
  { name: 'WORKDAY.INTL', category: 'datetime' },
  { name: 'IF', category: 'logical' },
  { name: 'IFS', category: 'logical' },
  { name: 'AND', category: 'logical' },
  { name: 'OR', category: 'logical' },
  { name: 'NOT', category: 'logical' },
  { name: 'TRUE', category: 'logical' },
  { name: 'FALSE', category: 'logical' },
  { name: 'IFERROR', category: 'logical' },
  { name: 'IFNA', category: 'logical' },
  { name: 'XOR', category: 'logical' },
  { name: 'INDEX', category: 'lookup' },
  { name: 'MATCH', category: 'lookup' },
  { name: 'VLOOKUP', category: 'lookup' },
  { name: 'HLOOKUP', category: 'lookup' },
  { name: 'XLOOKUP', category: 'lookup' },
  { name: 'INDIRECT', category: 'lookup' },
  { name: 'OFFSET', category: 'lookup' },
  { name: 'CHOOSE', category: 'lookup' },
  { name: 'TRANSPOSE', category: 'lookup' },
  { name: 'UNIQUE', category: 'array' },
  { name: 'SORT', category: 'array' },
  { name: 'SORTBY', category: 'array' },
  { name: 'FILTER', category: 'array' },
  { name: 'SEQUENCE', category: 'array' },
  { name: 'RANDARRAY', category: 'array' },
  { name: 'XMATCH', category: 'array' },
  { name: 'DATABASE', category: 'database' },
  { name: 'DAVERAGE', category: 'database' },
  { name: 'DCOUNT', category: 'database' },
  { name: 'DCOUNTA', category: 'database' },
  { name: 'DGET', category: 'database' },
  { name: 'DMAX', category: 'database' },
  { name: 'DMIN', category: 'database' },
  { name: 'DPRODUCT', category: 'database' },
  { name: 'DSTDEV', category: 'database' },
  { name: 'DSTDEVP', category: 'database' },
  { name: 'DSUM', category: 'database' },
  { name: 'DVAR', category: 'database' },
  { name: 'DVARP', category: 'database' },
  { name: 'ISNUMBER', category: 'information' },
  { name: 'ISTEXT', category: 'information' },
  { name: 'ISBLANK', category: 'information' },
  { name: 'ISERROR', category: 'information' },
  { name: 'ISNA', category: 'information' },
  { name: 'ISREF', category: 'information' },
  { name: 'TYPE', category: 'information' },
  { name: 'CELL', category: 'information' },
  { name: 'ERROR.TYPE', category: 'information' },
];

function generateFunctionData(fn: { name: string; category: keyof typeof CATEGORIES }): FunctionData {
  const name = fn.name;
  const slug = name.toLowerCase().replace('.', '-');
  const category = CATEGORIES[fn.category];

  const functionTemplates: Record<string, Partial<FunctionData>> = {
    COUNT: {
      excelVersion: 'All versions',
      description: 'COUNT counts the number of cells that contain numbers within a specified range.',
      tldr: 'COUNT returns the count of cells containing numbers in a range.',
      syntax: '(value1, [value2], ...)',
      parameters: [
        { name: 'value1', description: 'The first item, cell reference, or range to count.', required: true },
        { name: 'value2', description: 'Optional additional items, cell references, or ranges to count.', required: false },
      ],
      basicExample: {
        description: 'Count the number of numeric entries in a range',
        formula: '=COUNT(A1:A10)',
        result: '7',
        explanation: 'Counts how many cells in A1:A10 contain numbers, ignoring text and blank cells.',
      },
      advancedExamples: [
        {
          title: 'Count across multiple ranges',
          scenario: 'Data analysis',
          description: 'Count numeric values across multiple non-contiguous ranges',
          formula: '=COUNT(A1:A10, C1:C10, E1:E10)',
          result: '15',
          explanation: 'Counts numbers in three separate columns and returns the total.',
        },
        {
          title: 'Count with criteria using COUNTIF',
          scenario: 'Filtered counting',
          description: 'For conditional counting, use COUNTIF or COUNTIFS instead',
          formula: '=COUNTIF(A1:A10, ">50")',
          result: '4',
          explanation: 'COUNTIF counts cells that meet a specific condition, like values greater than 50.',
        },
      ],
      howItWorks: 'COUNT scans each cell in the specified range and counts only those containing numeric values. It ignores empty cells, text, logical values (TRUE/FALSE), and error values.',
      howToSteps: [
        { name: 'Select a cell', text: 'Choose where you want the count result to appear.' },
        { name: 'Enter the formula', text: 'Type =COUNT(range) where range is your data.' },
        { name: 'Press Enter', text: 'The result shows the number of numeric cells.' },
      ],
      limitations: [
        'COUNT only counts cells with numeric values — text, blanks, and logical values are ignored.',
        'Use COUNTA to count all non-empty cells, or COUNTIF/COUNTIFS for conditional counting.',
      ],
      commonErrors: [
        { error: '0', cause: 'No numeric values found in the range', fix: 'Check your data range or use COUNTA if you want to count all non-empty cells.' },
      ],
      googleSheetsEquivalent: {
        description: 'COUNT works identically in Google Sheets with the same syntax.',
        formula: '=COUNT(A1:A10)',
      },
      faq: [
        { question: 'What is the difference between COUNT and COUNTA?', answer: 'COUNT only counts numeric values, while COUNTA counts all non-empty cells including text and logical values.' },
        { question: 'Does COUNT include blank cells?', answer: 'No, COUNT ignores blank cells. Use COUNTA or COUNTBLANK to count blanks.' },
        { question: 'Can COUNT count across multiple sheets?', answer: 'Yes, you can reference ranges from multiple sheets: =COUNT(Sheet1!A1:A10, Sheet2!A1:A10)' },
      ],
    },
    COUNTA: {
      excelVersion: 'All versions',
      description: 'COUNTA counts the number of non-empty cells within a specified range, regardless of the cell content.',
      tldr: 'COUNTA returns the count of all non-empty cells in a range, including text, numbers, and logical values.',
      syntax: '(value1, [value2], ...)',
      parameters: [
        { name: 'value1', description: 'The first item, cell reference, or range to count.', required: true },
        { name: 'value2', description: 'Optional additional items, cell references, or ranges to count.', required: false },
      ],
      basicExample: {
        description: 'Count all non-empty cells in a range',
        formula: '=COUNTA(A1:A10)',
        result: '8',
        explanation: 'Counts all cells in A1:A10 that contain any value (text, numbers, or logical values), ignoring only completely blank cells.',
      },
      advancedExamples: [
        {
          title: 'Count responses in a survey',
          scenario: 'Survey analysis',
          description: 'Count how many respondents answered a question',
          formula: '=COUNTA(B2:B100)',
          result: '95',
          explanation: 'Counts all non-empty cells in the response column to find the number of completed surveys.',
        },
      ],
      howItWorks: 'COUNTA examines each cell in the range and counts it if it contains any value — numbers, text, logical values (TRUE/FALSE), or error values. Only completely blank cells are excluded.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =COUNTA(range) where range contains your data.' },
        { name: 'Press Enter', text: 'The result shows the total count of non-empty cells.' },
      ],
      limitations: [
        'COUNTA counts cells with formulas that return empty strings ("") as non-empty.',
        'For counting only numeric values, use COUNT instead.',
      ],
      commonErrors: [
        { error: '0', cause: 'All cells in the range are blank', fix: 'Verify your data range is correct.' },
      ],
      googleSheetsEquivalent: {
        description: 'COUNTA works identically in Google Sheets.',
        formula: '=COUNTA(A1:A10)',
      },
      faq: [
        { question: 'What counts as non-empty for COUNTA?', answer: 'Text, numbers, dates, logical values (TRUE/FALSE), and error values all count. Only completely blank cells are ignored.' },
        { question: 'Does COUNTA count cells with formulas?', answer: 'Yes, including cells with formulas that return empty strings ("").' },
      ],
    },
    COUNTBLANK: {
      excelVersion: 'All versions',
      description: 'COUNTBLANK counts the number of empty cells within a specified range.',
      tldr: 'COUNTBLANK returns the count of completely blank cells in a range.',
      syntax: '(range)',
      parameters: [
        { name: 'range', description: 'The range of cells to check for blank cells.', required: true },
      ],
      basicExample: {
        description: 'Count blank cells in a data range',
        formula: '=COUNTBLANK(A1:A10)',
        result: '3',
        explanation: 'Counts how many cells in A1:A10 are completely empty.',
      },
      advancedExamples: [
        {
          title: 'Calculate completion rate',
          scenario: 'Progress tracking',
          description: 'Determine what percentage of cells have been filled in',
          formula: '=1 - COUNTBLANK(A1:A100)/COUNTA(A1:A100)',
          result: '85%',
          explanation: 'Subtracts the blank count from the total to get the completion percentage.',
        },
      ],
      howItWorks: 'COUNTBLANK scans each cell in the range and counts it only if it is completely empty. Cells containing formulas (even those returning empty strings) are not counted as blank.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =COUNTBLANK(range).' },
        { name: 'Press Enter', text: 'The result shows the number of blank cells.' },
      ],
      limitations: [
        'Cells with formulas that return "" are not counted as blank.',
        'Cells with only spaces are not counted as blank.',
      ],
      commonErrors: [
        { error: '0', cause: 'No blank cells found', fix: 'Verify your data range.' },
      ],
      googleSheetsEquivalent: {
        description: 'COUNTBLANK works identically in Google Sheets.',
        formula: '=COUNTBLANK(A1:A10)',
      },
      faq: [
        { question: 'Does COUNTBLANK count cells with formulas?', answer: 'No, even if a formula returns an empty string, the cell is not considered blank.' },
        { question: 'How do I count cells with spaces?', answer: 'Use COUNTIF with a space pattern: =COUNTIF(range, " ")' },
      ],
    },
    SUM: {
      excelVersion: 'All versions',
      description: 'SUM adds all the numbers in a range of cells and returns the total.',
      tldr: 'SUM calculates the sum of numeric values in a range.',
      syntax: '(number1, [number2], ...)',
      parameters: [
        { name: 'number1', description: 'The first number, cell reference, or range to add.', required: true },
        { name: 'number2', description: 'Optional additional numbers, cell references, or ranges to add.', required: false },
      ],
      basicExample: {
        description: 'Sum values in a column',
        formula: '=SUM(A1:A10)',
        result: '500',
        explanation: 'Adds all numeric values in cells A1 through A10.',
      },
      advancedExamples: [
        {
          title: 'Sum across multiple sheets',
          scenario: 'Multi-sheet calculations',
          description: 'Sum the same range across multiple worksheets',
          formula: '=SUM(Sheet1:Sheet3!A1:A10)',
          result: '1500',
          explanation: 'Adds values from A1:A10 across Sheet1, Sheet2, and Sheet3.',
        },
        {
          title: 'Conditional sum with SUMIF',
          scenario: 'Filtered totals',
          description: 'Sum only values that meet a condition',
          formula: '=SUMIF(A1:A10, ">100")',
          result: '350',
          explanation: 'SUMIF adds only values greater than 100.',
        },
      ],
      howItWorks: 'SUM iterates through each cell in the specified range, adds up numeric values, and ignores text, blank cells, and error values.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the sum should appear.' },
        { name: 'Enter formula', text: 'Type =SUM(range).' },
        { name: 'Press Enter', text: 'The result shows the total sum.' },
      ],
      limitations: [
        'SUM ignores text and blank cells.',
        'For conditional summing, use SUMIF or SUMIFS.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Text or error values in the range', fix: 'Check for non-numeric values or use SUMIF to exclude errors.' },
      ],
      googleSheetsEquivalent: {
        description: 'SUM works identically in Google Sheets.',
        formula: '=SUM(A1:A10)',
      },
      faq: [
        { question: 'Can SUM handle negative numbers?', answer: 'Yes, SUM correctly adds positive and negative numbers.' },
        { question: 'Does SUM ignore errors?', answer: 'No, if any cell contains an error, SUM returns that error. Use AGGREGATE or SUMIF to ignore errors.' },
      ],
    },
    MAX: {
      excelVersion: 'All versions',
      description: 'MAX returns the largest value in a range of cells.',
      tldr: 'MAX finds the highest value in a range.',
      syntax: '(number1, [number2], ...)',
      parameters: [
        { name: 'number1', description: 'The first number, cell reference, or range.', required: true },
        { name: 'number2', description: 'Optional additional numbers, cell references, or ranges.', required: false },
      ],
      basicExample: {
        description: 'Find the highest value in a range',
        formula: '=MAX(A1:A10)',
        result: '95',
        explanation: 'Returns the largest number from cells A1 through A10.',
      },
      advancedExamples: [
        {
          title: 'Max with criteria using MAXIFS',
          scenario: 'Conditional maximum',
          description: 'Find the maximum value that meets specific criteria',
          formula: '=MAXIFS(A1:A10, B1:B10, "Region A")',
          result: '88',
          explanation: 'MAXIFS finds the highest value in column A where column B matches "Region A".',
        },
      ],
      howItWorks: 'MAX scans all numeric values in the specified range and returns the largest one, ignoring text, blank cells, and logical values.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =MAX(range).' },
        { name: 'Press Enter', text: 'The result shows the maximum value.' },
      ],
      limitations: [
        'MAX ignores text and blank cells.',
        'For conditional maximums, use MAXIFS.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'No numeric values found', fix: 'Check your data range contains numbers.' },
      ],
      googleSheetsEquivalent: {
        description: 'MAX works identically in Google Sheets.',
        formula: '=MAX(A1:A10)',
      },
      faq: [
        { question: 'Does MAX consider dates?', answer: 'Yes, dates are stored as serial numbers, so MAX can find the latest date.' },
        { question: 'What if all cells are empty?', answer: 'MAX returns 0 if all cells are empty.' },
      ],
    },
    MIN: {
      excelVersion: 'All versions',
      description: 'MIN returns the smallest value in a range of cells.',
      tldr: 'MIN finds the lowest value in a range.',
      syntax: '(number1, [number2], ...)',
      parameters: [
        { name: 'number1', description: 'The first number, cell reference, or range.', required: true },
        { name: 'number2', description: 'Optional additional numbers, cell references, or ranges.', required: false },
      ],
      basicExample: {
        description: 'Find the lowest value in a range',
        formula: '=MIN(A1:A10)',
        result: '25',
        explanation: 'Returns the smallest number from cells A1 through A10.',
      },
      advancedExamples: [
        {
          title: 'Min with criteria using MINIFS',
          scenario: 'Conditional minimum',
          description: 'Find the minimum value that meets specific criteria',
          formula: '=MINIFS(A1:A10, B1:B10, "Region A")',
          result: '32',
          explanation: 'MINIFS finds the lowest value in column A where column B matches "Region A".',
        },
      ],
      howItWorks: 'MIN scans all numeric values in the specified range and returns the smallest one, ignoring text, blank cells, and logical values.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =MIN(range).' },
        { name: 'Press Enter', text: 'The result shows the minimum value.' },
      ],
      limitations: [
        'MIN ignores text and blank cells.',
        'For conditional minimums, use MINIFS.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'No numeric values found', fix: 'Check your data range contains numbers.' },
      ],
      googleSheetsEquivalent: {
        description: 'MIN works identically in Google Sheets.',
        formula: '=MIN(A1:A10)',
      },
      faq: [
        { question: 'Does MIN consider dates?', answer: 'Yes, dates are stored as serial numbers, so MIN can find the earliest date.' },
      ],
    },
    ROUND: {
      excelVersion: 'All versions',
      description: 'ROUND rounds a number to a specified number of decimal places.',
      tldr: 'ROUND rounds numbers to a given number of decimal places, following standard rounding rules.',
      syntax: '(number, num_digits)',
      parameters: [
        { name: 'number', description: 'The number to round.', required: true },
        { name: 'num_digits', description: 'The number of decimal places to round to. Use 0 for whole numbers.', required: true },
      ],
      basicExample: {
        description: 'Round to 2 decimal places',
        formula: '=ROUND(3.14159, 2)',
        result: '3.14',
        explanation: 'Rounds 3.14159 to 2 decimal places, resulting in 3.14.',
      },
      advancedExamples: [
        {
          title: 'Round to nearest 100',
          scenario: 'Financial reporting',
          description: 'Round numbers to the nearest hundred',
          formula: '=ROUND(A1, -2)',
          result: '500',
          explanation: 'Using -2 rounds to the nearest hundred: 456 becomes 500.',
        },
        {
          title: 'Round to whole number',
          scenario: 'Inventory management',
          description: 'Round decimal quantities to whole units',
          formula: '=ROUND(A1, 0)',
          result: '12',
          explanation: 'Rounds 12.6 to 13 and 12.4 to 12.',
        },
      ],
      howItWorks: 'ROUND uses standard mathematical rounding: 0.5 and above rounds up, below 0.5 rounds down. Positive num_digits rounds to decimal places, negative num_digits rounds to tens, hundreds, etc.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the rounded result should appear.' },
        { name: 'Enter formula', text: 'Type =ROUND(number, decimal_places).' },
        { name: 'Press Enter', text: 'The result shows the rounded number.' },
      ],
      limitations: [
        'ROUND always rounds 0.5 up (bankers rounding uses MROUND instead).',
        'For always rounding up, use ROUNDUP; for always rounding down, use ROUNDDOWN.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-numeric arguments', fix: 'Ensure both arguments are numbers.' },
      ],
      googleSheetsEquivalent: {
        description: 'ROUND works identically in Google Sheets.',
        formula: '=ROUND(3.14159, 2)',
      },
      faq: [
        { question: 'What does negative num_digits mean?', answer: 'Negative values round to tens, hundreds, thousands, etc. -1 rounds to nearest 10, -2 to nearest 100.' },
        { question: 'What is bankers rounding?', answer: 'Bankers rounding (MROUND) rounds 0.5 to the nearest even number to reduce bias. Standard ROUND always rounds 0.5 up.' },
      ],
    },
    ROUNDUP: {
      excelVersion: 'All versions',
      description: 'ROUNDUP rounds a number up to a specified number of decimal places, always away from zero.',
      tldr: 'ROUNDUP always rounds numbers up, never down, to the specified decimal places.',
      syntax: '(number, num_digits)',
      parameters: [
        { name: 'number', description: 'The number to round up.', required: true },
        { name: 'num_digits', description: 'The number of decimal places to round to.', required: true },
      ],
      basicExample: {
        description: 'Always round up to 2 decimal places',
        formula: '=ROUNDUP(3.14159, 2)',
        result: '3.15',
        explanation: 'Rounds 3.14159 up to 2 decimal places, resulting in 3.15.',
      },
      advancedExamples: [
        {
          title: 'Round up to nearest whole number',
          scenario: 'Order quantities',
          description: 'Always round up to the next whole unit',
          formula: '=ROUNDUP(A1, 0)',
          result: '13',
          explanation: 'Rounds 12.1, 12.5, and 12.9 all up to 13.',
        },
        {
          title: 'Calculate minimum hours for billing',
          scenario: 'Time tracking',
          description: 'Round up minutes to the nearest quarter hour for billing',
          formula: '=ROUNDUP(A1/15, 0)*15',
          result: '30',
          explanation: 'Converts 22 minutes to 30 minutes (rounded up to nearest 15).',
        },
      ],
      howItWorks: 'ROUNDUP always rounds numbers away from zero, regardless of the decimal value. 1.01 rounded to 0 decimal places becomes 2.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =ROUNDUP(number, decimal_places).' },
        { name: 'Press Enter', text: 'The result shows the rounded-up number.' },
      ],
      limitations: [
        'ROUNDUP always increases the number (or makes it less negative).',
        'Use ROUNDDOWN for the opposite behavior.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-numeric arguments', fix: 'Ensure both arguments are numbers.' },
      ],
      googleSheetsEquivalent: {
        description: 'ROUNDUP works identically in Google Sheets.',
        formula: '=ROUNDUP(3.14159, 2)',
      },
      faq: [
        { question: 'What is the difference between ROUND and ROUNDUP?', answer: 'ROUND follows standard rounding rules (0.5 rounds up), while ROUNDUP always rounds up regardless of the decimal value.' },
      ],
    },
    ROUNDDOWN: {
      excelVersion: 'All versions',
      description: 'ROUNDDOWN rounds a number down to a specified number of decimal places, always toward zero.',
      tldr: 'ROUNDDOWN always rounds numbers down, never up, to the specified decimal places.',
      syntax: '(number, num_digits)',
      parameters: [
        { name: 'number', description: 'The number to round down.', required: true },
        { name: 'num_digits', description: 'The number of decimal places to round to.', required: true },
      ],
      basicExample: {
        description: 'Always round down to 2 decimal places',
        formula: '=ROUNDDOWN(3.14999, 2)',
        result: '3.14',
        explanation: 'Rounds 3.14999 down to 2 decimal places, resulting in 3.14.',
      },
      advancedExamples: [
        {
          title: 'Truncate to whole number',
          scenario: 'Integer conversion',
          description: 'Remove decimal portion without rounding',
          formula: '=ROUNDDOWN(A1, 0)',
          result: '12',
          explanation: '12.9 becomes 12, always truncating decimals.',
        },
        {
          title: 'Round down to nearest 1000',
          scenario: 'Budgeting',
          description: 'Round down to the nearest thousand for budget estimation',
          formula: '=ROUNDDOWN(A1, -3)',
          result: '5000',
          explanation: '5999 becomes 5000 when rounded down to the nearest thousand.',
        },
      ],
      howItWorks: 'ROUNDDOWN always rounds numbers toward zero, effectively truncating decimal values. 1.999 rounded to 0 decimal places becomes 1.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =ROUNDDOWN(number, decimal_places).' },
        { name: 'Press Enter', text: 'The result shows the rounded-down number.' },
      ],
      limitations: [
        'ROUNDDOWN always decreases the number (or makes it more negative).',
        'Use ROUNDUP for the opposite behavior.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-numeric arguments', fix: 'Ensure both arguments are numbers.' },
      ],
      googleSheetsEquivalent: {
        description: 'ROUNDDOWN works identically in Google Sheets.',
        formula: '=ROUNDDOWN(3.14999, 2)',
      },
      faq: [
        { question: 'What is the difference between ROUNDDOWN and INT?', answer: 'INT rounds negative numbers away from zero, while ROUNDDOWN always rounds toward zero. INT(-1.5) = -2, ROUNDDOWN(-1.5, 0) = -1.' },
      ],
    },
    ABS: {
      excelVersion: 'All versions',
      description: 'ABS returns the absolute value of a number, removing the negative sign if present.',
      tldr: 'ABS converts negative numbers to positive, leaving positive numbers unchanged.',
      syntax: '(number)',
      parameters: [
        { name: 'number', description: 'The number for which you want the absolute value.', required: true },
      ],
      basicExample: {
        description: 'Get absolute value of a number',
        formula: '=ABS(-10)',
        result: '10',
        explanation: 'Converts -10 to its absolute value of 10.',
      },
      advancedExamples: [
        {
          title: 'Calculate absolute differences',
          scenario: 'Data analysis',
          description: 'Find the absolute difference between two values',
          formula: '=ABS(A1 - B1)',
          result: '5',
          explanation: 'Returns the positive difference regardless of which value is larger.',
        },
        {
          title: 'Sum absolute values',
          scenario: 'Error calculation',
          description: 'Sum all absolute values in a range',
          formula: '=SUM(ABS(A1:A10))',
          result: '100',
          explanation: 'Converts all values to positive before summing.',
        },
      ],
      howItWorks: 'ABS removes the negative sign from negative numbers, returning their positive equivalent. Positive numbers and zero remain unchanged.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =ABS(number).' },
        { name: 'Press Enter', text: 'The result shows the absolute value.' },
      ],
      limitations: [
        'ABS only works with numeric values.',
        'For array operations, use ABS with array formulas or dynamic arrays.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-numeric argument', fix: 'Ensure the argument is a number.' },
      ],
      googleSheetsEquivalent: {
        description: 'ABS works identically in Google Sheets.',
        formula: '=ABS(-10)',
      },
      faq: [
        { question: 'Does ABS work with arrays?', answer: 'In Excel 365 and Google Sheets, ABS works with arrays natively. In older versions, use array formulas (Ctrl+Shift+Enter).' },
        { question: 'What is ABS of zero?', answer: 'ABS(0) = 0' },
      ],
    },
    SQRT: {
      excelVersion: 'All versions',
      description: 'SQRT returns the square root of a positive number.',
      tldr: 'SQRT calculates the square root of a number.',
      syntax: '(number)',
      parameters: [
        { name: 'number', description: 'The positive number for which you want the square root.', required: true },
      ],
      basicExample: {
        description: 'Calculate square root',
        formula: '=SQRT(16)',
        result: '4',
        explanation: 'Returns the square root of 16, which is 4.',
      },
      advancedExamples: [
        {
          title: 'Calculate standard deviation manually',
          scenario: 'Statistics',
          description: 'Compute sample standard deviation',
          formula: '=SQRT(SUM((A1:A10-AVERAGE(A1:A10))^2)/(COUNTA(A1:A10)-1))',
          result: '15.2',
          explanation: 'Calculates standard deviation using the formula sqrt(variance).',
        },
      ],
      howItWorks: 'SQRT computes the square root by finding a number that, when multiplied by itself, equals the input number.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =SQRT(number).' },
        { name: 'Press Enter', text: 'The result shows the square root.' },
      ],
      limitations: [
        'SQRT returns #NUM! for negative numbers.',
        'For nth roots, use POWER(number, 1/n).',
      ],
      commonErrors: [
        { error: '#NUM!', cause: 'Negative number argument', fix: 'Use ABS to make the number positive first, or check your data.' },
      ],
      googleSheetsEquivalent: {
        description: 'SQRT works identically in Google Sheets.',
        formula: '=SQRT(16)',
      },
      faq: [
        { question: 'How do I calculate cube root?', answer: 'Use POWER(number, 1/3) to calculate cube roots.' },
        { question: 'Can I calculate square root of zero?', answer: 'Yes, SQRT(0) = 0' },
      ],
    },
    POWER: {
      excelVersion: 'All versions',
      description: 'POWER raises a number to the power of another number.',
      tldr: 'POWER calculates number^power, raising a base number to an exponent.',
      syntax: '(number, power)',
      parameters: [
        { name: 'number', description: 'The base number to raise to a power.', required: true },
        { name: 'power', description: 'The exponent to raise the base to.', required: true },
      ],
      basicExample: {
        description: 'Calculate 2 to the power of 3',
        formula: '=POWER(2, 3)',
        result: '8',
        explanation: 'Returns 2 raised to the power of 3, which equals 8.',
      },
      advancedExamples: [
        {
          title: 'Calculate compound interest',
          scenario: 'Finance',
          description: 'Compute future value with compound interest',
          formula: '=POWER(1+A1, B1)*C1',
          result: '$1,628.89',
          explanation: 'Calculates future value using the formula PV*(1+r)^n.',
        },
        {
          title: 'Calculate nth root',
          scenario: 'Mathematics',
          description: 'Find the cube root of a number',
          formula: '=POWER(27, 1/3)',
          result: '3',
          explanation: 'Raises 27 to the 1/3 power to get the cube root.',
        },
      ],
      howItWorks: 'POWER computes number^power by multiplying the base number by itself power times.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =POWER(base, exponent).' },
        { name: 'Press Enter', text: 'The result shows the calculated power.' },
      ],
      limitations: [
        'Negative numbers raised to non-integer powers return #NUM!.',
        'For roots, use fractional exponents like 1/2 for square root.',
      ],
      commonErrors: [
        { error: '#NUM!', cause: 'Negative number raised to non-integer power', fix: 'Use ABS for negative bases or use integer exponents.' },
      ],
      googleSheetsEquivalent: {
        description: 'POWER works identically in Google Sheets.',
        formula: '=POWER(2, 3)',
      },
      faq: [
        { question: 'Is POWER the same as the ^ operator?', answer: 'Yes, =POWER(2, 3) is equivalent to =2^3.' },
        { question: 'Can I use decimal exponents?', answer: 'Yes, POWER(10, 0.5) calculates the square root of 10.' },
      ],
    },
    LEFT: {
      excelVersion: 'All versions',
      description: 'LEFT returns the first character(s) from the beginning of a text string.',
      tldr: 'LEFT extracts a specified number of characters from the left side of a text string.',
      syntax: '(text, [num_chars])',
      parameters: [
        { name: 'text', description: 'The text string from which to extract characters.', required: true },
        { name: 'num_chars', description: 'Optional. The number of characters to extract (default is 1).', required: false },
      ],
      basicExample: {
        description: 'Extract first 3 characters',
        formula: '=LEFT("Hello World", 3)',
        result: 'Hel',
        explanation: 'Extracts the first 3 characters from "Hello World".',
      },
      advancedExamples: [
        {
          title: 'Extract area code from phone number',
          scenario: 'Data cleaning',
          description: 'Get the first 3 digits from a phone number',
          formula: '=LEFT(A1, 3)',
          result: '555',
          explanation: 'Extracts the area code from a phone number like "555-123-4567".',
        },
        {
          title: 'Extract first word',
          scenario: 'Text parsing',
          description: 'Get the first word from a sentence',
          formula: '=LEFT(A1, FIND(" ", A1)-1)',
          result: 'Hello',
          explanation: 'Combines LEFT with FIND to extract text before the first space.',
        },
      ],
      howItWorks: 'LEFT counts from the beginning of the text string and returns the specified number of characters. If num_chars is omitted, it returns just the first character.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =LEFT(text, number_of_characters).' },
        { name: 'Press Enter', text: 'The result shows the extracted text.' },
      ],
      limitations: [
        'LEFT counts each character as 1, including spaces.',
        'Use RIGHT to extract from the end, or MID to extract from the middle.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'num_chars is negative', fix: 'Ensure num_chars is a positive number.' },
      ],
      googleSheetsEquivalent: {
        description: 'LEFT works identically in Google Sheets.',
        formula: '=LEFT("Hello World", 3)',
      },
      faq: [
        { question: 'Does LEFT work with numbers?', answer: 'Yes, numbers are treated as text. Use TEXT to format numbers first if needed.' },
        { question: 'What if num_chars exceeds the text length?', answer: 'LEFT returns the entire text string.' },
      ],
    },
    RIGHT: {
      excelVersion: 'All versions',
      description: 'RIGHT returns the last character(s) from the end of a text string.',
      tldr: 'RIGHT extracts a specified number of characters from the right side of a text string.',
      syntax: '(text, [num_chars])',
      parameters: [
        { name: 'text', description: 'The text string from which to extract characters.', required: true },
        { name: 'num_chars', description: 'Optional. The number of characters to extract (default is 1).', required: false },
      ],
      basicExample: {
        description: 'Extract last 4 characters',
        formula: '=RIGHT("Hello World", 4)',
        result: 'orld',
        explanation: 'Extracts the last 4 characters from "Hello World".',
      },
      advancedExamples: [
        {
          title: 'Extract file extension',
          scenario: 'File management',
          description: 'Get the extension from a filename',
          formula: '=RIGHT(A1, LEN(A1)-FIND(".", A1))',
          result: '.txt',
          explanation: 'Combines RIGHT with LEN and FIND to extract text after the dot.',
        },
        {
          title: 'Extract last name',
          scenario: 'Name parsing',
          description: 'Get the last name from "First Last" format',
          formula: '=RIGHT(A1, LEN(A1)-FIND(" ", A1))',
          result: 'Smith',
          explanation: 'Extracts text after the first space.',
        },
      ],
      howItWorks: 'RIGHT counts from the end of the text string and returns the specified number of characters. If num_chars is omitted, it returns just the last character.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =RIGHT(text, number_of_characters).' },
        { name: 'Press Enter', text: 'The result shows the extracted text.' },
      ],
      limitations: [
        'RIGHT counts each character as 1, including spaces.',
        'Use LEFT to extract from the beginning, or MID to extract from the middle.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'num_chars is negative', fix: 'Ensure num_chars is a positive number.' },
      ],
      googleSheetsEquivalent: {
        description: 'RIGHT works identically in Google Sheets.',
        formula: '=RIGHT("Hello World", 4)',
      },
      faq: [
        { question: 'Does RIGHT work with numbers?', answer: 'Yes, numbers are treated as text.' },
        { question: 'What if num_chars exceeds the text length?', answer: 'RIGHT returns the entire text string.' },
      ],
    },
    MID: {
      excelVersion: 'All versions',
      description: 'MID returns a specific number of characters from a text string starting at a specified position.',
      tldr: 'MID extracts characters from the middle of a text string at a specified starting position.',
      syntax: '(text, start_num, num_chars)',
      parameters: [
        { name: 'text', description: 'The text string from which to extract characters.', required: true },
        { name: 'start_num', description: 'The starting position of the extraction (1-based).', required: true },
        { name: 'num_chars', description: 'The number of characters to extract.', required: true },
      ],
      basicExample: {
        description: 'Extract 5 characters starting at position 7',
        formula: '=MID("Hello World", 7, 5)',
        result: 'World',
        explanation: 'Extracts 5 characters starting from position 7 in "Hello World".',
      },
      advancedExamples: [
        {
          title: 'Extract middle initial from name',
          scenario: 'Name parsing',
          description: 'Get the middle initial from "John D. Smith"',
          formula: '=MID(A1, FIND(" ", A1)+1, 1)',
          result: 'D',
          explanation: 'Finds the first space, then extracts one character after it.',
        },
        {
          title: 'Extract substring between two delimiters',
          scenario: 'Data extraction',
          description: 'Get text between two dashes',
          formula: '=MID(A1, FIND("-", A1)+1, FIND("-", A1, FIND("-", A1)+1)-FIND("-", A1)-1)',
          result: 'middle',
          explanation: 'Extracts text between the first and second dash.',
        },
      ],
      howItWorks: 'MID starts at the specified position (1-based) and extracts the specified number of characters. Position 1 is the first character.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =MID(text, start_position, number_of_characters).' },
        { name: 'Press Enter', text: 'The result shows the extracted text.' },
      ],
      limitations: [
        'start_num must be at least 1.',
        'If start_num + num_chars exceeds the text length, MID returns as many characters as available.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'start_num is less than 1', fix: 'Ensure start_num is at least 1.' },
      ],
      googleSheetsEquivalent: {
        description: 'MID works identically in Google Sheets.',
        formula: '=MID("Hello World", 7, 5)',
      },
      faq: [
        { question: 'Is MID position 0-based or 1-based?', answer: 'MID is 1-based — the first character is position 1.' },
        { question: 'Can MID extract to the end of the string?', answer: 'Yes, use a large num_chars value or calculate it with LEN.' },
      ],
    },
    LEN: {
      excelVersion: 'All versions',
      description: 'LEN returns the number of characters in a text string.',
      tldr: 'LEN counts the number of characters in a text string.',
      syntax: '(text)',
      parameters: [
        { name: 'text', description: 'The text string whose length you want to find.', required: true },
      ],
      basicExample: {
        description: 'Count characters in a string',
        formula: '=LEN("Hello")',
        result: '5',
        explanation: 'Returns the number of characters in "Hello".',
      },
      advancedExamples: [
        {
          title: 'Check password length',
          scenario: 'Validation',
          description: 'Verify if a password meets minimum length requirements',
          formula: '=IF(LEN(A1)>=8, "Strong", "Too short")',
          result: 'Strong',
          explanation: 'Checks if the password has at least 8 characters.',
        },
        {
          title: 'Count characters excluding spaces',
          scenario: 'Text analysis',
          description: 'Count characters in a string without spaces',
          formula: '=LEN(SUBSTITUTE(A1, " ", ""))',
          result: '10',
          explanation: 'Removes all spaces before counting characters.',
        },
      ],
      howItWorks: 'LEN counts every character in the text string, including spaces, punctuation, and special characters.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =LEN(text).' },
        { name: 'Press Enter', text: 'The result shows the character count.' },
      ],
      limitations: [
        'LEN counts each character as 1, including spaces and special characters.',
        'For double-byte languages (like Chinese), use LENB instead.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Invalid argument', fix: 'Ensure the argument is text or a cell reference.' },
      ],
      googleSheetsEquivalent: {
        description: 'LEN works identically in Google Sheets.',
        formula: '=LEN("Hello")',
      },
      faq: [
        { question: 'Does LEN count spaces?', answer: 'Yes, LEN counts every character including spaces.' },
        { question: 'What is the difference between LEN and LENB?', answer: 'LEN counts characters, LENB counts bytes. For double-byte characters, LENB counts 2 bytes per character.' },
      ],
    },
    CONCAT: {
      excelVersion: 'Excel 2019 and later',
      description: 'CONCAT joins two or more text strings into one string.',
      tldr: 'CONCAT combines multiple text strings into a single string.',
      syntax: '(text1, [text2], ...)',
      parameters: [
        { name: 'text1', description: 'The first text string to concatenate.', required: true },
        { name: 'text2', description: 'Optional additional text strings to concatenate.', required: false },
      ],
      basicExample: {
        description: 'Combine first and last name',
        formula: '=CONCAT("John ", "Smith")',
        result: 'John Smith',
        explanation: 'Combines "John " and "Smith" into "John Smith".',
      },
      advancedExamples: [
        {
          title: 'Create email from name',
          scenario: 'Email generation',
          description: 'Combine first and last name to create an email address',
          formula: '=CONCAT(LOWER(A1), ".", LOWER(B1), "@company.com")',
          result: 'john.smith@company.com',
          explanation: 'Creates a standardized email from first and last name.',
        },
        {
          title: 'Concatenate with array',
          scenario: 'Dynamic arrays',
          description: 'Combine values from a range into one string',
          formula: '=CONCAT(A1:A5)',
          result: 'ABCDE',
          explanation: 'In Excel 365, CONCAT automatically handles arrays.',
        },
      ],
      howItWorks: 'CONCAT joins text strings in the order they are provided, without any separator. For adding separators, use TEXTJOIN instead.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =CONCAT(text1, text2, ...).' },
        { name: 'Press Enter', text: 'The result shows the combined text.' },
      ],
      limitations: [
        'CONCAT has no built-in separator.',
        'For older Excel versions, use CONCATENATE or the & operator.',
      ],
      commonErrors: [
        { error: '#NAME?', cause: 'Function not supported in Excel version', fix: 'Use CONCATENATE or & operator instead.' },
      ],
      googleSheetsEquivalent: {
        description: 'CONCAT works identically in Google Sheets.',
        formula: '=CONCAT("John ", "Smith")',
      },
      faq: [
        { question: 'What is the difference between CONCAT and CONCATENATE?', answer: 'CONCAT is newer and supports ranges, while CONCATENATE only supports individual arguments.' },
        { question: 'Can I use CONCAT with numbers?', answer: 'Yes, numbers are automatically converted to text.' },
      ],
    },
    TRIM: {
      excelVersion: 'All versions',
      description: 'TRIM removes extra spaces from text, leaving only single spaces between words.',
      tldr: 'TRIM cleans up text by removing leading, trailing, and extra spaces between words.',
      syntax: '(text)',
      parameters: [
        { name: 'text', description: 'The text string to trim.', required: true },
      ],
      basicExample: {
        description: 'Remove extra spaces from text',
        formula: '=TRIM("   Hello   World   ")',
        result: 'Hello World',
        explanation: 'Removes leading and trailing spaces, leaving single spaces between words.',
      },
      advancedExamples: [
        {
          title: 'Clean imported data',
          scenario: 'Data cleaning',
          description: 'Trim whitespace from imported CSV data',
          formula: '=TRIM(A1)',
          result: 'Clean text',
          explanation: 'Removes unwanted spaces from data imported from external sources.',
        },
        {
          title: 'Trim and uppercase for consistent lookups',
          scenario: 'Data matching',
          description: 'Prepare text for VLOOKUP by trimming and uppercasing',
          formula: '=UPPER(TRIM(A1))',
          result: 'HELLO WORLD',
          explanation: 'Ensures consistent text formatting for reliable lookups.',
        },
      ],
      howItWorks: 'TRIM removes all spaces from the text except for single spaces between words. It removes leading, trailing, and consecutive internal spaces.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =TRIM(text).' },
        { name: 'Press Enter', text: 'The result shows the cleaned text.' },
      ],
      limitations: [
        'TRIM only removes regular spaces (ASCII 32).',
        'For non-breaking spaces (CHAR(160)), use SUBSTITUTE to replace them first.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Invalid argument', fix: 'Ensure the argument is text or a cell reference.' },
      ],
      googleSheetsEquivalent: {
        description: 'TRIM works identically in Google Sheets.',
        formula: '=TRIM("   Hello   World   ")',
      },
      faq: [
        { question: 'Does TRIM remove non-breaking spaces?', answer: 'No, use =TRIM(SUBSTITUTE(A1, CHAR(160), " ")) to remove non-breaking spaces.' },
        { question: 'Can I trim numbers?', answer: 'Yes, numbers are converted to text and trimmed.' },
      ],
    },
    SUBSTITUTE: {
      excelVersion: 'All versions',
      description: 'SUBSTITUTE replaces one text string with another in a text string.',
      tldr: 'SUBSTITUTE replaces specific text within a string with new text.',
      syntax: '(text, old_text, new_text, [instance_num])',
      parameters: [
        { name: 'text', description: 'The text string in which to substitute characters.', required: true },
        { name: 'old_text', description: 'The text to find and replace.', required: true },
        { name: 'new_text', description: 'The text to replace old_text with.', required: true },
        { name: 'instance_num', description: 'Optional. Which occurrence of old_text to replace.', required: false },
      ],
      basicExample: {
        description: 'Replace all occurrences',
        formula: '=SUBSTITUTE("apple, apple, banana", "apple", "orange")',
        result: 'orange, orange, banana',
        explanation: 'Replaces all instances of "apple" with "orange".',
      },
      advancedExamples: [
        {
          title: 'Replace only the first occurrence',
          scenario: 'Selective replacement',
          description: 'Replace just the first instance of text',
          formula: '=SUBSTITUTE("apple, apple, banana", "apple", "orange", 1)',
          result: 'orange, apple, banana',
          explanation: 'Replaces only the first "apple" with "orange".',
        },
        {
          title: 'Remove all spaces',
          scenario: 'Text cleaning',
          description: 'Delete all spaces from a text string',
          formula: '=SUBSTITUTE(A1, " ", "")',
          result: 'helloworld',
          explanation: 'Replaces every space with nothing, effectively removing them.',
        },
      ],
      howItWorks: 'SUBSTITUTE searches for old_text in the text string and replaces it with new_text. If instance_num is specified, only that occurrence is replaced.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =SUBSTITUTE(text, find_text, replace_text).' },
        { name: 'Press Enter', text: 'The result shows the modified text.' },
      ],
      limitations: [
        'SUBSTITUTE is case-sensitive.',
        'For case-insensitive replacement, use UPPER/LOWER with SUBSTITUTE, or use REPLACE for position-based replacement.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Invalid arguments', fix: 'Ensure all required arguments are provided.' },
      ],
      googleSheetsEquivalent: {
        description: 'SUBSTITUTE works identically in Google Sheets.',
        formula: '=SUBSTITUTE("apple, apple, banana", "apple", "orange")',
      },
      faq: [
        { question: 'Is SUBSTITUTE case-sensitive?', answer: 'Yes, "Apple" and "apple" are treated as different.' },
        { question: 'What is the difference between SUBSTITUTE and REPLACE?', answer: 'SUBSTITUTE replaces text by content; REPLACE replaces text by position.' },
      ],
    },
    TODAY: {
      excelVersion: 'All versions',
      description: 'TODAY returns the current date, updated each time the worksheet recalculates.',
      tldr: 'TODAY displays today\'s date, updating automatically when the workbook opens or recalculates.',
      syntax: '()',
      parameters: [],
      basicExample: {
        description: 'Get today\'s date',
        formula: '=TODAY()',
        result: '7/7/2026',
        explanation: 'Returns the current date as a serial number formatted as a date.',
      },
      advancedExamples: [
        {
          title: 'Calculate days until deadline',
          scenario: 'Project management',
          description: 'Find how many days remain until a deadline',
          formula: '=A1 - TODAY()',
          result: '15',
          explanation: 'Subtracts today\'s date from the deadline date in cell A1.',
        },
        {
          title: 'Calculate age from birthdate',
          scenario: 'Personal information',
          description: 'Compute someone\'s age from their birthdate',
          formula: '=DATEDIF(A1, TODAY(), "Y")',
          result: '30',
          explanation: 'DATEDIF calculates the difference in years between birthdate and today.',
        },
      ],
      howItWorks: 'TODAY returns the current date as a serial number (Excel date format). It updates automatically whenever the workbook is opened or recalculated.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the date should appear.' },
        { name: 'Enter formula', text: 'Type =TODAY().' },
        { name: 'Press Enter', text: 'The result shows today\'s date.' },
      ],
      limitations: [
        'TODAY returns only the date, not the time.',
        'For date and time, use NOW() instead.',
      ],
      commonErrors: [],
      googleSheetsEquivalent: {
        description: 'TODAY works identically in Google Sheets.',
        formula: '=TODAY()',
      },
      faq: [
        { question: 'Does TODAY update automatically?', answer: 'Yes, TODAY updates whenever the worksheet recalculates or when you open the workbook.' },
        { question: 'Can I use TODAY in conditional formatting?', answer: 'Yes, TODAY() is commonly used in conditional formatting rules.' },
      ],
    },
    NOW: {
      excelVersion: 'All versions',
      description: 'NOW returns the current date and time, updated each time the worksheet recalculates.',
      tldr: 'NOW displays the current date and time, updating automatically.',
      syntax: '()',
      parameters: [],
      basicExample: {
        description: 'Get current date and time',
        formula: '=NOW()',
        result: '7/7/2026 14:30',
        explanation: 'Returns the current date and time as a serial number.',
      },
      advancedExamples: [
        {
          title: 'Calculate hours since an event',
          scenario: 'Time tracking',
          description: 'Find how many hours have passed since a specific time',
          formula: '=(NOW()-A1)*24',
          result: '2.5',
          explanation: 'Subtracts the event time from now and multiplies by 24 to get hours.',
        },
      ],
      howItWorks: 'NOW returns the current date and time as a serial number, where the integer part is the date and the decimal part is the time.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the result should appear.' },
        { name: 'Enter formula', text: 'Type =NOW().' },
        { name: 'Press Enter', text: 'The result shows current date and time.' },
      ],
      limitations: [
        'NOW includes both date and time.',
        'For date only, use TODAY() instead.',
      ],
      commonErrors: [],
      googleSheetsEquivalent: {
        description: 'NOW works identically in Google Sheets.',
        formula: '=NOW()',
      },
      faq: [
        { question: 'Does NOW update in real-time?', answer: 'NOW updates when the worksheet recalculates, not continuously.' },
        { question: 'How do I format NOW to show only time?', answer: 'Apply a time-only number format to the cell.' },
      ],
    },
    YEAR: {
      excelVersion: 'All versions',
      description: 'YEAR extracts the year from a date.',
      tldr: 'YEAR returns the year component of a date.',
      syntax: '(serial_number)',
      parameters: [
        { name: 'serial_number', description: 'The date from which to extract the year.', required: true },
      ],
      basicExample: {
        description: 'Extract year from date',
        formula: '=YEAR("1/15/2026")',
        result: '2026',
        explanation: 'Returns the year from the date "1/15/2026".',
      },
      advancedExamples: [
        {
          title: 'Group data by year',
          scenario: 'Data analysis',
          description: 'Extract years for grouping in pivot tables',
          formula: '=YEAR(A1)',
          result: '2026',
          explanation: 'Converts dates to years for easier grouping.',
        },
      ],
      howItWorks: 'YEAR extracts the year from a date serial number. Dates in Excel are stored as serial numbers where January 1, 1900 is day 1.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the year should appear.' },
        { name: 'Enter formula', text: 'Type =YEAR(date).' },
        { name: 'Press Enter', text: 'The result shows the year.' },
      ],
      limitations: [
        'YEAR only returns the year.',
        'For month or day, use MONTH or DAY functions.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-date argument', fix: 'Ensure the argument is a valid date.' },
      ],
      googleSheetsEquivalent: {
        description: 'YEAR works identically in Google Sheets.',
        formula: '=YEAR("1/15/2026")',
      },
      faq: [
        { question: 'What year does Excel start from?', answer: 'Excel uses the 1900 date system, starting from January 1, 1900.' },
        { question: 'Can YEAR handle dates before 1900?', answer: 'No, Excel cannot handle dates before January 1, 1900.' },
      ],
    },
    MONTH: {
      excelVersion: 'All versions',
      description: 'MONTH extracts the month from a date.',
      tldr: 'MONTH returns the month (1-12) from a date.',
      syntax: '(serial_number)',
      parameters: [
        { name: 'serial_number', description: 'The date from which to extract the month.', required: true },
      ],
      basicExample: {
        description: 'Extract month from date',
        formula: '=MONTH("7/4/2026")',
        result: '7',
        explanation: 'Returns 7 for July from the date "7/4/2026".',
      },
      advancedExamples: [
        {
          title: 'Get month name',
          scenario: 'Formatting',
          description: 'Convert month number to month name',
          formula: '=TEXT(A1, "mmmm")',
          result: 'July',
          explanation: 'Uses TEXT function to format the month as a name.',
        },
      ],
      howItWorks: 'MONTH extracts the month (1-12) from a date serial number.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the month should appear.' },
        { name: 'Enter formula', text: 'Type =MONTH(date).' },
        { name: 'Press Enter', text: 'The result shows the month number (1-12).' },
      ],
      limitations: [
        'MONTH returns 1-12, not the month name.',
        'For month names, use TEXT(date, "mmmm").',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-date argument', fix: 'Ensure the argument is a valid date.' },
      ],
      googleSheetsEquivalent: {
        description: 'MONTH works identically in Google Sheets.',
        formula: '=MONTH("7/4/2026")',
      },
      faq: [
        { question: 'Does MONTH return 0-based or 1-based?', answer: 'MONTH is 1-based: January=1, December=12.' },
      ],
    },
    DAY: {
      excelVersion: 'All versions',
      description: 'DAY extracts the day of the month from a date.',
      tldr: 'DAY returns the day number (1-31) from a date.',
      syntax: '(serial_number)',
      parameters: [
        { name: 'serial_number', description: 'The date from which to extract the day.', required: true },
      ],
      basicExample: {
        description: 'Extract day from date',
        formula: '=DAY("7/4/2026")',
        result: '4',
        explanation: 'Returns 4 from the date "7/4/2026".',
      },
      advancedExamples: [
        {
          title: 'Find day of week',
          scenario: 'Date analysis',
          description: 'Determine which day of the week a date falls on',
          formula: '=WEEKDAY(A1, 1)',
          result: '3',
          explanation: 'WEEKDAY returns 1 for Sunday, 7 for Saturday.',
        },
      ],
      howItWorks: 'DAY extracts the day of the month (1-31) from a date serial number.',
      howToSteps: [
        { name: 'Select output cell', text: 'Choose where the day should appear.' },
        { name: 'Enter formula', text: 'Type =DAY(date).' },
        { name: 'Press Enter', text: 'The result shows the day number (1-31).' },
      ],
      limitations: [
        'DAY only returns the day of the month.',
        'For day of week, use WEEKDAY.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-date argument', fix: 'Ensure the argument is a valid date.' },
      ],
      googleSheetsEquivalent: {
        description: 'DAY works identically in Google Sheets.',
        formula: '=DAY("7/4/2026")',
      },
      faq: [
        { question: 'Does DAY return the day of the week?', answer: 'No, DAY returns the day of the month. Use WEEKDAY for day of week.' },
      ],
    },
    IF: {
      excelVersion: 'All versions',
      description: 'IF performs a logical test and returns one value if true and another if false.',
      tldr: 'IF checks a condition and returns different values based on whether it is true or false.',
      syntax: '(logical_test, value_if_true, [value_if_false])',
      parameters: [
        { name: 'logical_test', description: 'The condition to test (must evaluate to TRUE or FALSE).', required: true },
        { name: 'value_if_true', description: 'The value to return if the condition is TRUE.', required: true },
        { name: 'value_if_false', description: 'Optional. The value to return if the condition is FALSE.', required: false },
      ],
      basicExample: {
        description: 'Simple conditional check',
        formula: '=IF(A1>100, "Over budget", "Within budget")',
        result: 'Over budget',
        explanation: 'Returns "Over budget" if A1 > 100, otherwise "Within budget".',
      },
      advancedExamples: [
        {
          title: 'Nested IF statements',
          scenario: 'Multiple conditions',
          description: 'Handle multiple conditions with nested IFs',
          formula: '=IF(A1>=90, "A", IF(A1>=80, "B", IF(A1>=70, "C", "F")))',
          result: 'B',
          explanation: 'Assigns letter grades based on score ranges.',
        },
        {
          title: 'IF with AND/OR',
          scenario: 'Multiple criteria',
          description: 'Combine multiple conditions',
          formula: '=IF(AND(A1>0, B1>0), "Both positive", "At least one negative")',
          result: 'Both positive',
          explanation: 'Checks if both values are positive using AND.',
        },
      ],
      howItWorks: 'IF evaluates the logical test. If TRUE, it returns value_if_true; if FALSE, it returns value_if_false (or FALSE if omitted).',
      howToSteps: [
        { name: 'Define condition', text: 'Determine the logical test you want to perform.' },
        { name: 'Set true result', text: 'Decide what to return if the condition is TRUE.' },
        { name: 'Set false result', text: 'Decide what to return if the condition is FALSE.' },
        { name: 'Enter formula', text: 'Type =IF(condition, true_value, false_value).' },
      ],
      limitations: [
        'Nested IFs can become hard to read beyond 3-4 levels.',
        'For multiple conditions, consider using IFS function instead.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Logical test does not evaluate to TRUE/FALSE', fix: 'Check your condition returns a boolean value.' },
      ],
      googleSheetsEquivalent: {
        description: 'IF works identically in Google Sheets.',
        formula: '=IF(A1>100, "Over budget", "Within budget")',
      },
      faq: [
        { question: 'Can IF return formulas?', answer: 'Yes, IF can return any value including formulas.' },
        { question: 'What happens if value_if_false is omitted?', answer: 'IF returns FALSE when the condition is FALSE and value_if_false is omitted.' },
      ],
    },
    AND: {
      excelVersion: 'All versions',
      description: 'AND returns TRUE if all arguments are TRUE, and FALSE if any argument is FALSE.',
      tldr: 'AND checks if ALL conditions are TRUE.',
      syntax: '(logical1, [logical2], ...)',
      parameters: [
        { name: 'logical1', description: 'The first condition to test.', required: true },
        { name: 'logical2', description: 'Optional additional conditions to test.', required: false },
      ],
      basicExample: {
        description: 'Check multiple conditions',
        formula: '=AND(A1>0, B1>0)',
        result: 'TRUE',
        explanation: 'Returns TRUE only if both A1 > 0 and B1 > 0.',
      },
      advancedExamples: [
        {
          title: 'AND with IF',
          scenario: 'Combined logic',
          description: 'Use AND within IF for multiple criteria',
          formula: '=IF(AND(A1>=18, B1="Yes"), "Eligible", "Not eligible")',
          result: 'Eligible',
          explanation: 'Checks two conditions before returning a result.',
        },
      ],
      howItWorks: 'AND evaluates all conditions and returns TRUE only when every condition is TRUE.',
      howToSteps: [
        { name: 'Define conditions', text: 'Determine all conditions that must be true.' },
        { name: 'Enter formula', text: 'Type =AND(condition1, condition2, ...).' },
        { name: 'Press Enter', text: 'The result is TRUE or FALSE.' },
      ],
      limitations: [
        'All conditions must be TRUE for AND to return TRUE.',
        'For ANY condition being TRUE, use OR instead.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-boolean arguments', fix: 'Ensure all arguments evaluate to TRUE/FALSE.' },
      ],
      googleSheetsEquivalent: {
        description: 'AND works identically in Google Sheets.',
        formula: '=AND(A1>0, B1>0)',
      },
      faq: [
        { question: 'How many conditions can AND handle?', answer: 'AND can handle up to 255 conditions in Excel.' },
        { question: 'What if I have no conditions?', answer: 'AND with no arguments returns TRUE.' },
      ],
    },
    OR: {
      excelVersion: 'All versions',
      description: 'OR returns TRUE if any argument is TRUE, and FALSE if all arguments are FALSE.',
      tldr: 'OR checks if ANY condition is TRUE.',
      syntax: '(logical1, [logical2], ...)',
      parameters: [
        { name: 'logical1', description: 'The first condition to test.', required: true },
        { name: 'logical2', description: 'Optional additional conditions to test.', required: false },
      ],
      basicExample: {
        description: 'Check if any condition is true',
        formula: '=OR(A1>100, B1>100)',
        result: 'TRUE',
        explanation: 'Returns TRUE if either A1 > 100 or B1 > 100.',
      },
      advancedExamples: [
        {
          title: 'OR with IF',
          scenario: 'Combined logic',
          description: 'Use OR within IF for alternative criteria',
          formula: '=IF(OR(A1="Manager", A1="Director"), "Executive", "Staff")',
          result: 'Executive',
          explanation: 'Returns "Executive" if either condition is met.',
        },
      ],
      howItWorks: 'OR evaluates all conditions and returns TRUE if at least one condition is TRUE.',
      howToSteps: [
        { name: 'Define conditions', text: 'Determine conditions where any being true is sufficient.' },
        { name: 'Enter formula', text: 'Type =OR(condition1, condition2, ...).' },
        { name: 'Press Enter', text: 'The result is TRUE or FALSE.' },
      ],
      limitations: [
        'Only one condition needs to be TRUE for OR to return TRUE.',
        'For ALL conditions to be TRUE, use AND instead.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-boolean arguments', fix: 'Ensure all arguments evaluate to TRUE/FALSE.' },
      ],
      googleSheetsEquivalent: {
        description: 'OR works identically in Google Sheets.',
        formula: '=OR(A1>100, B1>100)',
      },
      faq: [
        { question: 'How many conditions can OR handle?', answer: 'OR can handle up to 255 conditions in Excel.' },
        { question: 'What if I have no conditions?', answer: 'OR with no arguments returns FALSE.' },
      ],
    },
    NOT: {
      excelVersion: 'All versions',
      description: 'NOT reverses the logic of its argument.',
      tldr: 'NOT flips TRUE to FALSE and FALSE to TRUE.',
      syntax: '(logical)',
      parameters: [
        { name: 'logical', description: 'The condition to reverse.', required: true },
      ],
      basicExample: {
        description: 'Reverse a condition',
        formula: '=NOT(A1>100)',
        result: 'FALSE',
        explanation: 'Returns FALSE when A1 > 100 is TRUE, and vice versa.',
      },
      advancedExamples: [
        {
          title: 'NOT with AND',
          scenario: 'Complex logic',
          description: 'Check that NOT all conditions are true',
          formula: '=NOT(AND(A1>0, B1>0))',
          result: 'TRUE',
          explanation: 'Returns TRUE when at least one value is not positive.',
        },
      ],
      howItWorks: 'NOT simply reverses the boolean value of its argument.',
      howToSteps: [
        { name: 'Define condition', text: 'Determine the condition to reverse.' },
        { name: 'Enter formula', text: 'Type =NOT(condition).' },
        { name: 'Press Enter', text: 'The result is the opposite of the condition.' },
      ],
      limitations: [
        'NOT only takes one argument.',
        'For negating multiple conditions, use NOT with AND/OR.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Non-boolean argument', fix: 'Ensure the argument evaluates to TRUE/FALSE.' },
      ],
      googleSheetsEquivalent: {
        description: 'NOT works identically in Google Sheets.',
        formula: '=NOT(A1>100)',
      },
      faq: [
        { question: 'Can NOT be used with arrays?', answer: 'Yes, in Excel 365 and Google Sheets, NOT works with arrays.' },
      ],
    },
    IFERROR: {
      excelVersion: 'Excel 2007 and later',
      description: 'IFERROR returns a custom result when a formula generates an error, and the formula result otherwise.',
      tldr: 'IFERROR catches errors and returns a custom value instead.',
      syntax: '(value, value_if_error)',
      parameters: [
        { name: 'value', description: 'The formula to check for errors.', required: true },
        { name: 'value_if_error', description: 'The value to return if the formula results in an error.', required: true },
      ],
      basicExample: {
        description: 'Handle division by zero',
        formula: '=IFERROR(A1/B1, "Cannot divide by zero")',
        result: 'Cannot divide by zero',
        explanation: 'Returns "Cannot divide by zero" when B1 is 0.',
      },
      advancedExamples: [
        {
          title: 'Handle VLOOKUP errors',
          scenario: 'Lookup with fallback',
          description: 'Show friendly message when VLOOKUP fails',
          formula: '=IFERROR(VLOOKUP(A1, B:C, 2, FALSE), "Not found")',
          result: 'Not found',
          explanation: 'Returns "Not found" when VLOOKUP returns #N/A.',
        },
      ],
      howItWorks: 'IFERROR evaluates the first argument. If it results in any error (#N/A, #VALUE!, #REF!, etc.), it returns the second argument.',
      howToSteps: [
        { name: 'Enter formula', text: 'Type your formula normally.' },
        { name: 'Wrap with IFERROR', text: 'Wrap it with IFERROR and provide a fallback value.' },
        { name: 'Press Enter', text: 'The result shows the formula output or fallback.' },
      ],
      limitations: [
        'IFERROR catches ALL errors.',
        'For catching only #N/A errors, use IFNA instead.',
      ],
      commonErrors: [
        { error: '#VALUE!', cause: 'Missing arguments', fix: 'Ensure both arguments are provided.' },
      ],
      googleSheetsEquivalent: {
        description: 'IFERROR works identically in Google Sheets.',
        formula: '=IFERROR(A1/B1, "Error")',
      },
      faq: [
        { question: 'What errors does IFERROR catch?', answer: 'IFERROR catches #N/A, #VALUE!, #REF!, #DIV/0!, #NUM!, #NAME?, #NULL!.' },
        { question: 'What is the difference between IFERROR and IFNA?', answer: 'IFERROR catches all errors; IFNA only catches #N/A errors.' },
      ],
    },
    INDEX: {
      excelVersion: 'All versions',
      description: 'INDEX returns the value at a specified position in a range or array.',
      tldr: 'INDEX retrieves a value from a specific row and column in a range.',
      syntax: '(array, row_num, [column_num])',
      parameters: [
        { name: 'array', description: 'The range or array from which to retrieve the value.', required: true },
        { name: 'row_num', description: 'The row number from which to retrieve the value.', required: true },
        { name: 'column_num', description: 'Optional. The column number from which to retrieve the value.', required: false },
      ],
      basicExample: {
        description: 'Get value from specific position',
        formula: '=INDEX(A1:C5, 3, 2)',
        result: 'Value at row 3, column 2',
        explanation: 'Returns the value from the 3rd row and 2nd column of the range.',
      },
      advancedExamples: [
        {
          title: 'INDEX with MATCH for flexible lookup',
          scenario: 'Advanced lookup',
          description: 'Create a lookup that can search left',
          formula: '=INDEX(B:B, MATCH(A1, C:C, 0))',
          result: 'Lookup result',
          explanation: 'Combines INDEX and MATCH for powerful two-way lookups.',
        },
      ],
      howItWorks: 'INDEX finds the value at the intersection of the specified row and column in the range.',
      howToSteps: [
        { name: 'Select range', text: 'Define the range containing your data.' },
        { name: 'Specify row', text: 'Choose the row number to retrieve from.' },
        { name: 'Specify column', text: 'Choose the column number (optional for single-column ranges).' },
        { name: 'Enter formula', text: 'Type =INDEX(range, row, column).' },
      ],
      limitations: [
        'Row and column numbers must be within the range.',
        'For dynamic arrays, INDEX can return multiple values.',
      ],
      commonErrors: [
        { error: '#REF!', cause: 'Row/column number exceeds range size', fix: 'Check your row and column numbers.' },
      ],
      googleSheetsEquivalent: {
        description: 'INDEX works identically in Google Sheets.',
        formula: '=INDEX(A1:C5, 3, 2)',
      },
      faq: [
        { question: 'Can INDEX return an entire row or column?', answer: 'Yes, omit row_num or column_num to return an entire column or row.' },
        { question: 'What is INDEX/MATCH?', answer: 'INDEX/MATCH is a powerful combination that can look up values in any direction, unlike VLOOKUP.' },
      ],
    },
    MATCH: {
      excelVersion: 'All versions',
      description: 'MATCH searches for a specified item in a range and returns its relative position.',
      tldr: 'MATCH finds the position of a value in a range.',
      syntax: '(lookup_value, lookup_array, [match_type])',
      parameters: [
        { name: 'lookup_value', description: 'The value to search for.', required: true },
        { name: 'lookup_array', description: 'The range to search within.', required: true },
        { name: 'match_type', description: 'Optional. 1=approximate (sorted), 0=exact, -1=approximate (descending).', required: false },
      ],
      basicExample: {
        description: 'Find position of a value',
        formula: '=MATCH("Apple", A1:A5, 0)',
        result: '3',
        explanation: 'Returns the position (3) where "Apple" is found in the range.',
      },
      advancedExamples: [
        {
          title: 'MATCH with INDEX for two-way lookup',
          scenario: 'Advanced lookup',
          description: 'Combine MATCH with INDEX for flexible lookups',
          formula: '=INDEX(B:B, MATCH(A1, C:C, 0))',
          result: 'Lookup result',
          explanation: 'MATCH finds the row position, INDEX retrieves the value.',
        },
      ],
      howItWorks: 'MATCH scans the lookup_array for the lookup_value and returns its relative position (1-based).',
      howToSteps: [
        { name: 'Define value', text: 'Determine the value to search for.' },
        { name: 'Select range', text: 'Choose the range to search within.' },
        { name: 'Choose match type', text: 'Use 0 for exact match (most common).' },
        { name: 'Enter formula', text: 'Type =MATCH(value, range, match_type).' },
      ],
      limitations: [
        'MATCH returns position, not the actual value.',
        'For returning the value, combine with INDEX.',
      ],
      commonErrors: [
        { error: '#N/A', cause: 'Value not found in range', fix: 'Check that the value exists in the lookup range.' },
      ],
      googleSheetsEquivalent: {
        description: 'MATCH works identically in Google Sheets.',
        formula: '=MATCH("Apple", A1:A5, 0)',
      },
      faq: [
        { question: 'Is MATCH case-sensitive?', answer: 'No, MATCH is not case-sensitive by default.' },
        { question: 'Can MATCH search horizontally?', answer: 'Yes, MATCH works with horizontal ranges as well.' },
      ],
    },
  };

  const template = functionTemplates[name];
  
  if (template) {
    return {
      name,
      slug,
      category,
      excelVersion: template.excelVersion || 'All versions',
      description: template.description || `${name} is a function in Excel.`,
      tldr: template.tldr || `${name} function.`,
      syntax: template.syntax || `(${name.toLowerCase()})`,
      parameters: template.parameters || [],
      basicExample: template.basicExample || {
        description: `Basic usage of ${name}`,
        formula: `=${name}(A1)`,
        result: 'Result',
        explanation: `Basic example of ${name} function.`,
      },
      advancedExamples: template.advancedExamples || [],
      howItWorks: template.howItWorks || `${name} works by processing input values.`,
      howToSteps: template.howToSteps || [],
      limitations: template.limitations || [],
      commonErrors: template.commonErrors || [],
      googleSheetsEquivalent: template.googleSheetsEquivalent || {
        description: `${name} works identically in Google Sheets.`,
        formula: `=${name}(A1)`,
      },
      faq: template.faq || [],
      relatedFunctions: template.relatedFunctions || [],
    };
  }

  return generateGenericFunction(name, category);
}

function generateGenericFunction(name: string, category: string): FunctionData {
  const slug = name.toLowerCase().replace('.', '-');
  
  return {
    name,
    slug,
    category,
    excelVersion: 'All versions',
    description: `${name} is a built-in function in Excel and Google Sheets used for various purposes.`,
    tldr: `${name} is a function used for data processing and analysis in spreadsheets.`,
    syntax: `(${name.toLowerCase()})`,
    parameters: [],
    basicExample: {
      description: `Basic usage of the ${name} function`,
      formula: `=${name}(A1)`,
      result: 'Result',
      explanation: `This is a basic example demonstrating how to use the ${name} function.`,
    },
    advancedExamples: [],
    howItWorks: `The ${name} function processes input values and returns a result based on its specific algorithm.`,
    howToSteps: [
      { name: 'Select a cell', text: 'Choose where you want the result to appear.' },
      { name: 'Enter the formula', text: `Type =${name}(arguments).` },
      { name: 'Press Enter', text: 'The result will be displayed.' },
    ],
    limitations: [],
    commonErrors: [],
    googleSheetsEquivalent: {
      description: `${name} works identically in Google Sheets with the same syntax.`,
      formula: `=${name}(A1)`,
    },
    faq: [],
    relatedFunctions: [],
  };
}

const __dirname = path.dirname(new URL(import.meta.url).pathname);

function writeFunctionData(fn: FunctionData) {
  const dir = path.join(__dirname, '../src/data/functions', fn.category);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filePath = path.join(dir, `${fn.slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fn, null, 2));
  console.log(`Generated: ${filePath}`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node generate-function.js [category]');
    console.log('Categories:', Object.keys(CATEGORIES));
    process.exit(0);
  }
  
  const targetCategory = args[0];
  
  const functionsToGenerate = FUNCTION_DEFINITIONS.filter(fn => 
    targetCategory === 'all' || fn.category === targetCategory
  );
  
  console.log(`Generating ${functionsToGenerate.length} functions...`);
  
  functionsToGenerate.forEach(fnDef => {
    try {
      const fnData = generateFunctionData(fnDef);
      writeFunctionData(fnData);
    } catch (error) {
      console.error(`Error generating ${fnDef.name}:`, error);
    }
  });
  
  console.log(`Successfully generated ${functionsToGenerate.length} functions!`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateFunctionData, FUNCTION_DEFINITIONS, CATEGORIES };