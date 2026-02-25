import toast from 'react-hot-toast';

/**
 * Toast notification utilities
 * Provides consistent toast notifications across the app
 */

interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

let lastSuccessId: string | undefined;
let lastErrorId: string | undefined;

export const showToast = {
  success: (message: string, options: number | ToastOptions = 3000) => {
    const duration = typeof options === 'number' ? options : options.duration || 3000;
    const action = typeof options === 'number' ? undefined : options.action;

    if (lastSuccessId) toast.dismiss(lastSuccessId);
    lastSuccessId = toast.success(
      (t: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{message}</span>
          {action && (
            <button
              onClick={() => {
                action.onClick();
                toast.dismiss(t.id);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              {action.label}
            </button>
          )}
        </div>
      ),
      {
        duration,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#10b981',
        },
      }
    );
  },

  error: (message: string, duration: number = 4000) => {
    const userFriendlyMessage = translateError(message);
    if (lastErrorId) toast.dismiss(lastErrorId);
    lastErrorId = toast.error(userFriendlyMessage, {
      duration,
      position: 'top-left',
      style: {
        background: '#ef4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  warning: (message: string, duration: number = 3500) => {
    toast(message, {
      duration,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
      },
    });
  },

  info: (message: string, duration: number = 3000) => {
    toast(message, {
      duration,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#6b7280',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
      },
    });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: (err) => translateError(err?.message || messages.error),
      },
      {
        position: 'top-right',
        style: {
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
        },
      }
    );
  },
};

/**
 * Translates technical error messages to user-friendly Arabic
 */
const translateError = (message: string): string => {
  const lowercaseMsg = message.toLowerCase();

  if (lowercaseMsg.includes('unique constraint') || lowercaseMsg.includes('already exists')) {
    return 'هذا السجل موجود بالفعل في النظام';
  }
  if (lowercaseMsg.includes('not found') || lowercaseMsg.includes('entity not found')) {
    return 'لم يتم العثور على البيانات المطلوبة';
  }
  if (lowercaseMsg.includes('stock') && (lowercaseMsg.includes('insufficient') || lowercaseMsg.includes('low'))) {
    return 'عفواً، الكمية المطلوبة غير متوفرة في المخزون حالياً';
  }
  if (lowercaseMsg.includes('foreign key') || lowercaseMsg.includes('referenced')) {
    return 'لا يمكن حذف هذا البند لأنه مرتبط ببيانات أخرى';
  }
  if (lowercaseMsg.includes('network') || lowercaseMsg.includes('fetch') || lowercaseMsg.includes('timeout')) {
    return 'حدث خطأ في الاتصال، يرجى التحقق من الشبكة والمحاولة مرة أخرى';
  }
  if (lowercaseMsg.includes('permission') || lowercaseMsg.includes('unauthorized') || lowercaseMsg.includes('access denied')) {
    return 'عفواً، ليس لديك الصلاحية الكافية للقيام بهذا الإجراء';
  }
  if (lowercaseMsg.includes('validation') || lowercaseMsg.includes('invalid')) {
    return 'البيانات المدخلة غير صحيحة، يرجى مراجعتها';
  }

  // Fallback to original message if no mapping found, or a generic error
  return message.length > 50 ? 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى' : message;
};

// Export default toast for custom usage
export { toast };
