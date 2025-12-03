import { useCallback, useRef, useState } from 'react'

interface FileDropZoneProps {
  onFilesAdded: (files: File[]) => void
}

const ACCEPTED_EXTENSIONS = ['.sg2', '.dat', '.seg2']

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext))
}

export function FileDropZone({ onFilesAdded }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    const acceptedFiles = droppedFiles.filter(isAcceptedFile)
    
    if (acceptedFiles.length > 0) {
      onFilesAdded(acceptedFiles)
    }
  }, [onFilesAdded])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const acceptedFiles = selectedFiles.filter(isAcceptedFile)
    
    if (acceptedFiles.length > 0) {
      onFilesAdded(acceptedFiles)
    }
    
    // Reset input
    e.target.value = ''
  }, [onFilesAdded])

  return (
    <button
      type="button"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full p-10 mb-5
        border-3 border-dashed rounded-2xl
        cursor-pointer
        transition-all duration-300
        ${isDragOver
          ? 'border-primary-200 bg-primary-300/20 scale-[1.02]'
          : 'border-primary-300 bg-primary-300/10 hover:bg-primary-300/20 hover:scale-[1.01]'
        }
      `}
      style={{ borderWidth: '3px' }}
    >
      <div className="text-6xl mb-4">📁</div>
      <div className="text-lg text-gray-400">
        クリックしてファイルを選択
      </div>
      <div className="text-sm text-gray-500 mt-2">
        または、ドラッグ＆ドロップ
        <br />
        対応形式: .sg2, .dat, .seg2
      </div>
      
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".sg2,.dat,.seg2,.SG2,.DAT,.SEG2"
        onChange={handleInputChange}
        className="hidden"
      />
    </button>
  )
}
