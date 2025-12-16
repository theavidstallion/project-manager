import { Component, inject } from '@angular/core';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-global-loader',
  template: `
    @if (loader.isLoading()) {
      <div class="loader-overlay fade-in">
        <div class="text-center">
          <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
          <h5 class="mt-3 text-dark">Please wait...</h5>
        </div>
      </div>
    }
  `,
  styleUrls: ['./global-loader.css']
})
export class GlobalLoader {
  loader = inject(LoaderService);
}