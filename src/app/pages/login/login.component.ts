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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    correo: '',
    password: ''
  };

  cargando: boolean = false;
  mostrarPassword: boolean = false;
  notificacion: Notificacion | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.notificacion = null;

    if (!this.credentials.correo || !this.credentials.password) {
      this.notificacion = {
        tipo: 'aviso',
        mensaje: 'Por favor, ingresa tu correo y contraseña.'
      };
      return;
    }

    this.cargando = true;

    const payload = {
      email: this.credentials.correo,
      correo: this.credentials.correo,
      password: this.credentials.password
    };

    this.authService.login(payload).subscribe({
      next: (res: any) => {
        this.cargando = false;
        this.notificacion = {
          tipo: 'exito',
          mensaje: '¡Acceso verificado! Redirigiendo al panel...'
        };

        if (res.token) {
          this.authService.guardarSesion(res.token, res.usuario);
        }

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 700);
      },
      error: (err: any) => {
        this.cargando = false;
        this.notificacion = {
          tipo: 'error',
          mensaje:
            err.error?.mensaje ||
            err.error?.message ||
            'Credenciales no válidas o problema de enlace con el servidor.'
        };
      }
    });
  }
}