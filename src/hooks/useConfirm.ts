import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'warning';
}

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'default' | 'danger' | 'warning';
  onConfirm: () => void;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '확인',
    cancelText: '취소',
    type: 'default',
    onConfirm: () => {}
  });

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || '확인',
        cancelText: options.cancelText || '취소',
        type: options.type || 'default',
        onConfirm: () => {
          resolve(true);
        }
      });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  const handleCancel = useCallback(() => {
    closeConfirm();
    // Promise는 resolve되지 않고 그냥 닫힘 (사실상 false 반환)
  }, [closeConfirm]);

  return {
    confirmState,
    showConfirm,
    closeConfirm,
    handleCancel
  };
};