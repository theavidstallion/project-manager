import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  styles: [`
    /* The Animation Keyframes */
    @keyframes slideInFade {
      0% {
        opacity: 0;
        transform: translateY(-20px) scale(0.95); /* Start: Invisible, slightly above, slightly small */
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);        /* End: Visible, normal position, normal size */
      }
    }

    /* The Class to Apply */
    .toast-enter-animation {
      animation: slideInFade 0.4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
      /* "forwards" keeps the end state. cubic-bezier makes it feel "springy" and smooth. */
    }
  `],
  template: `
    @if (toast.toastSignal(); as msg) {
      <div class="toast-container position-fixed top-0 end-0 p-3 toast-enter-animation" 
           style="z-index: 10000">
        
        <div class="toast show align-items-center text-white border-0 shadow"
             [ngClass]="{
               'bg-success': msg.type === 'success',
               'bg-danger': msg.type === 'error'
             }">
          <div class="d-flex">
            <div class="toast-body fs-6">
              <i class="bi" [ngClass]="msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'"></i>
              &nbsp; {{ msg.text }}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    (click)="toast.toastSignal.set(null)"></button>
          </div>
        </div>

      </div>
    }
  `
})
export class Toast {
  toast = inject(ToastService);
}