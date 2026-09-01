import type { ToastInterface, ToastKind } from '@/types/Toast';
import { generateId } from '@/utils/generateId';
import { useToastStore } from '@/stores/toaststore';

const AUTO_DISMISS_MS = 3500;

export class ToastService {
  private static readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private static readonly keyedIds = new Map<string, number>();

  public static success(message: string, key?: string): void {
    ToastService.push('success', message, key);
  }

  public static error(message: string, key?: string): void {
    ToastService.push('error', message, key);
  }

  public static info(message: string, key?: string): void {
    ToastService.push('info', message, key);
  }

  public static dismiss(id: number): void {
    const timer = ToastService.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      ToastService.timers.delete(id);
    }

    ToastService.keyedIds.forEach((keyedId: number, key: string) => {
      if (keyedId === id) {
        ToastService.keyedIds.delete(key);
      }
    });

    useToastStore().removeToast(id);
  }

  private static push(kind: ToastKind, message: string, key?: string): void {
    const store = useToastStore();
    const existingId = key !== undefined ? ToastService.keyedIds.get(key) : undefined;

    if (existingId !== undefined) {
      store.updateToast({ id: existingId, kind, message });
      ToastService.scheduleDismiss(existingId);
      return;
    }

    const toast: ToastInterface = { id: generateId(store.toasts), kind, message };
    store.addToast(toast);
    if (key !== undefined) {
      ToastService.keyedIds.set(key, toast.id);
    }
    ToastService.scheduleDismiss(toast.id);
  }

  private static scheduleDismiss(id: number): void {
    const existing = ToastService.timers.get(id);
    if (existing !== undefined) {
      clearTimeout(existing);
    }
    ToastService.timers.set(
      id,
      setTimeout(() => {
        ToastService.dismiss(id);
      }, AUTO_DISMISS_MS),
    );
  }
}
