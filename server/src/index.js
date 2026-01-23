import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { tableA, tableB, stats } = req.body ?? {};

    if (!tableA && !tableB) {
        return res.status(400).json({ error: 'Missing tableA and tableB' });
    }      

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY on server' });
    }

    const prompt = `
You are helping summarize pasted tables and (if possible) their differences.

If only one table is provided, summarize that table only.
If both are provided, summarize both and also summarize differences.

Table A (raw):
${tableA || '[NOT PROVIDED]'}

Table B (raw):
${tableB || '[NOT PROVIDED]'}

Computed stats (may be partial):
${JSON.stringify(stats ?? {}, null, 2)}

Output format:
- Table A Summary:
- Table B Summary:
- Differences Summary:
- Most important changes (if any):
`;


    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a helpful data analyst.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!groqRes.ok) {
      const text = await groqRes.text();
      return res.status(500).json({ error: `Groq error: ${text}` });
    }

    const data = await groqRes.json();
    const summary = data?.choices?.[0]?.message?.content ?? '';

    res.json({ summary });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Unknown server error',
    });
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`AI server running on http://localhost:${port}`);
});
