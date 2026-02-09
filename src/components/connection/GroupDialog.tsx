import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Group } from '@/types';

interface GroupDialogProps {
  group?: Group;
  parentId?: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, parentId?: string) => Promise<void>;
}

export function GroupDialog({
  group,
  parentId,
  open,
  onClose,
  onSubmit,
}: GroupDialogProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (group) {
      setName(group.name);
    } else {
      setName('');
    }
    setError('');
  }, [group, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('分组名称不能为空');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSubmit(name.trim(), group?.parent_id || parentId);
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '操作失败';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${open ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-2">{group ? '编辑分组' : '新建分组'}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {group ? '修改分组信息' : '创建一个新的连接分组'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 mb-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                分组名称 <span className="text-destructive">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：生产环境、测试服务器等"
                disabled={isLoading}
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              onClick={onClose}
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {group ? '保存' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
