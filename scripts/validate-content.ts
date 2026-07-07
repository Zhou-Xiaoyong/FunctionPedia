import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const DATA_DIR = path.join(__dirname, '../src/data');

interface ValidationError {
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

const errors: ValidationError[] = [];

function validateJSONFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    JSON.parse(content);
  } catch (e) {
    errors.push({
      file: filePath,
      message: `Invalid JSON: ${(e as Error).message}`,
      severity: 'error',
    });
    return null;
  }
  return fs.readFileSync(filePath, 'utf-8');
}

function validateFunctionData(filePath: string) {
  const content = validateJSONFile(filePath);
  if (!content) return;

  const data = JSON.parse(content);
  const fileName = path.basename(filePath);
  const expectedName = fileName.replace('.json', '').replace('-', '.').toUpperCase();

  if (!data.name) {
    errors.push({ file: filePath, message: 'Missing "name" field', severity: 'error' });
  } else if (data.name.toUpperCase() !== expectedName) {
    errors.push({ file: filePath, message: `Name mismatch: expected "${expectedName}", got "${data.name}"`, severity: 'warning' });
  }

  if (!data.category) {
    errors.push({ file: filePath, message: 'Missing "category" field', severity: 'error' });
  }

  if (!data.description) {
    errors.push({ file: filePath, message: 'Missing "description" field', severity: 'error' });
  }

  if (!data.syntax) {
    errors.push({ file: filePath, message: 'Missing "syntax" field', severity: 'error' });
  }

  if (data.parameters && !Array.isArray(data.parameters)) {
    errors.push({ file: filePath, message: '"parameters" must be an array', severity: 'error' });
  }

  if (data.examples && !Array.isArray(data.examples)) {
    errors.push({ file: filePath, message: '"examples" must be an array', severity: 'error' });
  }

  if (data.examples) {
    data.examples.forEach((ex: any, index: number) => {
      if (!ex.formula) {
        errors.push({ file: filePath, message: `Example ${index + 1} missing "formula"`, severity: 'error' });
      }
      if (!ex.description) {
        errors.push({ file: filePath, message: `Example ${index + 1} missing "description"`, severity: 'warning' });
      }
    });
  }

  if (data.errors && !Array.isArray(data.errors)) {
    errors.push({ file: filePath, message: '"errors" must be an array', severity: 'error' });
  }

  if (data.googleSheetsEquivalent && typeof data.googleSheetsEquivalent !== 'object') {
    errors.push({ file: filePath, message: '"googleSheetsEquivalent" must be an object', severity: 'error' });
  }
}

function validateTutorialData(filePath: string) {
  const content = validateJSONFile(filePath);
  if (!content) return;

  const data = JSON.parse(content);

  if (!data.title) {
    errors.push({ file: filePath, message: 'Missing "title" field', severity: 'error' });
  }

  if (!data.slug) {
    errors.push({ file: filePath, message: 'Missing "slug" field', severity: 'error' });
  }

  if (!data.description) {
    errors.push({ file: filePath, message: 'Missing "description" field', severity: 'error' });
  }

  if (!data.category) {
    errors.push({ file: filePath, message: 'Missing "category" field', severity: 'error' });
  }

  if (!data.sections || !Array.isArray(data.sections)) {
    errors.push({ file: filePath, message: 'Missing or invalid "sections" array', severity: 'error' });
  }

  if (!data.functions || !Array.isArray(data.functions)) {
    errors.push({ file: filePath, message: 'Missing or invalid "functions" array', severity: 'warning' });
  }
}

function validateAll() {
  const functionDir = path.join(DATA_DIR, 'functions');
  const tutorialDir = path.join(DATA_DIR, 'tutorials');

  if (fs.existsSync(functionDir)) {
    const functionFiles = fs.readdirSync(functionDir);
    console.log(`\n=== Validating ${functionFiles.length} function files ===\n`);
    functionFiles.forEach((file) => {
      if (file.endsWith('.json')) {
        validateFunctionData(path.join(functionDir, file));
      }
    });
  }

  if (fs.existsSync(tutorialDir)) {
    const tutorialFiles = fs.readdirSync(tutorialDir);
    console.log(`\n=== Validating ${tutorialFiles.length} tutorial files ===\n`);
    tutorialFiles.forEach((file) => {
      if (file.endsWith('.json')) {
        validateTutorialData(path.join(tutorialDir, file));
      }
    });
  }

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  console.log(`\n=== Validation Results ===`);
  console.log(`Total errors: ${errorCount}`);
  console.log(`Total warnings: ${warningCount}`);

  if (errors.length > 0) {
    console.log('\n--- Errors ---');
    errors.filter((e) => e.severity === 'error').forEach((e) => {
      console.log(`✗ ${e.file}: ${e.message}`);
    });

    if (warningCount > 0) {
      console.log('\n--- Warnings ---');
      errors.filter((e) => e.severity === 'warning').forEach((e) => {
        console.log(`⚠ ${e.file}: ${e.message}`);
      });
    }
  } else {
    console.log('✓ All files validated successfully!');
  }

  if (errorCount > 0) {
    process.exit(1);
  }
}

validateAll();