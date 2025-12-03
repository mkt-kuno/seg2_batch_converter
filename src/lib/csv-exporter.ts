/**
 * CSV Exporter for SEG2 data
 * Generates oscilloscope-style CSV with header metadata
 */

import { SEG2Parser } from './seg2-parser';

export interface CSVExportOptions {
  includeTimeColumn?: boolean;
  filename?: string;
}

/**
 * Generate CSV content from SEG2 parser
 */
export function generateCSV(
  parser: SEG2Parser,
  options: CSVExportOptions = {}
): string {
  const { includeTimeColumn = true } = options;
  
  const frequency = parser.getFrequency();
  const sampleInterval = parser.getSampleInterval() || (frequency > 0 ? 1 / frequency : 0);
  const numChannels = parser.getMaxChannels();
  const sampleCount = parser.getSampleCount();
  const freeStrings = parser.getFreeStrings();
  
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // Build header lines (oscilloscope-style)
  const headerLines: string[] = [
    '# SEG2 Data Export',
    `# Export Date: ${now}`,
    '# Format: SEG2',
    '#',
    '# === Acquisition Settings ===',
    `# Sampling Frequency: ${frequency} Hz`,
    `# Sample Interval: ${sampleInterval} s`,
    `# Number of Samples: ${sampleCount}`,
    `# Number of Channels: ${numChannels}`,
    `# Record Length: ${(sampleCount * sampleInterval).toFixed(6)} s`,
    '#',
  ];
  
  // Add SEG2 metadata
  if (freeStrings.length > 0) {
    headerLines.push('# === SEG2 Metadata ===');
    freeStrings.slice(0, 10).forEach(fs => {
      headerLines.push(`# ${fs}`);
    });
    headerLines.push('#');
  }
  
  // Column headers
  const columnHeaders: string[] = [];
  if (includeTimeColumn) {
    columnHeaders.push('Time(s)');
  }
  for (let i = 0; i < numChannels; i++) {
    columnHeaders.push(`CH${i + 1}`);
  }
  headerLines.push(columnHeaders.join(','));
  
  // Get all channel data
  const allData = parser.getAllChannelsData();
  
  // Build data rows
  const dataRows: string[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const row: string[] = [];
    
    if (includeTimeColumn) {
      row.push((i * sampleInterval).toFixed(9));
    }
    
    for (const channelData of allData) {
      if (i < channelData.length) {
        row.push(String(channelData[i]));
      } else {
        row.push('');
      }
    }
    
    dataRows.push(row.join(','));
  }
  
  return [...headerLines, ...dataRows].join('\n');
}

/**
 * Download CSV as a file
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Save CSV using File System Access API (Chrome/Edge)
 */
export async function saveCSVWithPicker(
  content: string,
  suggestedName: string
): Promise<boolean> {
  // Check if File System Access API is available
  if (!('showSaveFilePicker' in window)) {
    // Fallback to download
    downloadCSV(content, suggestedName);
    return true;
  }
  
  try {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'CSV Files',
          accept: { 'text/csv': ['.csv'] },
        },
      ],
    });
    
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    
    return true;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      // User cancelled
      return false;
    }
    throw err;
  }
}

/**
 * Batch convert and save to directory (using File System Access API)
 */
export async function batchSaveCSV(
  files: { parser: SEG2Parser; filename: string }[],
  directoryHandle?: FileSystemDirectoryHandle
): Promise<{ success: string[]; failed: { filename: string; error: string }[] }> {
  const results = {
    success: [] as string[],
    failed: [] as { filename: string; error: string }[],
  };
  
  for (const { parser, filename } of files) {
    try {
      const csvContent = generateCSV(parser);
      const csvFilename = filename.replace(/\.[^.]+$/, '.csv');
      
      if (directoryHandle) {
        // Save to selected directory
        const fileHandle = await directoryHandle.getFileHandle(csvFilename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(csvContent);
        await writable.close();
      } else {
        // Download individually
        downloadCSV(csvContent, csvFilename);
      }
      
      results.success.push(csvFilename);
    } catch (err: any) {
      results.failed.push({
        filename,
        error: err.message || 'Unknown error',
      });
    }
  }
  
  return results;
}
