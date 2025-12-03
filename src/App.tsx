import { useState, useCallback } from 'react'
import { FileDropZone } from './components/FileDropZone'
import { FileList } from './components/FileList'
import { ConvertButton } from './components/ConvertButton'
import { ResultsPanel } from './components/ResultsPanel'
import { SEG2Parser, parseSEG2File, SEG2FileInfo } from './lib/seg2-parser'
import { generateCSV } from './lib/csv-exporter'

export interface FileEntry {
  file: File
  parser: SEG2Parser | null
  info: SEG2FileInfo
}

export interface ConversionResult {
  success: string[]
  failed: { filename: string; error: string }[]
}

function App() {
  const [files, setFiles] = useState<FileEntry[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [results, setResults] = useState<ConversionResult | null>(null)

  const handleFilesAdded = useCallback(async (newFiles: File[]) => {
    const entries: FileEntry[] = []

    for (const file of newFiles) {
      // Skip duplicates
      if (files.some(f => f.file.name === file.name && f.file.size === file.size)) {
        continue
      }

      try {
        const { parser, info } = await parseSEG2File(file)
        entries.push({ file, parser, info })
      } catch (err: any) {
        entries.push({
          file,
          parser: null,
          info: {
            filename: file.name,
            channels: 0,
            frequency: 0,
            sampleInterval: 0,
            sampleCount: 0,
            freeStrings: [],
            valid: false,
            error: err.message || 'Parse error',
          },
        })
      }
    }

    setFiles(prev => [...prev, ...entries])
    setResults(null)
  }, [files])

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setResults(null)
  }, [])

  const handleClearFiles = useCallback(() => {
    setFiles([])
    setResults(null)
  }, [])

  const handleConvert = useCallback(async () => {
    const validFiles = files.filter(f => f.info.valid && f.parser)
    if (validFiles.length === 0) return

    setIsConverting(true)
    setResults(null)

    try {
      const result: ConversionResult = { success: [], failed: [] }

      for (const { parser, file } of validFiles) {
        try {
          const csvContent = generateCSV(parser!)
          const csvFilename = file.name.replace(/\.[^.]+$/, '.csv')

          // Create download link
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = csvFilename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)

          result.success.push(csvFilename)

          // Add small delay between downloads to prevent browser blocking
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (err: any) {
          result.failed.push({
            filename: file.name,
            error: err.message || 'Unknown error',
          })
        }
      }

      setResults(result)
    } catch (err: any) {
      setResults({
        success: [],
        failed: [{ filename: 'Conversion', error: err.message }],
      })
    } finally {
      setIsConverting(false)
    }
  }, [files])

  const validFileCount = files.filter(f => f.info.valid).length

  return (
    <div className="min-h-screen text-gray-100 p-5">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary-300">
          🔬 SEG2 → CSV Converter
        </h1>

        {/* File Drop Zone or File List */}
        {files.length === 0 ? (
          <FileDropZone onFilesAdded={handleFilesAdded} />
        ) : (
          <FileList
            files={files}
            onRemove={handleRemoveFile}
            onClear={handleClearFiles}
            onAddMore={handleFilesAdded}
          />
        )}

        {/* Convert Button */}
        <div className="bg-white/5 rounded-2xl p-5 mb-5">
          <h2 className="text-base font-semibold text-primary-300 mb-4">
            ⚙️ 変換
          </h2>
          <ConvertButton
            onClick={handleConvert}
            disabled={validFileCount === 0}
            isLoading={isConverting}
            fileCount={validFileCount}
          />
        </div>

        {/* Results */}
        {results && <ResultsPanel results={results} />}

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          SEG2ファイルをCSV形式に変換してダウンロードします。
        </p>
      </div>
    </div>
  )
}

export default App