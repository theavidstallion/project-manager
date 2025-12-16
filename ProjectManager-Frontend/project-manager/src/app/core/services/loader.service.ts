import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  // Simple on/off switch
  isLoading = signal(false);

  show() { this.isLoading.set(true); }
  hide() { this.isLoading.set(false); }
}