jest.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  version: '4.10.38',
  GlobalWorkerOptions: {},
  getDocument: jest.fn()
}));

jest.mock('tesseract.js', () => ({
  createWorker: jest.fn()
}));

import { createWorker } from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
  extractDocuments,
  MAX_DOCUMENT_FILES,
  MAX_DOCUMENT_FILE_SIZE,
  validateDocumentFiles
} from './documentExtraction';

const makeFile = (name, size, type) => ({ name, size, type });

describe('document upload limits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('accepts PDF and supported image files', () => {
    expect(() => validateDocumentFiles([
      makeFile('notes.pdf', 100, 'application/pdf'),
      makeFile('photo.png', 100, 'image/png')
    ])).not.toThrow();
  });

  test('rejects batches over the file count limit', () => {
    const files = Array.from({ length: MAX_DOCUMENT_FILES + 1 }, (_, index) =>
      makeFile(`image-${index}.png`, 100, 'image/png')
    );
    expect(() => validateDocumentFiles(files)).toThrow(`up to ${MAX_DOCUMENT_FILES} files`);
  });

  test('rejects unsupported, empty, and oversized files with useful errors', () => {
    expect(() => validateDocumentFiles([makeFile('notes.docx', 100, '')]))
      .toThrow('choose a PDF or');
    expect(() => validateDocumentFiles([makeFile('empty.pdf', 0, 'application/pdf')]))
      .toThrow('file is empty');
    expect(() => validateDocumentFiles([
      makeFile('large.pdf', MAX_DOCUMENT_FILE_SIZE + 1, 'application/pdf')
    ])).toThrow('10 MB or smaller');
  });

  test('extracts selectable PDF text using PDF.js and destroys the document', async () => {
    const page = {
      getTextContent: jest.fn().mockResolvedValue({
        items: [{ str: 'Local PDF text', hasEOL: true }]
      })
    };
    const pdf = {
      numPages: 1,
      getPage: jest.fn().mockResolvedValue(page),
      destroy: jest.fn().mockResolvedValue()
    };
    getDocument.mockReturnValue({ promise: Promise.resolve(pdf) });

    const documents = await extractDocuments([
      { ...makeFile('notes.pdf', 100, 'application/pdf'), arrayBuffer: async () => new ArrayBuffer(8) }
    ]);

    expect(documents[0]).toMatchObject({ name: 'notes.pdf', type: 'PDF', text: 'Local PDF text' });
    expect(GlobalWorkerOptions.workerSrc).toContain('/pdf.worker.min.mjs');
    expect(pdf.destroy).toHaveBeenCalled();
  });

  test('OCRs multiple selected images in-browser and terminates the worker', async () => {
    const worker = {
      recognize: jest.fn()
        .mockResolvedValueOnce({ data: { text: 'First image text' } })
        .mockResolvedValueOnce({ data: { text: 'Second image text' } }),
      terminate: jest.fn().mockResolvedValue()
    };
    createWorker.mockResolvedValue(worker);

    const documents = await extractDocuments([
      makeFile('first.png', 100, 'image/png'),
      makeFile('second.jpg', 100, 'image/jpeg')
    ]);

    expect(documents.map(({ text }) => text)).toEqual(['First image text', 'Second image text']);
    expect(createWorker).toHaveBeenCalledWith('eng', 1, expect.objectContaining({ logger: expect.any(Function) }));
    expect(worker.recognize).toHaveBeenCalledTimes(2);
    expect(worker.terminate).toHaveBeenCalled();
  });
});
