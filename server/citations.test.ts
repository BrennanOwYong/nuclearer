import { describe, it, expect } from 'vitest';
import { extractCitationIds } from './citations';

const valid = new Set(['au-epbc-140a', 'us-nrc-10cfr100', 'us-clean-water-act']);

describe('extractCitationIds', () => {
  it('extracts a single matching token', () => {
    expect(extractCitationIds('Banned by federal law [au-epbc-140a].', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('extracts multiple tokens preserving first-seen order', () => {
    expect(extractCitationIds('See [us-nrc-10cfr100] and [us-clean-water-act].', valid))
      .toEqual(['us-nrc-10cfr100', 'us-clean-water-act']);
  });

  it('drops tokens that are not in validIds', () => {
    expect(extractCitationIds('Per [made-up-source] and [au-epbc-140a].', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('de-duplicates repeated tokens', () => {
    expect(extractCitationIds('[au-epbc-140a] ... again [au-epbc-140a].', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('trims whitespace inside the brackets', () => {
    expect(extractCitationIds('cite [ au-epbc-140a ] here', valid))
      .toEqual(['au-epbc-140a']);
  });

  it('returns an empty array when there are no tokens', () => {
    expect(extractCitationIds('No citations here.', valid)).toEqual([]);
    expect(extractCitationIds('', valid)).toEqual([]);
  });

  it('accepts an array of valid ids as well as a Set', () => {
    expect(extractCitationIds('[us-nrc-10cfr100]', ['us-nrc-10cfr100']))
      .toEqual(['us-nrc-10cfr100']);
  });
});
