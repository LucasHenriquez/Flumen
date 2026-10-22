import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  userData = {
    nombre: '',
    email: '',
    cargo: 'Técnico Agrícola',
    password: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onRegister(): void {
    if (!this.userData.nombre || !this.userData.email || !this.userData.password) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.userData).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = '✅ ¡Usuario guardado exitosamente en MongoDB!';
        console.log('✅ Usuario registrado:', res);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || '❌ Error al intentar guardar en la base de datos.';
        console.error('❌ Error de registro:', err);
      }
    });
  }
}