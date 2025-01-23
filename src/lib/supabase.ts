import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type EtiquetaRecord = {
  id: number;
  op: string;
  carimbadeira: string;
  quantidade_etiqueta: number;
  quantidade_maquina: number;
  percentual_erro: number;
  created_at: string;
};