import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { AuthError } from '../../types/auth/AuthError.interface';
import { InputComponent } from '../../shared/input/input.component';
import { ButtonComponent } from '../../shared/button/button.component';
import { ModalResponseComponent } from '../../shared/modal-response/modal-response.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    InputComponent,
    ButtonComponent,
    ModalResponseComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal<string>('');
  errorStatus = signal<number>(0);

  modalResponseOpen = signal(false);

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Preencha todos os campos corretamente.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const backendError = err.error as AuthError;
          if (backendError && backendError.message) {
            this.errorMessage.set(backendError.message);
            this.errorStatus.set(backendError.status);
          } else {
            this.errorMessage.set('Erro inesperado no servidor.');
            this.errorStatus.set(500);
          }
          if (backendError.errors) {
            console.log('Campos com erro:', backendError.errors);
          }
          this.modalResponseOpen.set(true);
        },
      });
  }

  onCloseModalResponse() {
    this.modalResponseOpen.set(false);
    this.errorMessage.set('');
    this.errorStatus.set(0);
  }
}
