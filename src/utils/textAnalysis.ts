import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import * as mammoth from 'mammoth';
import { DocType, Flashcard, MaterialQuizQuestion } from '../types/study';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const STOP_WORDS = new Set(
  (
    'a about above after again against all am an and any are as at be because been before ' +
    'being between both but by can could did do does doing down during each few for from ' +
    'further had has have having he her here hers herself him himself his how i if in into ' +
    'is it its itself just me more most my myself no nor not of off on once only or other ' +
    'our ours ourselves out over own same she should so some such than that the their theirs ' +
    'them themselves then there these they this those through to too under until up very ' +
    'was we were what when where which while who whom why will with would you your yours ' +
    'yourself yourselves also using based learn learning material notes study session'
  ).split(' ')
);

export function createId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function wordCount(text: string): number {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export function splitSentences(text: string): string[] {
  const normalized = (text || '').replace(/\r/g, ' ');
  const parts = normalized.split(/(?<=[.!?])\s+|\n+/);
  return parts.map((p) => p.trim()).filter((p) => p.length > 35 && p.length < 360);
}

export function topTerms(text: string, limit = 20): string[] {
  const matches = (text || '').toLowerCase().match(/[a-z][a-z'-]{3,}/g) || [];
  const counts = new Map<string, number>();
  for (const word of matches) {
    if (!STOP_WORDS.has(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([word]) => word);
}

export function makeQuickReview(text: string, limit = 5): string[] {
  const lines = splitSentences(text);
  const terms = topTerms(text, 12);
  const ranked = lines.map((sentence, index) => {
    const lower = sentence.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = lower.match(new RegExp(`\\b${escaped}\\b`, 'g'));
      if (matches) score += matches.length;
    }
    if (sentence.length > 65 && sentence.length < 230) score += 1;
    return { score, index, sentence };
  });

  return ranked
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence);
}

export function makeFlashcardsFromText(text: string, docId: string): Flashcard[] {
  const lines = splitSentences(text);
  const cards: Flashcard[] = [];
  const usedTerms = new Set<string>();

  const defRegex = /([^.!?\n]{2,65}?\s+(?:is|are|means|refers to|describes)\s+[^.!?\n]{20,230})/gi;
  const definitions = (text || '').match(defRegex) || [];

  for (const line of definitions) {
    if (cards.length >= 5) break;
    const match = line
      .trim()
      .match(/^(.{2,65}?)\s+(is|are|means|refers to|describes)\s+(.+)$/i);
    if (match && match[1].trim().split(/\s+/).length <= 7) {
      const verb = match[2].toLowerCase() === 'means' ? 'does' : 'is';
      cards.push({
        id: createId('fc'),
        docId,
        question: `What ${verb} ${match[1].trim()}?`,
        answer: `${match[3].trim().replace(/\.+$/, '')}.`,
      });
    }
  }

  for (const term of topTerms(text, 24)) {
    if (cards.length >= 10) break;
    if (usedTerms.has(term)) continue;
    const source = lines.find(
      (line) => line.toLowerCase().includes(term) && line.split(/\s+/).length > 7
    );
    if (source) {
      usedTerms.add(term);
      cards.push({
        id: createId('fc'),
        docId,
        question: `What do your notes say about "${term}"?`,
        answer: source,
      });
    }
  }

  return cards;
}

export function makeQuizFromText(text: string): MaterialQuizQuestion[] {
  const lines = splitSentences(text);
  const terms = topTerms(text, 28);
  const questions: MaterialQuizQuestion[] = [];
  const usedLines = new Set<string>();

  for (const term of terms) {
    const source = lines.find(
      (line) => line.toLowerCase().includes(term) && line.split(/\s+/).length > 8
    );
    if (!source || usedLines.has(source)) continue;

    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    const blanked = source.replace(regex, '_____');
    if (blanked === source) continue;

    const distractors = terms
      .filter((other) => other !== term && !source.toLowerCase().includes(other))
      .slice(0, 3);
    if (distractors.length < 2) continue;

    const options = [term, ...distractors];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    questions.push({
      id: createId('qz'),
      prompt: blanked,
      answer: term,
      options,
    });
    usedLines.add(source);
    if (questions.length === 5) break;
  }

  return questions;
}

export async function computeBufferSignature(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return `${buffer.byteLength}-${Date.now()}`;
}

export async function extractTextFromFile(
  file: File
): Promise<{ text: string; type: DocType; signature: string }> {
  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('File exceeds the 20 MB limit.');
  }

  const suffix = (file.name.split('.').pop() || '').toLowerCase();
  const buffer = await file.arrayBuffer();
  const signature = await computeBufferSignature(buffer);

  if (suffix === 'pdf') {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;
    const pageLimit = Math.min(pdf.numPages, 80);
    const chunks: string[] = [];
    for (let p = 1; p <= pageLimit; p++) {
      const page = await pdf.getPage(p);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ');
      chunks.push(pageText);
    }
    return {
      text: chunks.join('\n\n').slice(0, 250_000),
      type: 'pdf',
      signature,
    };
  }

  if (suffix === 'docx') {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return {
      text: (result.value || '').slice(0, 250_000),
      type: 'docx',
      signature,
    };
  }

  if (suffix === 'txt' || suffix === 'md' || suffix === 'markdown') {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
    return {
      text: text.slice(0, 250_000),
      type: suffix as DocType,
      signature,
    };
  }

  throw new Error('Please upload a PDF, Word (.docx), Markdown (.md), or text (.txt) file.');
}
