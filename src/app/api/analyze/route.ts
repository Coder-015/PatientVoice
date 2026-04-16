import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { supabase } from '@/lib/supabaseClient';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { symptoms, userId } = await req.json();

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

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an elite, highly skilled medical diagnostician and empathetic physician assistant. You possess vast knowledge of peer-reviewed medical literature, clinical guidelines, and the Human Phenotype Ontology (HPO). Your goal is to deeply analyze the user's symptoms, cross-reference them with established medical databases, and provide a highly accurate, evidence-based clinical brief. Always maintain an empathetic, reassuring tone, but be strictly clinical and precise in your medical categorizations. Consider systemic involvements and edge cases if applicable. ${profileContext}
          Respond strictly in JSON format with the following structure:
          {
            "condition": "Primary suspected condition (short name)",
            "confidence": 92.5, // number between 0-100 indicating percentage
            "clinical_reasoning": "A deeply analytical, professional 2-3 paragraph clinical reasoning summary explaining exactly WHY these differential diagnoses were selected. Reference the patient's age/gender, rule in/out red flags, and establish an evidence-based narrative.",
            "hpoTerms": [
                { "code": "HP:0000000", "name": "Term Name", "desc": "Brief desc" }
            ],
            "differentialDiagnosis": [
                { "name": "Alternative Condition", "score": 85 }
            ],
            "doctorCommunication": [
                { "topic": "Key point to mention", "question": "Suggested question to ask the doctor" }
            ]
          }`,
        },
        {
          role: 'user',
          content: symptoms,
        },
      ],
      model: 'llama-3.1-8b-instant',
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
