interface ConvertButtonProps {
  onClick: () => void
  disabled: boolean
  isLoading: boolean
  fileCount: number
}

export function ConvertButton({ onClick, disabled, isLoading, fileCount }: ConvertButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full py-4 rounded-lg
        text-lg font-semibold
        transition-all duration-300
        ${disabled || isLoading
          ? 'bg-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-r from-primary-300 to-primary-400 text-black hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary-300/40'
        }
      `}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-3">
          <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" 
                style={{ borderWidth: '3px' }} />
          変換中...
        </span>
      ) : (
        `CSV に変換${fileCount > 0 ? ` (${fileCount}ファイル)` : ''}`
      )}
    </button>
  )
}
