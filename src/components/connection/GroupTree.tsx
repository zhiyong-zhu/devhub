import { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, Edit2, Trash2, Server } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Group } from '@/types';

interface GroupTreeProps {
  groups: Group[];
  selectedGroupId?: string;
  onGroupSelect?: (groupId: string) => void;
  onGroupCreate?: (parentId?: string) => void;
  onGroupEdit?: (group: Group) => void;
  onGroupDelete?: (groupId: string) => void;
}

export function GroupTree({
  groups,
  selectedGroupId,
  onGroupSelect,
  onGroupCreate,
  onGroupEdit,
  onGroupDelete,
}: GroupTreeProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleExpand = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // 构建分组树结构
  const buildTree = () => {
    const groupMap = new Map<string, Group & { children: Group[] }>();
    const rootGroups: (Group & { children: Group[] })[] = [];

    // 初始化所有分组
    groups.forEach((group) => {
      groupMap.set(group.id, { ...group, children: [] });
    });

    // 构建父子关系
    groups.forEach((group) => {
      const groupWithChildren = groupMap.get(group.id)!;
      if (group.parent_id) {
        const parent = groupMap.get(group.parent_id);
        if (parent) {
          parent.children.push(groupWithChildren);
        }
      } else {
        rootGroups.push(groupWithChildren);
      }
    });

    return rootGroups;
  };

  const renderGroup = (group: any, level: number = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const hasChildren = group.children && group.children.length > 0;
    const isSelected = selectedGroupId === group.id;

    return (
      <div key={group.id}>
        {/* 分组项 */}
        <div
          className={cn(
            'flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(group.id);
            }
            onGroupSelect?.(group.id);
          }}
        >
          {/* 展开/收起图标 */}
          {hasChildren ? (
            <button
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(group.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* 文件夹图标 */}
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-yellow-500" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-500" />
          )}

          {/* 分组名称 */}
          <span className="flex-1 text-sm truncate">{group.name}</span>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onGroupCreate?.(group.id);
              }}
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onGroupEdit?.(group);
              }}
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onGroupDelete?.(group.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 子分组 */}
        {isExpanded && hasChildren && (
          <div>
            {group.children.map((child: any) => renderGroup(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree();

  return (
    <div className="space-y-1">
      {/* 根级别的"所有连接"选项 */}
      <div
        className={cn(
          'flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          !selectedGroupId && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        )}
        onClick={() => onGroupSelect?.('')}
      >
        <Server className="w-4 h-4 text-gray-500" />
        <span className="flex-1 text-sm">所有连接</span>
      </div>

      {/* 分组树 */}
      {tree.map((group) => renderGroup(group))}

      {/* 创建根分组按钮 */}
      <button
        onClick={() => onGroupCreate?.()}
        className="flex items-center gap-2 py-1.5 px-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors w-full"
      >
        <Plus className="w-4 h-4" />
        <span>新建分组</span>
      </button>
    </div>
  );
}
