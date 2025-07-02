#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de validação de responsividade
 * Verifica se os componentes têm as implementações corretas de responsividade
 */

const componentsToValidate = [
  {
    name: 'TissLotManager',
    path: 'src/components/financial/TissLotManager.tsx',
    requiredPatterns: [
      'useIsMobile',
      'isMobile',
      'w-full',
      'max-w-\\[95vw\\]',
      'flex-col',
      'space-y-4',
      'gap-4',
      'text-lg',
      'text-xl'
    ]
  },
  {
    name: 'FinancialForecastDashboard',
    path: 'src/components/financial/FinancialForecastDashboard.tsx',
    requiredPatterns: [
      'useIsMobile',
      'isMobile',
      'grid-cols-1',
      'sm:grid-cols-2',
      'md:grid-cols-2',
      'lg:grid-cols-4',
      'space-y-4',
      'sm:space-y-6'
    ]
  },
  {
    name: 'PatientRecordModal',
    path: 'src/components/patients/PatientRecordModal.tsx',
    requiredPatterns: [
      'useIsMobile',
      'isMobile',
      'max-w-\\[95vw\\]',
      'sm:max-w-4xl',
      'max-h-\\[95vh\\]',
      'max-h-\\[90vh\\]'
    ]
  }
];

function validateComponent(component) {
  const filePath = path.join(path.dirname(__dirname), component.path);
  
  if (!fs.existsSync(filePath)) {
    return {
      passed: false,
      issues: [`Arquivo não encontrado: ${component.path}`]
    };
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  let passed = true;

  // Verificar padrões obrigatórios
  component.requiredPatterns.forEach(pattern => {
    const regex = new RegExp(pattern);
    if (!regex.test(fileContent)) {
      issues.push(`Padrão não encontrado: ${pattern}`);
      passed = false;
    }
  });

  // Verificações específicas
  if (!fileContent.includes('useIsMobile()')) {
    issues.push('Hook useIsMobile() não está sendo usado');
    passed = false;
  }

  if (!fileContent.includes('isMobile ?') && 
      !fileContent.includes('isMobile\n') && 
      !fileContent.includes('isMobile ') &&
      !fileContent.includes('${isMobile')) {
    issues.push('Lógica condicional baseada em isMobile não encontrada');
    passed = false;
  }

  return { passed, issues };
}

function runValidation() {
  console.log('🚀 Iniciando validação de responsividade...\n');
  
  let totalTests = 0;
  let passedTests = 0;
  const failedComponents = [];

  componentsToValidate.forEach(component => {
    totalTests++;
    console.log(`🔍 Validando ${component.name}...`);
    
    const result = validateComponent(component);
    
    if (result.passed) {
      console.log(`✅ ${component.name}: PASSOU\n`);
      passedTests++;
    } else {
      console.log(`❌ ${component.name}: FALHOU`);
      result.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      console.log('');
      failedComponents.push(component.name);
    }
  });

  // Resumo
  console.log('📊 Resumo da validação:');
  console.log(`   Total de testes: ${totalTests}`);
  console.log(`   Testes aprovados: ${passedTests}`);
  console.log(`   Testes falhados: ${totalTests - passedTests}`);
  
  if (failedComponents.length > 0) {
    console.log(`   Componentes com problemas: ${failedComponents.join(', ')}`);
  }

  console.log('\n✨ Validação concluída!');
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os componentes passaram na validação de responsividade!');
    process.exit(0);
  } else {
    console.log('⚠️  Alguns componentes precisam de ajustes na responsividade.');
    process.exit(1);
  }
}

// Executar validação
runValidation(); 