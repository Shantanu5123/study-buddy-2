import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface TutorMissedContext {
  prompt: string;
  chosenAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

interface TutorRequestBody {
  question?: string;
  documentTitle?: string;
  documentText?: string;
  history?: { role: 'user' | 'model'; text: string }[];
  missedQuestion?: TutorMissedContext;
}

app.post('/api/tutor', async (req, res) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(500).json({
        error:
          'Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const body = (req.body || {}) as TutorRequestBody;
    const question = (body.question || '').trim();
    const docTitle = (body.documentTitle || 'Current Study Material').trim();
    const docText = (body.documentText || '').slice(0, 32000).trim();
    const missed = body.missedQuestion;

    if (!question && !missed) {
      res.status(400).json({ error: 'Please provide a question for the AI Tutor.' });
      return;
    }

    const systemInstruction = [
      'You are a patient, concise, high-clarity StudyBuddy tutor.',
      'Ground your explanations in the student’s provided study material whenever relevant.',
      'Keep explanations well-structured using short paragraphs or bullet points, and directly address misunderstandings.',
      'If the provided document text does not cover part of a question, clearly distinguish between what is in the material and general domain explanation.',
    ].join(' ');

    const contextSections: string[] = [];
    if (docText) {
      contextSections.push(`Active Study Material ("${docTitle}"):\n"""\n${docText}\n"""`);
    } else {
      contextSections.push(`Active Topic/Context: "${docTitle}" (no extracted document text provided).`);
    }

    if (missed) {
      contextSections.push(
        [
          'The student missed this practice quiz question and asked for an explanation:',
          `Question: ${missed.prompt}`,
          `Student selected: ${missed.chosenAnswer}`,
          `Correct answer: ${missed.correctAnswer}`,
          missed.explanation ? `Reference note: ${missed.explanation}` : '',
          'Explain clearly why the selected choice is incorrect, why the correct answer works, and how to remember it.',
        ]
          .filter(Boolean)
          .join('\n')
      );
    }

    const historyText = (body.history || [])
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
      .join('\n');

    const promptParts = [
      contextSections.join('\n\n'),
      historyText ? `Recent conversation:\n${historyText}` : '',
      question ? `Student question: ${question}` : 'Please explain why I missed this question.',
    ].filter(Boolean);

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: promptParts.join('\n\n'),
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    const answer = (response.text || '').trim();
    if (!answer) {
      res.status(502).json({ error: 'The tutor returned an empty response. Please try again.' });
      return;
    }

    res.json({ answer });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unable to reach AI Tutor service.';
    console.error('AI Tutor error:', message);
    if (
      message.includes('API_KEY_INVALID') ||
      message.includes('PERMISSION_DENIED') ||
      message.includes('403')
    ) {
      res.status(403).json({
        error:
          'Your Gemini API key could not be authorized. Please check it in Settings > Secrets.',
      });
      return;
    }
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyBuddy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
