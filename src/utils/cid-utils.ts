// CID (Classificação Internacional de Doenças) utilities
// ICD-10 classification utilities

export interface CIDCode {
  id: string;
  code: string;
  description: string;
  category: string;
  is_active: boolean;
}

export interface CIDSearchResult {
  code: string;
  description: string;
  category: string;
}

// Common CID categories
export const CID_CATEGORIES = {
  INFECTIONS: 'Infecções',
  NEOPLASIAS: 'Neoplasias',
  BLOOD: 'Sangue',
  ENDOCRINE: 'Endócrinas',
  MENTAL: 'Mental',
  NEUROLOGICAL: 'Neurológicas',
  OPHTHALMOLOGICAL: 'Oftalmológicas',
  OTOLOGICAL: 'Otológicas',
  CIRCULATORY: 'Circulatórias',
  RESPIRATORY: 'Respiratórias',
  DIGESTIVE: 'Digestivas',
  DERMATOLOGICAL: 'Dermatológicas',
  MUSCULOSKELETAL: 'Musculoesqueléticas',
  GENITOURINARY: 'Geniturinárias',
  OBSTETRIC: 'Obstétricas',
  TRAUMA: 'Traumas',
  SYMPTOMS: 'Sintomas',
  PREVENTION: 'Prevenção'
} as const;

// Most common CID codes with their descriptions (updated with official Brazilian CID-10)
export const COMMON_CID_CODES: CIDSearchResult[] = [
  // Infections - Infecções
  { code: 'A09', description: 'Diarréia e gastroenterite de origem infecciosa presumível', category: 'Infecções' },
  { code: 'B34.9', description: 'Infecção viral não especificada', category: 'Infecções' },
  { code: 'A08', description: 'Infecções intestinais virais, outras e as não especificadas', category: 'Infecções' },

  // Respiratory - Respiratórias
  { code: 'J00', description: 'Nasofaringite aguda [resfriado comum]', category: 'Respiratórias' },
  { code: 'J06', description: 'Infecções agudas das vias aéreas superiores de localizações múltiplas e não especificadas', category: 'Respiratórias' },
  { code: 'J20', description: 'Bronquite aguda', category: 'Respiratórias' },
  { code: 'J44', description: 'Outras doenças pulmonares obstrutivas crônicas', category: 'Respiratórias' },
  { code: 'J45', description: 'Asma', category: 'Respiratórias' },

  // Digestive - Digestivas
  { code: 'K21', description: 'Doença do refluxo gastroesofágico', category: 'Digestivas' },
  { code: 'K29', description: 'Gastrite e duodenite', category: 'Digestivas' },
  { code: 'K30', description: 'Dispepsia', category: 'Digestivas' },
  { code: 'K59', description: 'Outros transtornos funcionais do intestino', category: 'Digestivas' },

  // Circulatory - Circulatórias
  { code: 'I10', description: 'Hipertensão essencial (primária)', category: 'Circulatórias' },
  { code: 'I25', description: 'Doença isquêmica crônica do coração', category: 'Circulatórias' },
  { code: 'I50', description: 'Insuficiência cardíaca', category: 'Circulatórias' },

  // Endocrine - Endócrinas
  { code: 'E10', description: 'Diabetes mellitus tipo 1', category: 'Endócrinas' },
  { code: 'E11', description: 'Diabetes mellitus tipo 2', category: 'Endócrinas' },
  { code: 'E78', description: 'Distúrbios do metabolismo de lipoproteínas e outras lipidemias', category: 'Endócrinas' },
  { code: 'E66', description: 'Obesidade', category: 'Endócrinas' },

  // Mental - Mental
  { code: 'F32', description: 'Episódios depressivos', category: 'Mental' },
  { code: 'F41', description: 'Outros transtornos ansiosos', category: 'Mental' },
  { code: 'F43', description: 'Reações ao "stress" grave e transtornos de adaptação', category: 'Mental' },

  // Neurological - Neurológicas
  { code: 'G43', description: 'Enxaqueca', category: 'Neurológicas' },
  { code: 'G44', description: 'Outras síndromes de algias cefálicas', category: 'Neurológicas' },
  { code: 'G47', description: 'Distúrbios do sono', category: 'Neurológicas' },

  // Symptoms - Sintomas
  { code: 'R05', description: 'Tosse', category: 'Sintomas' },
  { code: 'R06', description: 'Anormalidades da respiração', category: 'Sintomas' },
  { code: 'R10', description: 'Dor abdominal e pélvica', category: 'Sintomas' },
  { code: 'R50', description: 'Febre, não especificada em outra parte', category: 'Sintomas' },
  { code: 'R51', description: 'Cefaléia', category: 'Sintomas' },
  { code: 'R68', description: 'Outros sintomas e sinais gerais', category: 'Sintomas' },

  // Musculoskeletal - Musculoesqueléticas
  { code: 'M25', description: 'Outras artropatias', category: 'Musculoesqueléticas' },
  { code: 'M54', description: 'Dorsalgia', category: 'Musculoesqueléticas' },
  { code: 'M79', description: 'Outros transtornos dos tecidos moles, não classificados em outra parte', category: 'Musculoesqueléticas' },

  // Genitourinary - Geniturinárias
  { code: 'N39', description: 'Outros transtornos do trato urinário', category: 'Geniturinárias' },
  { code: 'N76', description: 'Outras afecções inflamatórias da vagina e da vulva', category: 'Geniturinárias' },

  // Dermatological - Dermatológicas
  { code: 'L20', description: 'Dermatite atópica', category: 'Dermatológicas' },
  { code: 'L30', description: 'Outras dermatites', category: 'Dermatológicas' },
  { code: 'L50', description: 'Urticária', category: 'Dermatológicas' },

  // Blood - Sangue
  { code: 'D50', description: 'Anemia por deficiência de ferro', category: 'Sangue' },
  { code: 'D64', description: 'Outras anemias', category: 'Sangue' },

  // Prevention - Prevenção
  { code: 'Z00', description: 'Exame geral e investigação de pessoas sem queixas ou diagnóstico relatado', category: 'Prevenção' },
  { code: 'Z01', description: 'Outros exames e investigações especiais de pessoas sem queixa ou diagnóstico relatado', category: 'Prevenção' },

  // Trauma - Traumas
  { code: 'S72', description: 'Fratura do fêmur', category: 'Traumas' },
  { code: 'T78', description: 'Efeitos adversos não especificados em outra parte', category: 'Traumas' },

  // Ophthalmological - Oftalmológicas
  { code: 'H52', description: 'Transtornos da acomodação e da refração', category: 'Oftalmológicas' },

  // Otological - Otológicas  
  { code: 'H66', description: 'Otite média supurativa e as não especificadas', category: 'Otológicas' },

  // Obstetric - Obstétricas
  { code: 'O80', description: 'Parto único espontâneo', category: 'Obstétricas' },
];

