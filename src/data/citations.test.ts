import { describe, it, expect } from 'vitest';
import { usaCorpus } from './countries/usa';
import { polandCorpus } from './countries/poland';
import { australiaCorpus } from './countries/australia';
import { getReactors } from './index';

const PLACEHOLDER = /(example\.com|TODO|FIXME|placeholder|xxx|\bTBD\b|localhost|^https?:\/\/$)/i;

function assertCite(url: string, cite: string, where: string) {
  expect(url, `${where}: empty url`).toBeTruthy();
  expect(cite, `${where}: empty citation`).toBeTruthy();
  expect(url, `${where}: url must be http(s)`).toMatch(/^https?:\/\/.+\..+/);
  expect(PLACEHOLDER.test(url), `${where}: placeholder url "${url}"`).toBe(false);
  expect(PLACEHOLDER.test(cite), `${where}: placeholder citation "${cite}"`).toBe(false);
}

describe('citation integrity', () => {
  it('no corpus source has an empty or placeholder citation/url', () => {
    for (const c of [usaCorpus, polandCorpus, australiaCorpus]) {
      for (const s of c.sources) assertCite(s.url, s.citation, `${c.code}/${s.id}`);
    }
  });

  it('no reactor citation or companyUrl is empty or placeholder', () => {
    for (const m of getReactors()) {
      assertCite(m.citation.url, m.citation.citation, `reactor/${m.id}/citation`);
      // companyUrl must also be a real vendor URL (no second cite string to check)
      expect(m.companyUrl, `reactor/${m.id}: empty companyUrl`).toBeTruthy();
      expect(m.companyUrl, `reactor/${m.id}: companyUrl must be http(s)`).toMatch(/^https?:\/\/.+\..+/);
      expect(PLACEHOLDER.test(m.companyUrl), `reactor/${m.id}: placeholder companyUrl "${m.companyUrl}"`).toBe(false);
    }
  });
});
