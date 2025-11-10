import { describe, it, expect } from 'vitest';
import {
  parseColombianCurrency,
  parseAge,
  parseCivilStatus,
  parseChildrenCount,
  parseFullName,
  parseOnboardingResponse,
} from '@/lib/parsers/onboarding-parser';

describe('parseColombianCurrency', () => {
  describe('millions format', () => {
    it('should parse "10 millones" correctly', () => {
      expect(parseColombianCurrency('10 millones')).toBe(10000000);
    });

    it('should parse "5.5 millones" correctly', () => {
      expect(parseColombianCurrency('5.5 millones')).toBe(5500000);
    });

    it('should parse "1 millon" (singular) correctly', () => {
      expect(parseColombianCurrency('1 millon')).toBe(1000000);
    });

    it('should parse "Gano 15 millones al mes" correctly', () => {
      expect(parseColombianCurrency('Gano 15 millones al mes')).toBe(15000000);
    });
  });

  describe('thousands format', () => {
    it('should parse "500 mil" correctly', () => {
      expect(parseColombianCurrency('500 mil')).toBe(500000);
    });

    it('should parse "1.5 mil" correctly', () => {
      expect(parseColombianCurrency('1.5 mil')).toBe(1500);
    });
  });

  describe('numeric formats', () => {
    it('should parse "$10.000.000 COP" correctly', () => {
      expect(parseColombianCurrency('$10.000.000 COP')).toBe(10000000);
    });

    it('should parse "10,000,000" correctly', () => {
      expect(parseColombianCurrency('10,000,000')).toBe(10000000);
    });

    it('should parse "5000000" correctly', () => {
      expect(parseColombianCurrency('5000000')).toBe(5000000);
    });

    it('should parse "$3.500.000 pesos" correctly', () => {
      expect(parseColombianCurrency('$3.500.000 pesos')).toBe(3500000);
    });
  });

  describe('small numbers interpretation', () => {
    it('should interpret "10" as 10 million', () => {
      expect(parseColombianCurrency('10')).toBe(10000000);
    });

    it('should interpret "5.5" as 5.5 million', () => {
      expect(parseColombianCurrency('5.5')).toBe(5500000);
    });
  });

  describe('edge cases', () => {
    it('should return null for empty string', () => {
      expect(parseColombianCurrency('')).toBe(null);
    });

    it('should return null for non-string input', () => {
      expect(parseColombianCurrency(null as any)).toBe(null);
    });

    it('should return null for text without numbers', () => {
      expect(parseColombianCurrency('No tengo ingresos')).toBe(null);
    });
  });
});

describe('parseAge', () => {
  describe('valid ages', () => {
    it('should parse "25" correctly', () => {
      expect(parseAge('25')).toBe(25);
    });

    it('should parse "Tengo 30 años" correctly', () => {
      expect(parseAge('Tengo 30 años')).toBe(30);
    });

    it('should parse minimum valid age (18)', () => {
      expect(parseAge('18')).toBe(18);
    });

    it('should parse maximum valid age (100)', () => {
      expect(parseAge('100')).toBe(100);
    });

    it('should parse age from complex text', () => {
      expect(parseAge('Mi edad es 45, casi 46')).toBe(45);
    });
  });

  describe('invalid ages', () => {
    it('should return null for age below 18', () => {
      expect(parseAge('17')).toBe(null);
    });

    it('should return null for age above 100', () => {
      expect(parseAge('101')).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(parseAge('')).toBe(null);
    });

    it('should return null for non-string input', () => {
      expect(parseAge(null as any)).toBe(null);
    });

    it('should return null for text without numbers', () => {
      expect(parseAge('No quiero decir')).toBe(null);
    });
  });
});

describe('parseCivilStatus', () => {
  describe('soltero variations', () => {
    it('should parse "soltero" correctly', () => {
      expect(parseCivilStatus('soltero')).toBe('soltero');
    });

    it('should parse "soltera" correctly', () => {
      expect(parseCivilStatus('soltera')).toBe('soltero');
    });

    it('should parse "single" correctly', () => {
      expect(parseCivilStatus('single')).toBe('soltero');
    });

    it('should parse "Soy soltero" correctly', () => {
      expect(parseCivilStatus('Soy soltero')).toBe('soltero');
    });
  });

  describe('casado variations', () => {
    it('should parse "casado" correctly', () => {
      expect(parseCivilStatus('casado')).toBe('casado');
    });

    it('should parse "casada" correctly', () => {
      expect(parseCivilStatus('casada')).toBe('casado');
    });

    it('should parse "married" correctly', () => {
      expect(parseCivilStatus('married')).toBe('casado');
    });
  });

  describe('union libre variations', () => {
    it('should parse "union libre" correctly', () => {
      expect(parseCivilStatus('union libre')).toBe('union_libre');
    });

    it('should parse "unión libre" correctly', () => {
      expect(parseCivilStatus('unión libre')).toBe('union_libre');
    });

    it('should parse "union_libre" correctly', () => {
      expect(parseCivilStatus('union_libre')).toBe('union_libre');
    });
  });

  describe('divorciado variations', () => {
    it('should parse "divorciado" correctly', () => {
      expect(parseCivilStatus('divorciado')).toBe('divorciado');
    });

    it('should parse "divorciada" correctly', () => {
      expect(parseCivilStatus('divorciada')).toBe('divorciado');
    });

    it('should parse "divorced" correctly', () => {
      expect(parseCivilStatus('divorced')).toBe('divorciado');
    });
  });

  describe('viudo variations', () => {
    it('should parse "viudo" correctly', () => {
      expect(parseCivilStatus('viudo')).toBe('viudo');
    });

    it('should parse "viuda" correctly', () => {
      expect(parseCivilStatus('viuda')).toBe('viudo');
    });

    it('should parse "widowed" correctly', () => {
      expect(parseCivilStatus('widowed')).toBe('viudo');
    });
  });

  describe('edge cases', () => {
    it('should return null for empty string', () => {
      expect(parseCivilStatus('')).toBe(null);
    });

    it('should return null for non-string input', () => {
      expect(parseCivilStatus(null as any)).toBe(null);
    });

    it('should return null for unrecognized status', () => {
      expect(parseCivilStatus('complicado')).toBe(null);
    });
  });
});

