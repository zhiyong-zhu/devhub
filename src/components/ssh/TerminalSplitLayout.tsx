import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SSHTerminal } from './SSHTerminal';

export type SplitDirection = 'horizontal' | 'vertical'

// 分屏树节点类型
export type SplitNode =
  | { type: 'terminal'; id: string; connectionId: string }
  | { type: 'split'; id: string; direction: SplitDirection; ratio: number; children: [SplitNode, SplitNode] }

// 布局矩形（百分比 0~1）
interface LayoutRect {
  left: number
  top: number
  width: number
  height: number
}

// 分割线信息
interface SplitterInfo {
  splitNodeId: string
  direction: SplitDirection
  // 分割线在容器中的位置（百分比）
  position: number // left 或 top
  // 分割线所在的矩形范围
  rect: LayoutRect
}

interface UseTerminalSplitResult {
  element: React.ReactNode
  splitFocused: (direction: SplitDirection) => void
  closeFocused: () => void
  navigatePanel: (dir: 'up' | 'down' | 'left' | 'right') => void
  panelCount: number
}

let nextPanelId = 1
function generatePanelId() {
  return `panel-${Date.now()}-${nextPanelId++}`
}

// --- 布局计算：从树结构计算每个终端的绝对位置 ---

interface TerminalLayout {
  id: string
  connectionId: string
  rect: LayoutRect
}

function computeLayouts(node: SplitNode, rect: LayoutRect): TerminalLayout[] {
  if (node.type === 'terminal') {
    return [{ id: node.id, connectionId: node.connectionId, rect }]
  }

  const { direction, ratio, children } = node

  if (direction === 'horizontal') {
    const leftRect: LayoutRect = { ...rect, width: rect.width * ratio }
    const rightRect: LayoutRect = {
      left: rect.left + rect.width * ratio,
      top: rect.top,
      width: rect.width * (1 - ratio),
      height: rect.height,
    }
    return [
      ...computeLayouts(children[0], leftRect),
      ...computeLayouts(children[1], rightRect),
    ]
  } else {
    const topRect: LayoutRect = { ...rect, height: rect.height * ratio }
    const bottomRect: LayoutRect = {
      left: rect.left,
      top: rect.top + rect.height * ratio,
      width: rect.width,
      height: rect.height * (1 - ratio),
    }
    return [
      ...computeLayouts(children[0], topRect),
      ...computeLayouts(children[1], bottomRect),
    ]
  }
}

function computeSplitters(node: SplitNode, rect: LayoutRect): SplitterInfo[] {
  if (node.type === 'terminal') return []

  const { direction, ratio, children } = node
  const splitters: SplitterInfo[] = []

  if (direction === 'horizontal') {
    const pos = rect.left + rect.width * ratio
    splitters.push({ splitNodeId: node.id, direction, position: pos, rect })

    const leftRect: LayoutRect = { ...rect, width: rect.width * ratio }
    const rightRect: LayoutRect = {
      left: pos, top: rect.top,
      width: rect.width * (1 - ratio), height: rect.height,
    }
    splitters.push(...computeSplitters(children[0], leftRect))
    splitters.push(...computeSplitters(children[1], rightRect))
  } else {
    const pos = rect.top + rect.height * ratio
    splitters.push({ splitNodeId: node.id, direction, position: pos, rect })

    const topRect: LayoutRect = { ...rect, height: rect.height * ratio }
    const bottomRect: LayoutRect = {
      left: rect.left, top: pos,
      width: rect.width, height: rect.height * (1 - ratio),
    }
    splitters.push(...computeSplitters(children[0], topRect))
    splitters.push(...computeSplitters(children[1], bottomRect))
  }

  return splitters
}

// --- 分割线拖拽组件 ---

