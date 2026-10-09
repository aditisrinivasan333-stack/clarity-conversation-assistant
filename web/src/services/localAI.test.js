jest.mock('@huggingface/transformers', () => ({
  pipeline: jest.fn()
}));

import { getGeneratedContent, parseAnalysis } from './localAI';

describe('local model response handling', () => {
  test('reads assistant content from chat-style generation output', () => {
    expect(getGeneratedContent([{
      generated_text: [
        { role: 'user', content: 'Summarize this' },
        { role: 'assistant', content: '{"summary":"The team agreed to meet.","keyPoints":[]}' }
      ]
    }])).toBe('{"summary":"The team agreed to meet.","keyPoints":[]}');
  });

  test('parses JSON with surrounding markdown and accepts common field variants', () => {
    const analysis = parseAnalysis('```json\n{"summary":"They resolved the issue.","key_points":["The fix shipped."],"sentiment":{"overall":"positive"},"emotion":{"label":"relieved","intensity":120}}\n```');
    expect(analysis.summary).toBe('They resolved the issue.');
    expect(analysis.keyPoints).toEqual(['The fix shipped.']);
    expect(analysis.sentiment.overall).toBe('positive');
    expect(analysis.emotions).toEqual([
      { emotion: 'relieved', intensity: 100, sentiment: 'positive' }
    ]);
  });

  test('rejects malformed or missing summary JSON rather than showing raw output as a summary', () => {
    expect(() => parseAnalysis('{"summary":')).toThrow('could not format its analysis');
    expect(() => parseAnalysis('The conversation was helpful.')).toThrow('could not format its analysis');
  });
});
