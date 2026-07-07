/**
 * 自动化内容工作流脚本
 * 功能：
 * 1. 分析网站内容覆盖情况
 * 2. 基于SEO数据建议缺失内容
 * 3. 自动生成建议报告
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, '../src/data');
const FUNCTIONS_DIR = path.join(DATA_DIR, 'functions');
const TUTORIALS_DIR = path.join(DATA_DIR, 'tutorials');

interface ContentReport {
  totalFunctions: number;
  existingFunctions: string[];
  missingFunctions: string[];
  tutorialsCount: number;
  categoriesCoverage: Record<string, number>;
  recommendations: string[];
  generatedAt: string;
}

const ESSENTIAL_FUNCTIONS = [
  // Lookup & Reference
  'VLOOKUP', 'XLOOKUP', 'HLOOKUP', 'INDEX', 'MATCH', 'INDIRECT', 'OFFSET', 'CHOOSE', 'TRANSPOSE',
  // Logical
  'IF', 'IFS', 'IFERROR', 'IFNA', 'AND', 'OR', 'NOT', 'XOR', 'TRUE', 'FALSE',
  // Math
  'SUM', 'SUMIF', 'SUMIFS', 'SUMPRODUCT', 'ABS', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'INT', 'MOD', 'POWER',
  // Statistical
  'AVERAGE', 'AVERAGEIF', 'AVERAGEIFS', 'COUNT', 'COUNTA', 'COUNTIF', 'COUNTIFS', 'COUNTBLANK', 'MAX', 'MIN', 'MAXIFS', 'MINIFS',
  'MEDIAN', 'STDEV', 'VAR', 'PERCENTILE', 'QUARTILE', 'RANK', 'CORREL',
  // Text
  'LEFT', 'RIGHT', 'MID', 'LEN', 'CONCAT', 'CONCATENATE', 'TEXTJOIN', 'TRIM', 'UPPER', 'LOWER', 'PROPER',
  'SUBSTITUTE', 'REPLACE', 'FIND', 'SEARCH', 'VALUE', 'TEXT',
  // DateTime
  'TODAY', 'NOW', 'DATE', 'TIME', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND',
  'DATEDIF', 'EDATE', 'EOMONTH', 'WEEKDAY', 'WEEKNUM', 'NETWORKDAYS', 'WORKDAY',
  // Financial
  'PMT', 'PV', 'FV', 'NPV', 'IRR', 'RATE', 'NPER', 'IPMT', 'PPMT',
  // Information
  'ISBLANK', 'ISERROR', 'ISNA', 'ISNUMBER', 'ISTEXT', 'ISREF', 'ERROR.TYPE', 'TYPE', 'CELL',
  // Dynamic Arrays (Excel 365)
  'FILTER', 'SORT', 'UNIQUE', 'SEQUENCE', 'RANDARRAY', 'SORTBY',
  // Google Sheets specific
  'QUERY', 'IMPORTDATA', 'IMPORTHTML', 'IMPORTXML', 'IMPORTFEED', 'IMPORTFUNCTION',
  'GOOGLEFINANCE', 'GOOGLETRANSLATE', 'IMAGE', 'SPARKLINE', 'ARRAYFORMULA',
  // Database
  'DAVERAGE', 'DCOUNT', 'DCOUNTA', 'DGET', 'DMAX', 'DMIN', 'DSUM', 'DVAR',
];

const CATEGORIES = {
  'Lookup & Reference': ['lookup', 'reference'],
  'Logical': ['logical'],
  'Math & Trigonometry': ['math', 'trigonometry'],
  'Statistical': ['statistical'],
  'Text': ['text'],
  'Date & Time': ['datetime'],
  'Financial': ['financial'],
  'Information': ['information'],
  'Engineering': ['engineering'],
  'Database': ['database'],
  'Google Sheets': ['google-sheets'],
  'Dynamic Arrays': ['dynamic-arrays'],
};

async function analyzeContent(): Promise<ContentReport> {
  const existingFunctions: string[] = [];
  const categoriesCoverage: Record<string, number> = {};

  if (fs.existsSync(FUNCTIONS_DIR)) {
    // 递归读取所有子目录中的 JSON 文件
    const subDirs = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
    subDirs.forEach((entry) => {
      if (entry.isDirectory()) {
        const subDirPath = path.join(FUNCTIONS_DIR, entry.name);
        const files = fs.readdirSync(subDirPath).filter(f => f.endsWith('.json'));
        files.forEach(file => {
          const content = fs.readFileSync(path.join(subDirPath, file), 'utf-8');
          try {
            const data = JSON.parse(content);
            existingFunctions.push(data.name.toUpperCase());
            if (data.category) {
              const cat = data.category.toLowerCase();
              categoriesCoverage[cat] = (categoriesCoverage[cat] || 0) + 1;
            }
          } catch (e) {
            console.error(`Error parsing ${file}: ${e}`);
          }
        });
      }
    });
  }

  const missingFunctions = ESSENTIAL_FUNCTIONS.filter(
    fn => !existingFunctions.includes(fn) && !existingFunctions.includes(fn.replace('.', '-'))
  );

  const tutorialsCount = fs.existsSync(TUTORIALS_DIR)
    ? fs.readdirSync(TUTORIALS_DIR).filter(f => f.endsWith('.json')).length
    : 0;

  const recommendations: string[] = [];

  if (missingFunctions.length > 0) {
    recommendations.push(`生成缺失的 ${missingFunctions.length} 个核心函数文档：${missingFunctions.slice(0, 10).join(', ')}...`);
  }

  if (tutorialsCount < 10) {
    recommendations.push(`扩展教程内容，目标10+篇高价值教程（当前${tutorialsCount}篇）`);
  }

  Object.entries(CATEGORIES).forEach(([cat, slugs]) => {
    const total = slugs.reduce((sum, slug) => sum + (categoriesCoverage[slug] || 0), 0);
    if (total < 20) {
      recommendations.push(`增强 ${cat} 类别内容（当前${total}个函数）`);
    }
  });

  recommendations.push('添加更多实际业务场景案例');
  recommendations.push('增加视频教程链接');
  recommendations.push('优化 SEO 元数据和结构化数据');

  return {
    totalFunctions: existingFunctions.length,
    existingFunctions,
    missingFunctions,
    tutorialsCount,
    categoriesCoverage,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}

async function saveReport(report: ContentReport): void {
  const reportPath = path.join(__dirname, '../reports/content-analysis.json');
  const reportsDir = path.dirname(reportPath);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✓ Report saved to: ${reportPath}`);
}

function printReport(report: ContentReport): void {
  console.log('\n=== FunctionPedia Content Analysis Report ===\n');
  console.log(`Generated: ${report.generatedAt}`);
  console.log(`\n📊 Statistics:`);
  console.log(`  Total Functions: ${report.totalFunctions}`);
  console.log(`  Tutorials: ${report.tutorialsCount}`);
  console.log(`  Missing Core Functions: ${report.missingFunctions.length}`);

  console.log(`\n📁 Category Coverage:`);
  Object.entries(report.categoriesCoverage).forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} functions`);
  });

  console.log(`\n📋 Recommendations:`);
  report.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });

  if (report.missingFunctions.length > 0 && report.missingFunctions.length <= 20) {
    console.log(`\n🔧 Missing Functions List:`);
    report.missingFunctions.forEach(fn => console.log(`  - ${fn}`));
  }
}

async function main(): void {
  console.log('Analyzing FunctionPedia content...\n');
  const report = await analyzeContent();
  printReport(report);
  await saveReport(report);
}

main();