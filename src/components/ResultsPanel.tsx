import { ConversionResult } from '../App'

interface ResultsPanelProps {
  results: ConversionResult
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  return (
    <div className="bg-white/5 rounded-2xl p-5">
      <h2 className="text-base font-semibold text-primary-300 mb-4">
        📊 変換結果
      </h2>
      
      <div className="space-y-2">
        {/* Success items */}
        {results.success.map((filename, index) => (
          <div
            key={`success-${index}`}
            className="
              p-3 rounded-lg text-sm
              bg-green-500/20 border-l-4 border-green-500
            "
          >
            ✅ {filename}
          </div>
        ))}
        
        {/* Failed items */}
        {results.failed.map((item, index) => (
          <div
            key={`failed-${index}`}
            className="
              p-3 rounded-lg text-sm
              bg-red-500/20 border-l-4 border-red-500
            "
          >
            ❌ {item.filename}: {item.error}
          </div>
        ))}
      </div>
      
      {/* Summary */}
      {(results.success.length > 0 || results.failed.length > 0) && (
        <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
          完了: {results.success.length} 成功, {results.failed.length} 失敗
        </div>
      )}
    </div>
  )
}
