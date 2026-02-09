import { useCallback, useEffect, useRef, useState } from 'react'

export type SplitDirection = 'horizontal' | 'vertical'

interface SplitPaneProps {
  direction: SplitDirection
  children: [React.ReactNode, React.ReactNode]
  defaultRatio?: number
  minSize?: number
  className?: string
}

export function SplitPane({
  direction,
  children,
  defaultRatio = 0.5,
  minSize = 80,
  className = '',
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState(defaultRatio)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }, [direction])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      let newRatio: number

      if (direction === 'horizontal') {
        const x = e.clientX - rect.left
        newRatio = x / rect.width
      } else {
        const y = e.clientY - rect.top
        newRatio = y / rect.height
      }

      // 限制最小尺寸
      const containerSize = direction === 'horizontal' ? rect.width : rect.height
      const minRatio = minSize / containerSize
      const maxRatio = 1 - minRatio

      newRatio = Math.max(minRatio, Math.min(maxRatio, newRatio))
      setRatio(newRatio)
    }

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [direction, minSize])

  const isHorizontal = direction === 'horizontal'

  return (
    <div
      ref={containerRef}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      {/* 第一个面板 */}
      <div
        className="overflow-hidden"
        style={
          isHorizontal
            ? { width: `${ratio * 100}%`, height: '100%' }
            : { height: `${ratio * 100}%`, width: '100%' }
        }
      >
        {children[0]}
      </div>

      {/* 分割线 */}
      <div
        className={`flex-shrink-0 ${
          isHorizontal
            ? 'w-1 cursor-col-resize hover:bg-blue-500/50'
            : 'h-1 cursor-row-resize hover:bg-blue-500/50'
        } bg-[#3e3e42] transition-colors`}
        onMouseDown={handleMouseDown}
      />

      {/* 第二个面板 */}
      <div
        className="overflow-hidden"
        style={
          isHorizontal
            ? { width: `${(1 - ratio) * 100}%`, height: '100%' }
            : { height: `${(1 - ratio) * 100}%`, width: '100%' }
        }
      >
        {children[1]}
      </div>
    </div>
  )
}