describe('parseChildrenCount', () => {
  describe('explicit zero', () => {
    it('should parse "no tengo" as 0', () => {
      expect(parseChildrenCount('no tengo')).toBe(0);
    });

    it('should parse "ninguno" as 0', () => {
      expect(parseChildrenCount('ninguno')).toBe(0);
    });

    it('should parse "cero" as 0', () => {
      expect(parseChildrenCount('cero')).toBe(0);
    });

    it('should parse "No tengo hijos" as 0', () => {
      expect(parseChildrenCount('No tengo hijos')).toBe(0);
    });
  });

  describe('numeric values', () => {
    it('should parse "1" correctly', () => {
      expect(parseChildrenCount('1')).toBe(1);
    });

    it('should parse "3" correctly', () => {
      expect(parseChildrenCount('3')).toBe(3);
    });

    it('should parse "Tengo 2 hijos" correctly', () => {
      expect(parseChildrenCount('Tengo 2 hijos')).toBe(2);
    });

    it('should parse maximum valid count (20)', () => {
      expect(parseChildrenCount('20')).toBe(20);
    });
  });

  describe('invalid cases', () => {
    it('should return null for count above 20', () => {
      expect(parseChildrenCount('25')).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(parseChildrenCount('')).toBe(null);
    });

    it('should return null for non-string input', () => {
      expect(parseChildrenCount(null as any)).toBe(null);
    });

    it('should return null for text without numbers or special phrases', () => {
      expect(parseChildrenCount('muchos')).toBe(null);
    });
  });
});

describe('parseFullName', () => {
  describe('capitalization', () => {
    it('should capitalize "juan perez" correctly', () => {
      expect(parseFullName('juan perez')).toBe('Juan Perez');
    });

    it('should capitalize "MARIA RODRIGUEZ" correctly', () => {
      expect(parseFullName('MARIA RODRIGUEZ')).toBe('Maria Rodriguez');
    });

    it('should handle "JuAn PeReZ" correctly', () => {
      expect(parseFullName('JuAn PeReZ')).toBe('Juan Perez');
    });
  });

  describe('compound names', () => {
    it('should handle compound first name correctly', () => {
      expect(parseFullName('juan carlos martinez')).toBe('Juan Carlos Martinez');
    });

    it('should handle multiple surnames correctly', () => {
      expect(parseFullName('maria jose lopez garcia')).toBe('Maria Jose Lopez Garcia');
    });
  });

  describe('whitespace handling', () => {
    it('should trim leading/trailing spaces', () => {
      expect(parseFullName('  juan perez  ')).toBe('Juan Perez');
    });

    it('should handle multiple spaces between words', () => {
      expect(parseFullName('juan  perez')).toBe('Juan  Perez');
    });
  });

  describe('edge cases', () => {
    it('should return null for empty string', () => {
      expect(parseFullName('')).toBe(null);
    });

    it('should return null for non-string input', () => {
      expect(parseFullName(null as any)).toBe(null);
    });

    it('should handle single name', () => {
      expect(parseFullName('juan')).toBe('Juan');
    });
  });
});

describe('parseOnboardingResponse - Integration tests', () => {
  it('should parse question 1 (full name) correctly', () => {
    const result = parseOnboardingResponse(1, 'juan perez');
    expect(result).toEqual({ full_name: 'Juan Perez' });
  });

  it('should parse question 2 (age) correctly', () => {
    const result = parseOnboardingResponse(2, 'Tengo 30 años');
    expect(result).toEqual({ age: 30 });
  });

  it('should parse question 3 (civil status) correctly', () => {
    const result = parseOnboardingResponse(3, 'soltero');
    expect(result).toEqual({ civil_status: 'soltero' });
  });

  it('should parse question 4 (children) correctly', () => {
    const result = parseOnboardingResponse(4, 'Tengo 2 hijos');
    expect(result).toEqual({ children_count: 2 });
  });

  it('should parse question 5 (income) correctly', () => {
    const result = parseOnboardingResponse(5, '10 millones');
    expect(result).toEqual({ monthly_income: 10000000 });
  });

  it('should parse question 6 (expenses) correctly', () => {
    const result = parseOnboardingResponse(6, '5 millones');
    expect(result).toEqual({ monthly_expenses: 5000000 });
  });

  it('should parse question 7 (assets) correctly', () => {
    const result = parseOnboardingResponse(7, '100 millones');
    expect(result).toEqual({ total_assets: 100000000 });
  });

  it('should parse question 8 (liabilities) correctly', () => {
    const result = parseOnboardingResponse(8, '20 millones');
    expect(result).toEqual({ total_liabilities: 20000000 });
  });

  it('should parse question 9 (savings) correctly', () => {
    const result = parseOnboardingResponse(9, '15 millones');
    expect(result).toEqual({ total_savings: 15000000 });
  });

  it('should return empty object for unknown question number', () => {
    const result = parseOnboardingResponse(99, 'cualquier respuesta');
    expect(result).toEqual({});
  });

  it('should handle unparseable responses with undefined values', () => {
    const result = parseOnboardingResponse(2, 'no sé');
    expect(result).toEqual({ age: undefined });
  });
});
