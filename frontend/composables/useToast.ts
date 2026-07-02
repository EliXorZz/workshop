interface ToastState {
  message: string;
  visible: boolean;
  error: boolean;
}

let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function useToast() {
  const toast = useState<ToastState>("app_toast", () => ({
    message: "",
    visible: false,
    error: false,
  }));

  function show(message: string, error = false) {
    toast.value = { message, visible: true, error };
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.value = { ...toast.value, visible: false };
    }, 3500);
  }

  return { toast, show };
}
