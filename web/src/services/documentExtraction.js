export const MAX_DOCUMENT_FILES = 5;
export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_DOCUMENT_BATCH_SIZE = 25 * 1024 * 1024;
export const MAX_DOCUMENT_TEXT_LENGTH = 10000;
export const MAX_PDF_PAGES = 30;

const imageTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/bmp', 'image/tiff']);
const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tif', 'tiff']);

function getDocumentType(file) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (file.type === 'application/pdf' || extension === 'pdf') return 'pdf';
  if (imageTypes.has(file.type) || imageExtensions.has(extension)) return 'image';
  return null;
}

export function validateDocumentFiles(files) {
  if (!files.length) throw new Error('Select one or more PDF or image files.');
  if (files.length > MAX_DOCUMENT_FILES) {
    throw new Error(`Choose up to ${MAX_DOCUMENT_FILES} files per batch.`);
  }

  let batchSize = 0;
  files.forEach((file) => {
    if (!getDocumentType(file)) {
      throw new Error(`${file.name}: choose a PDF or a PNG, JPEG, WebP, BMP, or TIFF image.`);
    }
    if (file.size === 0) throw new Error(`${file.name}: this file is empty.`);
    if (file.size > MAX_DOCUMENT_FILE_SIZE) {
      throw new Error(`${file.name}: files must be 10 MB or smaller.`);
    }
    batchSize += file.size;
  });
  if (batchSize > MAX_DOCUMENT_BATCH_SIZE) {
    throw new Error('Selected files must total 25 MB or less.');
  }
}

function reportProgress(onProgress, message, progress) {
  onProgress?.({ message, progress });
}

async function extractPdf(file, fileIndex, fileCount, onProgress) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;

  try {
    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new Error(`PDFs may contain up to ${MAX_PDF_PAGES} pages.`);
    }
    const pages = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      reportProgress(
        onProgress,
        `Reading PDF ${fileIndex + 1}/${fileCount}: ${file.name} (page ${pageNumber}/${pdf.numPages})`,
        Math.round((pageNumber / pdf.numPages) * 100)
      );
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => `${item.str}${item.hasEOL ? '\n' : ' '}`)
        .join('')
        .replace(/[ \t]+/g, ' ')
        .trim();
      if (pageText) pages.push(pageText);
    }
    const text = pages.join('\n\n').trim();
    if (!text) {
      throw new Error('No selectable text was found. Scanned PDFs need to be converted to images before import.');
    }
    return text;
  } finally {
    await pdf.destroy();
  }
}

async function extractImages(files, fileIndexes, onProgress) {
  const { createWorker } = await import('tesseract.js');
  let activeFileIndex = fileIndexes[0];
  const worker = await createWorker('eng', 1, {
    logger: (status) => {
      const fileIndex = activeFileIndex;
      const file = files[fileIndex];
      if (status.status === 'recognizing text' && Number.isFinite(status.progress)) {
        const batchProgress = ((fileIndexes.indexOf(fileIndex) + status.progress) / fileIndexes.length) * 100;
        reportProgress(
          onProgress,
          `Recognizing text in image ${fileIndex + 1}/${files.length}: ${file.name}`,
          Math.round(batchProgress)
        );
      } else if (status.status === 'loading language traineddata') {
        reportProgress(onProgress, 'Downloading OCR language data…');
      } else if (status.status === 'loading tesseract core') {
        reportProgress(onProgress, 'Preparing local OCR runtime…');
      }
    }
  });

  try {
    const extracted = new Map();
    for (const fileIndex of fileIndexes) {
      activeFileIndex = fileIndex;
      const file = files[fileIndex];
      reportProgress(onProgress, `Recognizing text in image ${fileIndex + 1}/${files.length}: ${file.name}`);
      try {
        const result = await worker.recognize(file);
        const text = result.data.text.trim();
        if (!text) throw new Error('No readable text was found in this image.');
        extracted.set(fileIndex, text);
      } catch (error) {
        throw new Error(`${file.name}: ${error.message || 'Could not recognize text.'}`);
      }
    }
    return extracted;
  } finally {
    await worker.terminate();
  }
}

export async function extractDocuments(files, onProgress) {
  const selectedFiles = Array.from(files);
  validateDocumentFiles(selectedFiles);
  const extracted = new Array(selectedFiles.length);
  const imageIndexes = [];

  for (let index = 0; index < selectedFiles.length; index += 1) {
    if (getDocumentType(selectedFiles[index]) === 'image') {
      imageIndexes.push(index);
      continue;
    }
    try {
      extracted[index] = {
        name: selectedFiles[index].name,
        type: 'PDF',
        text: await extractPdf(selectedFiles[index], index, selectedFiles.length, onProgress)
      };
    } catch (error) {
      throw new Error(`${selectedFiles[index].name}: ${error.message || 'Could not read this PDF.'}`);
    }
  }

  if (imageIndexes.length) {
    const imageText = await extractImages(selectedFiles, imageIndexes, onProgress);
    imageIndexes.forEach((index) => {
      extracted[index] = {
        name: selectedFiles[index].name,
        type: 'Image (English OCR)',
        text: imageText.get(index)
      };
    });
  }

  const extractedText = extracted.map((document) => document.text).join('\n\n');
  if (extractedText.length > MAX_DOCUMENT_TEXT_LENGTH) {
    throw new Error(`Extracted text is over the ${MAX_DOCUMENT_TEXT_LENGTH.toLocaleString()} character limit. Select fewer or shorter files.`);
  }
  reportProgress(onProgress, 'Local document extraction complete', 100);
  return extracted;
}
