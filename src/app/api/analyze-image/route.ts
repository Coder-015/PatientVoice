import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, textSymptoms, userId } = await req.json();

    // 2. Parse body
    console.log('[API analyze-image] imageBase64 length:', imageBase64?.length ?? 0);
    console.log('[API analyze-image] mimeType:', mimeType);

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
    }

    // 3. Groq vision call
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    console.log('[API analyze-image] calling Groq vision model...');

    const visionResponse = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            },
            {
              type: 'text',
              text: `You are a clinical image analysis assistant. Analyze this 
              symptom image and provide:
              1. Visual Description: color, texture, size estimate, morphology
              2. Clinical Observations: anything medically relevant
              3. Possible HPO Mappings: 2-4 HPO terms matching visible findings
              4. Red Flags: any visually urgent signs
              Patient also reports: "${textSymptoms ?? 'No text symptoms provided'}"
              Be clinical but concise. Do NOT diagnose.`
            }
          ]
        }
      ],
      max_tokens: 800
    });

    const visualFindings = visionResponse.choices[0]?.message?.content ?? '';
    console.log('[API analyze-image] visualFindings preview:', visualFindings.slice(0, 150));

    return NextResponse.json({ visualFindings });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API analyze-image] ERROR:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
