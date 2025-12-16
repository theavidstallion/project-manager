import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toastSignal = signal<ToastMessage | null>(null);

  show(text: string, type: 'success' | 'error' = 'success') {
    this.toastSignal.set({ text, type });
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      this.toastSignal.set(null);
    }, 5000);
  }
}