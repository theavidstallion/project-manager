import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/auth.models';
import { LoaderService } from '../../core/services/loader.service';
import { ToastService } from '../../core/services/toast.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // Dependency Injection
  auth = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  loader = inject(LoaderService);

  // Form Data
  loginObj: LoginRequest = {
    email: '',
    password: ''
  }


  onLogin() {
    this.loader.show();
    this.auth.login(this.loginObj)
      // starts listening to request
      .subscribe({
        // success path
        next: (response) => {
          this.router.navigateByUrl('/dashboard').then(() => {
            setTimeout(() => {
              this.loader.hide();

              setTimeout(() => {
                this.toast.show("Welcome back! Login Successful.");
              }, 100);
            }, 500);
          });
          
        },
        // error path
        error: (error) => {
          this.loader.hide(); // Stop spinner
          setTimeout(() => {
            this.toast.show("Invalid email or password.", 'error');
          }, 100);
          
        }
      })
  }


}
