import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { TokenService } from '../../services/token/token.service';
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
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private tokenService = inject(TokenService);
  private router = inject(Router);

  ngOnInit() {
    if (this.tokenService.isAuthenticated()) {
      this.router.navigate(['/admin']);
    }
  }

  email = '';
  password = '';
  rememberMe = false;
  isLoading = signal(false);
  errorMessage = signal<string>('');
  errorStatus = signal<number>(0);

  modalResponseOpen = signal(false);

  onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Preencha todos os campos corretamente.');
      this.errorStatus.set(400);
      this.modalResponseOpen.set(true);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService
      .login({ email: this.email, password: this.password, rememberMe: this.rememberMe })
      .subscribe({
        next: () => {
          this.router.navigate(['/admin']).then(success => {
            if (!success) {
              this.isLoading.set(false);
              this.errorMessage.set('Falha ao redirecionar para o painel.');
              this.modalResponseOpen.set(true);
            }
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          const backendError = err.error as AuthError;
          const status = err.status;
          
          if (status === 0) {
            this.errorMessage.set('Não foi possível conectar ao servidor. Verifique sua conexão.');
            this.errorStatus.set(0);
          } else if (status === 401 || status === 403 || status === 400) {
            this.errorMessage.set('Usuário ou senha incorretos.');
            this.errorStatus.set(status);
          } else if (backendError && backendError.message) {
            this.errorMessage.set(backendError.message);
            this.errorStatus.set(status);
          } else {
            this.errorMessage.set('Erro inesperado no servidor.');
            this.errorStatus.set(status || 500);
          }

          if (backendError?.errors) {
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
