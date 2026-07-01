export const useToast = () => {
  const message = useState<string>('toast-msg', () => '')
  const visible = useState<boolean>('toast-visible', () => false)
  const isError = useState<boolean>('toast-error', () => false)
  let timer: ReturnType<typeof setTimeout> | undefined

  const show = (msg: string, error = false) => {
    message.value = msg
    isError.value = error
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { visible.value = false }, 3500)
  }

  return { message, visible, isError, show }
}
