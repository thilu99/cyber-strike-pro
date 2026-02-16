'use client'
export default function WordPreview({ words, targetWords }: { words: string[], targetWords: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-sm">
      {targetWords.map((tw) => (
        <div key={tw} className={`px-2 py-1 rounded border text-xs font-bold tracking-widest transition-all duration-500 ${
          words.includes(tw) ? 'bg-white/20 border-white/40 text-white' : 'bg-black/20 border-white/5 text-transparent'
        }`}>
          {words.includes(tw) ? tw : tw.split('').map(() => '_').join('')}
        </div>
      ))}
    </div>
  )
}