/**
 * Search for CID codes by text
 * @param searchTerm - The search term to look for
 * @param codes - Array of CID codes to search in (optional, defaults to common codes)
 * @returns Array of matching CID codes
 */
export function searchCIDCodes(
  searchTerm: string,
  codes: CIDSearchResult[] = COMMON_CID_CODES
): CIDSearchResult[] {
  if (!searchTerm.trim()) {
    return codes.slice(0, 10); // Return first 10 codes if no search term
  }

  const term = searchTerm.toLowerCase();
  
  return codes.filter(code => 
    code.code.toLowerCase().includes(term) ||
    code.description.toLowerCase().includes(term) ||
    code.category.toLowerCase().includes(term)
  ).slice(0, 20); // Limit to 20 results
}

/**
 * Get CID code by exact code match
 * @param code - The CID code to find
 * @param codes - Array of CID codes to search in (optional, defaults to common codes)
 * @returns The matching CID code or null if not found
 */
export function getCIDByCode(
  code: string,
  codes: CIDSearchResult[] = COMMON_CID_CODES
): CIDSearchResult | null {
  return codes.find(c => c.code === code) || null;
}

/**
 * Format CID code for display
 * @param code - The CID code
 * @param description - The description (optional)
 * @returns Formatted string
 */
export function formatCIDCode(code: string, description?: string): string {
  if (description) {
    return `${code} - ${description}`;
  }
  return code;
}

/**
 * Validate CID code format
 * @param code - The CID code to validate
 * @returns true if valid format, false otherwise
 */
export function isValidCIDCode(code: string): boolean {
  // Basic CID-10 format validation
  // Format: Letter + 2 digits + optional dot + optional digit
  const cidPattern = /^[A-Z]\d{2}(\.\d)?$/;
  return cidPattern.test(code);
}

/**
 * Get CID codes by category
 * @param category - The category to filter by
 * @param codes - Array of CID codes to search in (optional, defaults to common codes)
 * @returns Array of CID codes in the specified category
 */
export function getCIDCodesByCategory(
  category: string,
  codes: CIDSearchResult[] = COMMON_CID_CODES
): CIDSearchResult[] {
  return codes.filter(code => code.category === category);
}

/**
 * Get all unique categories
 * @param codes - Array of CID codes (optional, defaults to common codes)
 * @returns Array of unique categories
 */
export function getCIDCategories(
  codes: CIDSearchResult[] = COMMON_CID_CODES
): string[] {
  return Array.from(new Set(codes.map(code => code.category))).sort();
}