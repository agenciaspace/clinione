/**
 * Utilitário para validação de CPF
 */

/**
 * Remove todos os caracteres não numéricos do CPF
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Formata o CPF para exibição (xxx.xxx.xxx-xx)
 */
export function formatCPF(cpf: string): string {
  const cleanedCPF = cleanCPF(cpf);
  
  if (cleanedCPF.length !== 11) {
    return cpf; // Retorna o valor original se não tem 11 dígitos
  }
  
  return cleanedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Valida se o CPF é válido
 */
export function isValidCPF(cpf: string): boolean {
  const cleanedCPF = cleanCPF(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleanedCPF.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cleanedCPF)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanedCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanedCPF.charAt(9))) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanedCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleanedCPF.charAt(10))) {
    return false;
  }
  
  return true;
}

/**
 * Valida CPF e retorna mensagem de erro se inválido
 */
export function validateCPF(cpf: string): string | null {
  if (!cpf || cpf.trim() === '') {
    return 'CPF é obrigatório';
  }
  
  const cleanedCPF = cleanCPF(cpf);
  
  if (cleanedCPF.length !== 11) {
    return 'CPF deve ter 11 dígitos';
  }
  
  if (!isValidCPF(cpf)) {
    return 'CPF inválido';
  }
  
  return null;
}

/**
 * Máscara para input de CPF
 */
export function maskCPF(value: string): string {
  const cleanedValue = cleanCPF(value);
  
  if (cleanedValue.length === 0) return '';
  if (cleanedValue.length <= 3) return cleanedValue;
  if (cleanedValue.length <= 6) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
  if (cleanedValue.length <= 9) return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6)}`;
  return `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3, 6)}.${cleanedValue.slice(6, 9)}-${cleanedValue.slice(9, 11)}`;
}

/**
 * Hook para usar em formulários com React Hook Form
 */
export const cpfValidationRules = {
  required: 'CPF é obrigatório',
  validate: {
    isValid: (value: string) => {
      const error = validateCPF(value);
      return error || true;
    }
  }
};