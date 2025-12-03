/**
 * SEG2 File Parser
 * TypeScript implementation for browser/Node.js
 */

export interface SEG2FileInfo {
  filename: string;
  channels: number;
  frequency: number;
  sampleInterval: number;
  sampleCount: number;
  freeStrings: string[];
  valid: boolean;
  error?: string;
}

export interface SEG2ChannelData {
  channelIndex: number;
  samples: number[];
  dataFormat: number;
}

export class SEG2Parser {
  private data: DataView;
  private buffer: ArrayBuffer;
  private pointerList: number[] = [];
  private maxCh: number = 0;
  private frequency: number = 0;
  private sampleInterval: number = 0;
  private freeStrings: string[] = [];

  constructor(buffer: ArrayBuffer) {
    this.buffer = buffer;
    this.data = new DataView(buffer);
    this.parse();
  }

  private readUint16(offset: number): number {
    return this.data.getUint16(offset, true); // little-endian
  }

  private readInt32(offset: number): number {
    return this.data.getInt32(offset, true);
  }

  private readUint32(offset: number): number {
    return this.data.getUint32(offset, true);
  }

  private readFloat32(offset: number): number {
    return this.data.getFloat32(offset, true);
  }

  private readFloat64(offset: number): number {
    return this.data.getFloat64(offset, true);
  }

  private readInt16(offset: number): number {
    return this.data.getInt16(offset, true);
  }

  private parseStrings(from: number, to: number): string[] {
    const result: string[] = [];
    const bytes = new Uint8Array(this.buffer, from, to - from);
    
    let currentString = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        if (currentString.length > 1) {
          result.push(currentString);
        }
        currentString = '';
      } else {
        currentString += String.fromCharCode(bytes[i]);
      }
    }
    
    return result;
  }

  private parse(): void {
    // Check file descriptor magic number
    if (this.readUint16(0) !== 0x3a55) {
      throw new Error('Invalid SEG2 file: File Descriptor not found!');
    }

    let p = 2;
    
    // Revision
    const revision = this.readUint16(p);
    p += 2;
    
    // M (size of trace pointer sub-block)
    const m = this.readUint16(p);
    p += 2;
    
    // N (number of traces)
    const n = this.readUint16(p);
    p += 2;
    
    // Skip reserved bytes (0x08-0x1F)
    p += 0x08 + 0x10;
    
    // Read trace pointers
    this.pointerList = [];
    for (let i = 0; i < n; i++) {
      this.pointerList.push(this.readUint32(p));
      p += 4;
    }
    
    this.maxCh = this.pointerList.length;
    
    // Parse first channel to get frequency info
    if (this.maxCh > 0) {
      const channelData = this.parseTraceDescriptor(this.pointerList[0]);
      this.freeStrings = channelData.freeStrings;
      
      for (const fs of this.freeStrings) {
        if (fs.includes('SAMPLE_INTERVAL')) {
          const parts = fs.split(/\s+/);
          const idx = parts.indexOf('SAMPLE_INTERVAL');
          if (idx !== -1 && parts[idx + 1]) {
            this.sampleInterval = parseFloat(parts[idx + 1]);
            this.frequency = Math.round(1.0 / this.sampleInterval);
          }
        }
      }
    }
  }

  private parseTraceDescriptor(pointer: number): { samples: number[]; dataFormat: number; freeStrings: string[] } {
    let p = pointer;
    
    // Check trace descriptor magic number
    if (this.readUint16(p) !== 0x4422) {
      throw new Error('Invalid trace descriptor!');
    }
    p += 2;
    
    // X (size of this block header)
    const x = this.readUint16(p);
    p += 2;
    
    // Y (size of data block)
    const y = this.readUint32(p);
    p += 4;
    
    // NS (number of samples)
    const ns = this.readUint32(p);
    p += 4;
    
    // Data format
    const df = new Uint8Array(this.buffer)[p];
    p += 4;
    
    // Skip reserved bytes
    p += 0x10;
    
    // Parse free-format strings
    const freeStrings = this.parseStrings(p, pointer + x);
    
    // Move to data start
    p = pointer + x;
    
    // Read samples
    const samples: number[] = [];
    for (let i = 0; i < ns; i++) {
      switch (df) {
        case 0x01: // 16-bit signed int
          samples.push(this.readInt16(p));
          p += 2;
          break;
        case 0x02: // 32-bit signed int
          samples.push(this.readInt32(p));
          p += 4;
          break;
        case 0x04: // 32-bit float
          samples.push(this.readFloat32(p));
          p += 4;
          break;
        case 0x05: // 64-bit float
          samples.push(this.readFloat64(p));
          p += 8;
          break;
        default:
          break;
      }
    }
    
    return { samples, dataFormat: df, freeStrings };
  }

  getFrequency(): number {
    return this.frequency;
  }

  getSampleInterval(): number {
    return this.sampleInterval;
  }

  getMaxChannels(): number {
    return this.maxCh;
  }

  getFreeStrings(): string[] {
    return this.freeStrings;
  }

  getChannelData(channel: number): number[] | null {
    if (channel >= this.maxCh) {
      return null;
    }
    
    const { samples } = this.parseTraceDescriptor(this.pointerList[channel]);
    return samples;
  }

  getAllChannelsData(): number[][] {
    const data: number[][] = [];
    for (let ch = 0; ch < this.maxCh; ch++) {
      const samples = this.getChannelData(ch);
      if (samples) {
        data.push(samples);
      }
    }
    return data;
  }

  getSampleCount(): number {
    if (this.maxCh > 0) {
      const samples = this.getChannelData(0);
      return samples ? samples.length : 0;
    }
    return 0;
  }

  getInfo(): SEG2FileInfo {
    return {
      filename: '',
      channels: this.maxCh,
      frequency: this.frequency,
      sampleInterval: this.sampleInterval,
      sampleCount: this.getSampleCount(),
      freeStrings: this.freeStrings,
      valid: true,
    };
  }
}

/**
 * Parse a SEG2 file from ArrayBuffer
 */
export function parseSEG2(buffer: ArrayBuffer): SEG2Parser {
  return new SEG2Parser(buffer);
}

/**
 * Parse a SEG2 file from File object
 */
export async function parseSEG2File(file: File): Promise<{ parser: SEG2Parser; info: SEG2FileInfo }> {
  const buffer = await file.arrayBuffer();
  const parser = new SEG2Parser(buffer);
  const info = parser.getInfo();
  info.filename = file.name;
  return { parser, info };
}
