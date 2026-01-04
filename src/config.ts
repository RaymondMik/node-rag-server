import 'dotenv/config';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

/** OpenAI config */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/** Supabase config */
const privateKey = process.env.SUPABASE_KEY;
const url = process.env.SUPABASE_URL;

if (!privateKey || !url) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(url, privateKey);
