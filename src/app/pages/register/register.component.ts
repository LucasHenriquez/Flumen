import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface Notificacion {
  tipo: 'exito' | 'error' | 'aviso';
  mensaje: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  userData = {
    nombre: '',
    correo: '',
    ocupacion: 'agricultor_particular',
    password: ''
  };

  confirmCorreo = '';
  confirmPassword = '';
  mostrarPassword = false;
  mostrarConfirmPassword = false;
  cargando = false;
  notificacion: Notificacion | null = null;

  // Claves alineadas con el enum de Mongoose en Usuario.js
  ocupaciones = [
    { valor: 'agricultor_particular', etiqueta: 'Agricultor / Regante Particular' },
    { valor: 'profesional_agronomo', etiqueta: 'Técnico Agrícola / Ingeniero Agrónomo' },
    { valor: 'asociacion_canalistas', etiqueta: 'Administrador / Asociación de Canalistas' },
    { valor: 'celador_compuerta', etiqueta: 'Regador / Celador de Compuerta' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onRegister(): void {
    this.notificacion = null;

    if (!this.userData.nombre.trim() || !this.userData.correo.trim() || !this.userData.password) {
      this.notificacion = {
        tipo: 'aviso',
        mensaje: 'Por favor, completa todos los campos requeridos (*).'
      };
      return;
    }

    if (this.userData.correo.trim().toLowerCase() !== this.confirmCorreo.trim().toLowerCase()) {
      this.notificacion = {
        tipo: 'aviso',
        mensaje: 'Los correos electrónicos ingresados no coinciden.'
      };
      return;
    }

    if (this.userData.password.length < 6) {
      this.notificacion = {
        tipo: 'aviso',
        mensaje: 'La contraseña debe contener un mínimo de 6 caracteres.'
      };
      return;
    }

    if (this.userData.password !== this.confirmPassword) {
      this.notificacion = {
        tipo: 'aviso',
        mensaje: 'Las contraseñas ingresadas no coinciden.'
      };
      return;
    }

    this.cargando = true;

    const payload = {
      nombre: this.userData.nombre.trim(),
      email: this.userData.correo.trim().toLowerCase(),
      correo: this.userData.correo.trim().toLowerCase(),
      ocupacion: this.userData.ocupacion,
      password: this.userData.password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.notificacion = {
          tipo: 'exito',
          mensaje: '¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...'
        };

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1200);
      },
      error: (err: any) => {
        this.cargando = false;
        this.notificacion = {
          tipo: 'error',
          mensaje:
            err.error?.mensaje ||
            err.error?.message ||
            'Ocurrió un error al registrar la cuenta en MongoDB.'
        };
      }
    });
  }
}