const Splitter = React.memo(function Splitter({
  info,
  onDrag,
}: {
  info: SplitterInfo
  onDrag: (splitNodeId: string, newRatio: number) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging.current = true
    document.body.style.cursor = info.direction === 'horizontal' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'

    const handleMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return
      // 获取最外层容器
      const container = containerRef.current?.parentElement
      if (!container) return
      const containerRect = container.getBoundingClientRect()

      if (info.direction === 'horizontal') {
        const mouseX = (ev.clientX - containerRect.left) / containerRect.width
        const newRatio = Math.max(0.1, Math.min(0.9, (mouseX - info.rect.left) / info.rect.width))
        onDrag(info.splitNodeId, newRatio)
      } else {
        const mouseY = (ev.clientY - containerRect.top) / containerRect.height
        const newRatio = Math.max(0.1, Math.min(0.9, (mouseY - info.rect.top) / info.rect.height))
        onDrag(info.splitNodeId, newRatio)
      }
    }

    const handleMouseUp = () => {
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [info, onDrag])

  const isH = info.direction === 'horizontal'

  return (
    <div
      ref={containerRef}
      className={`absolute z-10 ${isH ? 'cursor-col-resize' : 'cursor-row-resize'}`}
      style={isH ? {
        left: `${info.position * 100}%`,
        top: `${info.rect.top * 100}%`,
        width: '4px',
        height: `${info.rect.height * 100}%`,
        transform: 'translateX(-2px)',
      } : {
        left: `${info.rect.left * 100}%`,
        top: `${info.position * 100}%`,
        width: `${info.rect.width * 100}%`,
        height: '4px',
        transform: 'translateY(-2px)',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={`w-full h-full bg-[#3e3e42] hover:bg-blue-500/60 transition-colors`} />
    </div>
  )
})

/**
 * 自定义 Hook：管理终端分屏布局
 *
 * 核心思路：所有终端平铺在同一层级（绝对定位），
 * 分屏树只计算每个终端的布局矩形。
 * 分屏操作只改变 CSS 布局，不改变 React 组件树结构。
 */
export function useTerminalSplit(
  connectionId: string,
  onAllClosed?: () => void,
): UseTerminalSplitResult {
  const [rootNode, setRootNode] = useState<SplitNode>(() => ({
    type: 'terminal',
    id: generatePanelId(),
    connectionId,
  }))
  const [focusedPanelId, setFocusedPanelId] = useState<string>(rootNode.id)
  const onAllClosedRef = useRef(onAllClosed)
  onAllClosedRef.current = onAllClosed

  // 分屏操作
  const splitPanel = useCallback((panelId: string, direction: SplitDirection) => {
    setRootNode(prev => {
      const newNode = transformNode(prev, panelId, (node) => {
        if (node.type !== 'terminal') return node
        const newTerminal: SplitNode = {
          type: 'terminal',
          id: generatePanelId(),
          connectionId: node.connectionId,
        }
        const splitNode: SplitNode = {
          type: 'split',
          id: generatePanelId(),
          direction,
          ratio: 0.5,
          children: [node, newTerminal],
        }
        setTimeout(() => setFocusedPanelId(newTerminal.id), 0)
        return splitNode
      })
      return newNode
    })
  }, [])

  // 关闭面板
  const closePanel = useCallback((panelId: string) => {
    setRootNode(prev => {
      if (prev.type === 'terminal' && prev.id === panelId) {
        onAllClosedRef.current?.()
        return prev
      }
      const newNode = removeNode(prev, panelId)
      if (!newNode) {
        onAllClosedRef.current?.()
        return prev
      }
      const firstTerminal = findFirstTerminal(newNode)
      if (firstTerminal) {
        setTimeout(() => setFocusedPanelId(firstTerminal.id), 0)
      }
      return newNode
    })
  }, [])

  // 更新分割比例
  const updateRatio = useCallback((splitNodeId: string, newRatio: number) => {
    setRootNode(prev => updateNodeRatio(prev, splitNodeId, newRatio))
  }, [])

  const splitFocused = useCallback((direction: SplitDirection) => {
    setFocusedPanelId(current => {
      splitPanel(current, direction)
      return current
    })
  }, [splitPanel])

  const closeFocused = useCallback(() => {
    setFocusedPanelId(current => {
      closePanel(current)
      return current
    })
  }, [closePanel])

  const navigatePanel = useCallback((dir: 'up' | 'down' | 'left' | 'right') => {
    setRootNode(currentRoot => {
      setFocusedPanelId(currentFocused => {
        const terminals = collectTerminals(currentRoot)
        const currentIdx = terminals.findIndex(t => t.id === currentFocused)
        if (currentIdx === -1 || terminals.length <= 1) return currentFocused
        let nextIdx: number
        if (dir === 'left' || dir === 'up') {
          nextIdx = (currentIdx - 1 + terminals.length) % terminals.length
        } else {
          nextIdx = (currentIdx + 1) % terminals.length
        }
        const target = terminals[nextIdx]
        return target ? target.id : currentFocused
      })
      return currentRoot
    })
  }, [])

  // 计算布局
  const fullRect: LayoutRect = { left: 0, top: 0, width: 1, height: 1 }
  const terminalLayouts = computeLayouts(rootNode, fullRect)
  const splitters = computeSplitters(rootNode, fullRect)

  const handleFocus = useCallback((id: string) => setFocusedPanelId(id), [])
  const handleDisconnect = useCallback((id: string) => closePanel(id), [closePanel])

  const element = (
    <div className="h-full w-full overflow-hidden relative">
      {/* 所有终端平铺在同一层级 - 分屏不会改变组件树结构 */}
      {terminalLayouts.map(layout => (
        <TerminalPanel
          key={layout.id}
          panelId={layout.id}
          connectionId={layout.connectionId}
          isFocused={layout.id === focusedPanelId}
          rect={layout.rect}
          onFocus={handleFocus}
          onDisconnect={handleDisconnect}
        />
      ))}
      {/* 分割线 */}
      {splitters.map(s => (
        <Splitter key={s.splitNodeId} info={s} onDrag={updateRatio} />
      ))}
    </div>
  )

  return {
    element,
    splitFocused,
    closeFocused,
    navigatePanel,
    panelCount: terminalLayouts.length,
  }
}

/**
 * 终端面板 - 绝对定位，key 稳定，分屏不会卸载重建
 */
const TerminalPanel = React.memo(function TerminalPanel({
  panelId,
  connectionId,
  isFocused,
  rect,
  onFocus,
  onDisconnect,
}: {
  panelId: string
  connectionId: string
  isFocused: boolean
  rect: LayoutRect
  onFocus: (id: string) => void
  onDisconnect: (id: string) => void
}) {
  const fitRef = useRef<(() => void) | null>(null)

  // 当布局矩形变化时触发终端 fit
  useEffect(() => {
    const timer = setTimeout(() => fitRef.current?.(), 50)
    return () => clearTimeout(timer)
  }, [rect.left, rect.top, rect.width, rect.height])

  return (
    <div
      className={`absolute overflow-hidden ${isFocused ? 'ring-1 ring-inset ring-blue-500/60 z-[1]' : ''}`}
      style={{
        left: `${rect.left * 100}%`,
        top: `${rect.top * 100}%`,
        width: `${rect.width * 100}%`,
        height: `${rect.height * 100}%`,
      }}
      onClick={() => onFocus(panelId)}
    >
      <SSHTerminal
        connectionId={connectionId}
        onDisconnect={() => onDisconnect(panelId)}
        onFitAddonReady={(fit) => { fitRef.current = fit }}
      />
    </div>
  )
}, (prev, next) => {
  return prev.panelId === next.panelId
    && prev.connectionId === next.connectionId
    && prev.isFocused === next.isFocused
    && prev.rect.left === next.rect.left
    && prev.rect.top === next.rect.top
    && prev.rect.width === next.rect.width
    && prev.rect.height === next.rect.height
})

// --- 工具函数 ---

function transformNode(
  node: SplitNode,
  targetId: string,
  transform: (node: SplitNode) => SplitNode
): SplitNode {
  if (node.id === targetId) return transform(node)
  if (node.type === 'split') {
    return {
      ...node,
      children: [
        transformNode(node.children[0], targetId, transform),
        transformNode(node.children[1], targetId, transform),
      ],
    }
  }
  return node
}

function updateNodeRatio(node: SplitNode, splitNodeId: string, newRatio: number): SplitNode {
  if (node.type === 'terminal') return node
  if (node.id === splitNodeId) return { ...node, ratio: newRatio }
  return {
    ...node,
    children: [
      updateNodeRatio(node.children[0], splitNodeId, newRatio),
      updateNodeRatio(node.children[1], splitNodeId, newRatio),
    ],
  }
}

function removeNode(node: SplitNode, targetId: string): SplitNode | null {
  if (node.type === 'terminal') return node.id === targetId ? null : node
  const [left, right] = node.children
  if (left.id === targetId) return right
  if (right.id === targetId) return left
  const newLeft = removeNode(left, targetId)
  const newRight = removeNode(right, targetId)
  if (!newLeft) return newRight
  if (!newRight) return newLeft
  return { ...node, children: [newLeft, newRight] }
}

function findFirstTerminal(node: SplitNode): (SplitNode & { type: 'terminal' }) | null {
  if (node.type === 'terminal') return node
  return findFirstTerminal(node.children[0]) || findFirstTerminal(node.children[1])
}

function collectTerminals(node: SplitNode): Array<SplitNode & { type: 'terminal' }> {
  if (node.type === 'terminal') return [node]
  return [...collectTerminals(node.children[0]), ...collectTerminals(node.children[1])]
}
