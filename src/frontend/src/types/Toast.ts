export type ToastKind = 'success' | 'error' | 'info';

export interface ToastInterface {
  id: number;
  kind: ToastKind;
  message: string;
}
