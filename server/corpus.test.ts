import { describe, it, expect } from 'vitest';
import { loadCorpus, CorpusNotFoundError } from './corpus';

describe('loadCorpus stub', () => {
  it('always throws CorpusNotFoundError (F3 implements the real lookup)', () => {
    expect(() => loadCorpus('USA', 'US-WY')).toThrow(CorpusNotFoundError);
  });

  it('error carries the requested country and regionId', () => {
    try {
      loadCorpus('AUS', 'AU-NT');
      throw new Error('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(CorpusNotFoundError);
      const err = e as CorpusNotFoundError;
      expect(err.country).toBe('AUS');
      expect(err.regionId).toBe('AU-NT');
      expect(err.name).toBe('CorpusNotFoundError');
    }
  });
});
