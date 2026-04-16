import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '@/lib/supabaseClient';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || 'dummy_for_build' });

export async function POST(req: Request) {
  try {
    const { symptoms, userId, visualFindings } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 });
    }

    let profileContext = '';
    if (userId) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        profileContext = `Patient Profile Summary: Age: ${profile.age || 'Unknown'}, Gender: ${profile.gender || 'Unknown'}. Known Medical History: ${profile.medical_history || 'None'}. Please consider this context when analyzing their symptoms.`;
      }
    }

    // TODO: HPO_DATASET_INTEGRATION
    const enrichedPrompt = visualFindings
      ? `Patient text symptoms: ${symptoms}\n\nVisual symptom analysis from patient-uploaded image:\n${visualFindings}\n\nPlease incorporate both text and visual findings into the HPO mapping and differential report.`
      : `Patient text symptoms: ${symptoms}`;
      
    console.log('[ANALYSIS] enrichedPrompt length:', enrichedPrompt.length);

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a clinical documentation assistant trained in the Human Phenotype Ontology (HPO). When a patient describes symptoms — via text OR image — you must:

1. Map each symptom to its canonical HPO term (e.g. "bad headache" → HP:0002315 Headache).
2. Generate a structured differential diagnosis report with sections:
   - Patient Symptom Summary (plain English)
   - Visual Findings (If an image was provided, add a section detailing your clinical observations of the image)
   - HPO Term Mapping Table (Symptom | HPO ID | HPO Label | Confidence %)
   - Clinical Reasoning Engine: A deeply analytical, professional 2-3 paragraph clinical reasoning summary explaining exactly WHY these differential diagnoses were selected. Reference the patient's age/gender, rule in/out red flags, and establish an evidence-based narrative.
   - Differential Diagnoses (ranked)
   - Recommended Specialist & Urgency Level (Routine / Urgent / Emergency)
   - Red Flag Symptoms (if any detected — highlight these prominently)
   - Questions the Doctor Should Ask
3. If an image was provided, describe visible clinical signs (rash morphology, swelling, discoloration, wound state, etc.) and factor them into the HPO mapping and differentials.
4. Output clean Markdown so react-markdown renders it beautifully.
5. Never give definitive diagnoses. Always frame as "differential considerations".
6. Footer disclaimer: "This report is AI-generated for clinical communication purposes only and does not constitute a medical diagnosis."

${profileContext}

Respond strictly in JSON format with the following structure:
{
  "condition": "Primary suspected condition (short name)",
  "confidence": 92,
  "urgency": "Routine",
  "markdown_report": "The complete, structured Markdown-formatted report goes here as a single string",
  "hpoTerms": [
      { "code": "HP:0000000", "name": "Term Name", "desc": "Brief desc" }
  ]
}`,
        },
        {
          role: 'user',
          content: enrichedPrompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const analysisObj = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');

    // Save to Supabase
    // Note: Assuming a table "consultations" exists. If not, it will fail gracefully or we need to ensure the schema.
    const { data, error } = await supabase
      .from('consultations')
      .insert([
        { 
          symptoms: symptoms, 
          condition: analysisObj.condition,
          confidence: analysisObj.confidence,
          analysis_result: analysisObj,
          user_id: userId || null
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      // We can continue and just return the result even if DB fails in a prototype, but good to log it.
    }

    return NextResponse.json({ result: analysisObj, id: data?.[0]?.id }, { status: 200 });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
