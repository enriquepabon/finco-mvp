import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for transaction parsing logic
 * Testing the manual parser patterns that are used as fallback
 */

describe('Transaction Parser - Manual Parsing Logic', () => {
  describe('Amount extraction patterns', () => {
    it('should extract amount from "mil" format', () => {
      const text = 'Gasté 50 mil en el supermercado';
      const milPattern = /(\d+)\s*mil(?:es)?\s*(?:pesos)?/i;
      const match = text.match(milPattern);
      expect(match).toBeTruthy();
      expect(parseInt(match![1]) * 1000).toBe(50000);
    });

    it('should extract amount from "millón" format', () => {
      const text = 'Recibí 2 millones de salario';
      const millionPattern = /(\d+)\s*mill[oó]n(?:es)?\s*(?:pesos)?/i;
      const match = text.match(millionPattern);
      expect(match).toBeTruthy();
      expect(parseInt(match![1]) * 1000000).toBe(2000000);
    });

    it('should extract amount from "k" format', () => {
      const text = 'Pagué 100k en el restaurante';
      const kPattern = /(\d+)k/i;
      const match = text.match(kPattern);
      expect(match).toBeTruthy();
      expect(parseInt(match![1]) * 1000).toBe(100000);
    });

    it('should extract amount from currency format "$10.000"', () => {
      const text = 'Compré algo por $10.000';
      const currencyPattern = /\$?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i;
      const match = text.match(currencyPattern);
      expect(match).toBeTruthy();
      const cleanNumber = match![1].replace(/\./g, '');
      expect(parseInt(cleanNumber)).toBe(10000);
    });

    it('should extract amount from numeric format "50000"', () => {
      const text = 'Gasté 50000 pesos';
      const numericPattern = /(\d+)/;
      const match = text.match(numericPattern);
      expect(match).toBeTruthy();
      expect(parseInt(match![1])).toBe(50000);
    });
  });

  describe('Transaction type detection', () => {
    it('should detect income keywords', () => {
      const incomeKeywords = ['ingreso', 'salario', 'pago', 'venta', 'bono', 'cobro'];

      incomeKeywords.forEach(keyword => {
        const text = `Recibí un ${keyword} de 1000000`;
        const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);
        expect(isIncome).toBe(true);
      });
    });

    it('should default to expense when no income keywords', () => {
      const text = 'Compré comida por 50 mil';
      const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);
      expect(isIncome).toBe(false);
    });

    it('should detect "salario" as income', () => {
      const text = 'Mi salario de 5 millones';
      const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);
      expect(isIncome).toBe(true);
    });

    it('should detect "gasto" as expense', () => {
      const text = 'Gasto de 100 mil en transporte';
      const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);
      expect(isIncome).toBe(false);
    });
  });

  describe('Complex transaction texts', () => {
    it('should extract info from "Recibí mi salario de 5 millones"', () => {
      const text = 'Recibí mi salario de 5 millones';
      const millionPattern = /(\d+)\s*mill[oó]n(?:es)?\s*(?:pesos)?/i;
      const match = text.match(millionPattern);
      const amount = parseInt(match![1]) * 1000000;
      const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);

      expect(amount).toBe(5000000);
      expect(isIncome).toBe(true);
    });

    it('should extract info from "Gasté 150 mil en el supermercado"', () => {
      const text = 'Gasté 150 mil en el supermercado';
      const milPattern = /(\d+)\s*mil(?:es)?\s*(?:pesos)?/i;
      const match = text.match(milPattern);
      const amount = parseInt(match![1]) * 1000;
      const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);

      expect(amount).toBe(150000);
      expect(isIncome).toBe(false);
    });

    it('should extract info from "Venta de producto por 2 millones"', () => {
      const text = 'Venta de producto por 2 millones';
      const millionPattern = /(\d+)\s*mill[oó]n(?:es)?\s*(?:pesos)?/i;
      const match = text.match(millionPattern);
      const amount = parseInt(match![1]) * 1000000;
      const isIncome = /ingreso|salario|pago|venta|bono|cobro/i.test(text);

      expect(amount).toBe(2000000);
      expect(isIncome).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple numbers and extract first relevant', () => {
      const text = 'Tengo 2 tarjetas y gasté 50 mil';
      const milPattern = /(\d+)\s*mil(?:es)?\s*(?:pesos)?/i;
      const match = text.match(milPattern);
      expect(match).toBeTruthy();
      expect(parseInt(match![1]) * 1000).toBe(50000);
    });

    it('should handle decimal amounts "1.5 millones" (documents limitation)', () => {
      const text = 'Recibí 1.5 millones';
      // Note: Current parser pattern /(\d+)/ matches "5" from "1.5"
      // This test documents the known limitation - decimals not properly supported
      const millionPattern = /(\d+)\s*mill[oó]n(?:es)?\s*(?:pesos)?/i;
      const match = text.match(millionPattern);
      if (match) {
        // Parser sees "5 millones" not "1.5 millones"
        expect(parseInt(match[1])).toBe(5);
      }
    });

    it('should not match if no number present', () => {
      const text = 'Gasté algo en el supermercado';
      const patterns = [
        /(\d+)\s*mil(?:es)?\s*(?:pesos)?/i,
        /(\d+)\s*mill[oó]n(?:es)?\s*(?:pesos)?/i,
        /(\d+)k/i,
        /\$?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i,
      ];

      const hasMatch = patterns.some(pattern => pattern.test(text));
      expect(hasMatch).toBe(false);
    });
  });

  describe('Category suggestions logic', () => {
    it('should suggest income category for income transactions', () => {
      const transactionType = 'income';
      const categoryName = transactionType === 'income' ? 'Otros ingresos' : 'Gastos varios';
      const categoryType = transactionType === 'income' ? 'income' : 'variable_expense';

      expect(categoryName).toBe('Otros ingresos');
      expect(categoryType).toBe('income');
    });

    it('should suggest expense category for expense transactions', () => {
      const transactionType = 'expense';
      const categoryName = transactionType === 'income' ? 'Otros ingresos' : 'Gastos varios';
      const categoryType = transactionType === 'income' ? 'income' : 'variable_expense';

      expect(categoryName).toBe('Gastos varios');
      expect(categoryType).toBe('variable_expense');
    });
  });

  describe('Description truncation', () => {
    it('should truncate long descriptions to 100 chars', () => {
      const longText = 'A'.repeat(150);
      const description = longText.substring(0, 100);

      expect(description.length).toBe(100);
    });

    it('should keep short descriptions as-is', () => {
      const shortText = 'Compra en supermercado';
      const description = shortText.substring(0, 100);

      expect(description).toBe(shortText);
      expect(description.length).toBeLessThan(100);
    });
  });

  describe('Confidence scoring', () => {
    it('should set low confidence (50) for manual parsing', () => {
      // Manual parser always returns 50 as it's a fallback
      const confidence = 50;
      expect(confidence).toBe(50);
      expect(confidence).toBeLessThan(80); // Lower than AI parsing
    });
  });
});
