interface ToastProps {
  message: string;
  kind: 'success' | 'error';
}

export default function Toast({ message, kind }: ToastProps) {
  return <div className={`toast ${kind}${message ? '' : ' hidden'}`} role="status" aria-live="polite">{message}</div>;
}
