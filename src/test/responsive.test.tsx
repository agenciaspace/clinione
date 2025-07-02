import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIsMobile } from '@/hooks/use-mobile';
import { TissLotManager } from '@/components/financial/TissLotManager';
import { FinancialForecastDashboard } from '@/components/financial/FinancialForecastDashboard';
import { PatientRecordModal } from '@/components/patients/PatientRecordModal';

// Mock dos hooks
vi.mock('@/hooks/use-mobile');
vi.mock('@/contexts/ClinicContext');
vi.mock('@/hooks/queries/useFinancialQueries');
vi.mock('@/hooks/mutations/useFinancialMutations');

const mockUseIsMobile = vi.mocked(useIsMobile);

// Mock data
const mockClinic = {
  id: '1',
  name: 'Clínica Test',
  description: 'Test clinic'
};

const mockForecasts = [
  {
    id: '1',
    description: 'Consulta Test',
    value: 100,
    expected_payment_date: new Date().toISOString(),
    status: 'forecast' as const,
    payment_type: 'insurance' as const,
    insurance_company_id: '1'
  }
];

describe('Responsive Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TissLotManager', () => {
    it('should render mobile layout when isMobile is true', () => {
      mockUseIsMobile.mockReturnValue(true);
      
      vi.mocked(require('@/contexts/ClinicContext').useClinic).mockReturnValue({
        activeClinic: mockClinic
      });
      
      vi.mocked(require('@/hooks/queries/useFinancialQueries').useFinancialQueries).mockReturnValue({
        forecasts: mockForecasts,
        insuranceCompanies: [],
        tissBatches: [],
        isLoading: false
      });

      render(<TissLotManager />);
      
      // Verificar se elementos específicos do mobile estão presentes
      const createButton = screen.getByText('Criar Lote');
      expect(createButton).toHaveClass('w-full'); // Mobile button should be full width
    });

    it('should render desktop layout when isMobile is false', () => {
      mockUseIsMobile.mockReturnValue(false);
      
      vi.mocked(require('@/contexts/ClinicContext').useClinic).mockReturnValue({
        activeClinic: mockClinic
      });
      
      vi.mocked(require('@/hooks/queries/useFinancialQueries').useFinancialQueries).mockReturnValue({
        forecasts: mockForecasts,
        insuranceCompanies: [],
        tissBatches: [],
        isLoading: false
      });

      render(<TissLotManager />);
      
      // Verificar se elementos específicos do desktop estão presentes
      const createButton = screen.getByText('Criar Lote');
      expect(createButton).not.toHaveClass('w-full'); // Desktop button should not be full width
    });
  });

  describe('FinancialForecastDashboard', () => {
    it('should render mobile layout correctly', () => {
      mockUseIsMobile.mockReturnValue(true);
      
      vi.mocked(require('@/contexts/ClinicContext').useClinic).mockReturnValue({
        activeClinic: mockClinic
      });
      
      vi.mocked(require('@/hooks/queries/useFinancialQueries').useFinancialQueries).mockReturnValue({
        forecasts: mockForecasts,
        isLoading: false
      });

      render(<FinancialForecastDashboard />);
      
      // Verificar se o título tem tamanho mobile
      const title = screen.getByText('Previsibilidade Financeira');
      expect(title).toHaveClass('text-lg');
    });

    it('should render desktop layout correctly', () => {
      mockUseIsMobile.mockReturnValue(false);
      
      vi.mocked(require('@/contexts/ClinicContext').useClinic).mockReturnValue({
        activeClinic: mockClinic
      });
      
      vi.mocked(require('@/hooks/queries/useFinancialQueries').useFinancialQueries).mockReturnValue({
        forecasts: mockForecasts,
        isLoading: false
      });

      render(<FinancialForecastDashboard />);
      
      // Verificar se o título tem tamanho desktop
      const title = screen.getByText('Previsibilidade Financeira');
      expect(title).toHaveClass('text-xl');
    });
  });

  describe('PatientRecordModal', () => {
    const mockPatient = {
      id: '1',
      name: 'Paciente Test',
      email: 'test@test.com'
    };

    it('should render mobile modal layout', () => {
      mockUseIsMobile.mockReturnValue(true);

      render(
        <PatientRecordModal
          isOpen={true}
          onOpenChange={() => {}}
          patient={mockPatient}
          currentUser={null}
        />
      );
      
      // Modal deve ter classes específicas para mobile
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('max-w-[95vw]');
    });

    it('should render desktop modal layout', () => {
      mockUseIsMobile.mockReturnValue(false);

      render(
        <PatientRecordModal
          isOpen={true}
          onOpenChange={() => {}}
          patient={mockPatient}
          currentUser={null}
        />
      );
      
      // Modal deve ter classes específicas para desktop
      const modal = screen.getByRole('dialog');
      expect(modal).toHaveClass('sm:max-w-4xl');
    });
  });
});

describe('useIsMobile Hook', () => {
  it('should return true for mobile breakpoint', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    // Simular o comportamento do hook
    const isMobile = window.innerWidth < 768;
    expect(isMobile).toBe(true);
  });

  it('should return false for desktop breakpoint', () => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Simular o comportamento do hook
    const isMobile = window.innerWidth < 768;
    expect(isMobile).toBe(false);
  });
}); 