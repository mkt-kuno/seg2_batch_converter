import { useCallback, useRef } from 'react'
import { FileEntry } from '../App'

interface FileListProps {
  files: FileEntry[]
  onRemove: (index: number) => void
  onClear: () => void
  onAddMore: (files: File[]) => void
}

const ACCEPTED_EXTENSIONS = ['.sg2', '.dat', '.seg2']

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext))
}

export function FileList({ files, onRemove, onClear, onAddMore }: FileListProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddMoreClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const acceptedFiles = selectedFiles.filter(isAcceptedFile)
    
    if (acceptedFiles.length > 0) {
      onAddMore(acceptedFiles)
    }
    
    e.target.value = ''
  }, [onAddMore])

  return (
    <div className="bg-white/5 rounded-2xl p-5 mb-5">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-primary-300">
            📄 変換対象ファイル
          </span>
          <span className="bg-primary-300 text-black px-3 py-0.5 rounded-full text-xs font-semibold">
            {files.length}
          </span>
        </div>
        <button
          onClick={onClear}
          className="
            px-4 py-1.5 rounded-lg text-xs font-semibold
            border border-gray-500 text-gray-500
            hover:border-red-400 hover:text-red-400
            transition-colors
          "
        >
          すべてクリア
        </button>
      </div>

      {/* File Items */}
      <div className="max-h-52 overflow-y-auto space-y-2 mb-3">
        {files.map((entry, index) => (
          <div
            key={`${entry.file.name}-${index}`}
            className={`
              flex items-center justify-between
              p-3 rounded-lg
              bg-black/20
              ${!entry.info.valid ? 'border-l-4 border-red-500' : ''}
            `}
          >
            <span className="text-white text-sm flex-1 break-all">
              {entry.file.name}
            </span>
            <span className="text-gray-500 text-xs ml-4 whitespace-nowrap">
              {entry.info.valid ? (
                `${entry.info.channels}ch, ${entry.info.frequency}Hz, ${entry.info.sampleCount}samples`
              ) : (
                <span className="text-red-400">エラー: {entry.info.error}</span>
              )}
            </span>
            <button
              onClick={() => onRemove(index)}
              className="
                ml-3 text-xl text-red-400/70
                hover:text-red-400
                transition-colors
              "
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <button
        onClick={handleAddMoreClick}
        className="
          px-5 py-2 rounded-lg text-sm font-semibold
          bg-primary-300/20 border border-primary-300 text-primary-300
          hover:bg-primary-300/30
          transition-colors
        "
      >
        + ファイルを追加
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".sg2,.dat,.seg2,.SG2,.DAT,.SEG2"
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  )
}
