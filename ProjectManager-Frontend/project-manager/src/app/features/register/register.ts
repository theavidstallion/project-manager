import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../core/models/auth.models';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/services/toast.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-register',
  imports: [ FormsModule, RouterLink ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  router = inject(Router);
  authService = inject(AuthService);
  toast = inject(ToastService);
  loader = inject(LoaderService);

  registerObj: RegisterRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  }

  onRegister() {
    this.loader.show();
    this.authService.Register(this.registerObj)
      .subscribe({
        next: (response) => {
          this.router.navigate(['/login']).then(() => {
            setTimeout(() => {
              this.loader.hide();

              setTimeout(() => {
                this.toast.show("Registration Successful. Please check your email to verify.");
              }, 100);

            }, 500);
          });
        },
        error: (error) => {
          this.loader.hide();
          const errorMsg = error.error?.message || "Unknown error";
          setTimeout(()=> {
            this.toast.show(`Could not register: ${errorMsg}`, 'error');
          }, 100);
        }
      })

  }




}
