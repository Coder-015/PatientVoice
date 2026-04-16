import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '@/lib/supabaseClient';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_for_build' });

export async function POST(req: Request) {
  try {
    const { messages, consultationId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    let contextData = '';
    if (consultationId) {
      const { data } = await supabase.from('consultations').select('symptoms, analysis_result').eq('id', consultationId).single();
      if (data) {
        contextData = `Here is the clinical context: Original symptoms: "${data.symptoms}". Initial AI Differential: ${data.analysis_result.condition} with ${data.analysis_result.confidence}% confidence.`;
      }
    }

    const systemMessage = {
      role: 'system',
      content: `You are an incredibly warm, deeply empathetic clinical AI assistant inside the PatientVoice app. The user is asking a follow-up question based on their recent clinical report. ${contextData} Answer their questions supportively, but you MUST be extremely concise and clinical. CRITICAL RULES: 1. Keep your entire response under 3-4 short sentences or a few bullet points. 2. Do NOT write long paragraphs. 3. Use point-to-point, highly direct clinical language ("point to point talk"). 4. Ensure you do not prescribe medication. 5. Make the formatting look highly impressive and professional using Markdown bullet points. You must use double blank newlines ("\\n\\n") between every bullet.`
    };

    const groqMessages = [systemMessage, ...messages];

    const chatCompletion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.1-8b-instant',
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'I am sorry, I am unable to process that at the moment.';

    return NextResponse.json({ reply }, { status: 200 });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
