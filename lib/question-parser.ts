import type { CheckupQuestion, QuestionVariant } from './types';

export interface ParsedQuestion {
  question: string;
  variants: string[];
}

/**
 * Clean variant text from common list markers and extra symbols
 * Handles: * Да, - Да, • Да, ○ Да, etc.
 */
function cleanVariantText(text: string): string {
  return text
    // Remove leading bullets, asterisks, dashes, etc.
    .replace(/^[\*\-\•\○\●\◦\▪\▸\►\>\→\·\⁃\‣\⦿\⦾]+\s*/, '')
    // Remove leading letters with parenthesis/dot (a), a., A), A.)
    .replace(/^[a-zA-Zа-яА-Я][\.\)]\s*/, '')
    .trim();
}

/**
 * Parse questions from plain text format
 * Expected format:
 * 1. Question text here?
 * Answer 1
 * Answer 2
 *
 * 2. Next question?
 * Answer 1
 * Answer 2
 */
export function parseQuestionsFromText(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  let currentQuestion: ParsedQuestion | null = null;

  for (const line of lines) {
    // Check if line starts with a number followed by dot or parenthesis (e.g., "1.", "1)", "1 -")
    const questionMatch = line.match(/^\d+[\.\)\-\s]+\s*(.+)/);

    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question) {
        questions.push(currentQuestion);
      }
      // Start new question
      currentQuestion = {
        question: questionMatch[1].trim(),
        variants: [],
      };
    } else if (currentQuestion) {
      // This is a variant/answer line
      // Skip empty lines and common non-answer patterns
      if (line && !line.match(/^[-=_]+$/)) {
        const cleanedVariant = cleanVariantText(line);
        if (cleanedVariant) {
          currentQuestion.variants.push(cleanedVariant);
        }
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }

  return questions;
}

/**
 * Convert parsed questions to CheckupQuestion format
 */
export function convertToCheckupQuestions(
  parsedQuestions: ParsedQuestion[],
  startIndex: number = 1
): CheckupQuestion[] {
  return parsedQuestions.map((pq, idx) => {
    const index = startIndex + idx;
    const variants: QuestionVariant[] = pq.variants.map((label, vIdx) => ({
      label,
      value: String.fromCharCode(97 + vIdx), // a, b, c, d...
    }));

    return {
      index,
      id: String(index),
      question: pq.question,
      type: 'single' as const,
      variants: variants.length > 0 ? variants : [
        { label: 'Да', value: 'a' },
        { label: 'Нет', value: 'b' },
      ],
    };
  });
}

/**
 * Read file and return text content
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Parse DOCX file using mammoth library
 * Returns extracted text content
 */
export async function parseDocxFile(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Main function to parse questions from file
 * Supports .txt, .md, and .docx files
 */
export async function parseQuestionsFromFile(file: File): Promise<CheckupQuestion[]> {
  const fileName = file.name.toLowerCase();
  let text: string;

  if (fileName.endsWith('.docx')) {
    text = await parseDocxFile(file);
  } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    text = await readFileAsText(file);
  } else {
    throw new Error('Unsupported file format. Please use .txt, .md, or .docx files.');
  }

  const parsedQuestions = parseQuestionsFromText(text);

  if (parsedQuestions.length === 0) {
    throw new Error('No questions found in the file. Please check the file format.');
  }

  return convertToCheckupQuestions(parsedQuestions);
}
