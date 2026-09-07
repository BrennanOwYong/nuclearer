import { describe, it, expect, vi, beforeEach } from 'vitest';

const createMock = vi.fn();

vi.mock('openai', () => {
  return {
    default: class {
      chat = { completions: { create: createMock } };
    },
  };
});

describe('callModel', () => {
  beforeEach(() => {
    vi.resetModules();
    createMock.mockReset();
    process.env.OPENAI_API_KEY = 'test-key';
    delete process.env.OPENAI_MODEL;
  });

  it('sends messages and returns the assistant content', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'hello world' } }] });
    const { callModel } = await import('./openai');

    const out = await callModel([{ role: 'user', content: 'hi' }]);

    expect(createMock).toHaveBeenCalledTimes(1);
    const arg = createMock.mock.calls[0][0];
    expect(arg.messages).toEqual([{ role: 'user', content: 'hi' }]);
    expect(out).toBe('hello world');
  });

  it('defaults the model to gpt-5-mini when OPENAI_MODEL is unset', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: 'x' } }] });
    const { callModel } = await import('./openai');

    await callModel([{ role: 'user', content: 'hi' }]);

    expect(createMock.mock.calls[0][0].model).toBe('gpt-5-mini');
  });

  it('uses OPENAI_MODEL when set, and passes json opts as response_format', async () => {
    process.env.OPENAI_MODEL = 'gpt-test';
    createMock.mockResolvedValue({ choices: [{ message: { content: '{}' } }] });
    const { callModel } = await import('./openai');

    await callModel([{ role: 'user', content: 'hi' }], { json: true });

    const arg = createMock.mock.calls[0][0];
    expect(arg.model).toBe('gpt-test');
    expect(arg.response_format).toEqual({ type: 'json_object' });
  });

  it('returns empty string when the model returns no content', async () => {
    createMock.mockResolvedValue({ choices: [{ message: { content: null } }] });
    const { callModel } = await import('./openai');

    const out = await callModel([{ role: 'user', content: 'hi' }]);
    expect(out).toBe('');
  });
});
