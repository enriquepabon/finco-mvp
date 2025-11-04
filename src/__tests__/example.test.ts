import { describe, it, expect } from 'vitest';

describe('Testing Setup', () => {
  it('should pass basic assertion', () => {
    expect(true).toBe(true);
  });

  it('should perform basic math', () => {
    expect(2 + 2).toBe(4);
  });

  it('should work with objects', () => {
    const obj = { name: 'FINCO', version: '1.0' };
    expect(obj).toHaveProperty('name');
    expect(obj.name).toBe('FINCO');
  });

  it('should work with arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });
});
