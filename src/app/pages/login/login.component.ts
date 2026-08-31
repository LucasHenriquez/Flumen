import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  credentials = { email: '', password: '' };

  constructor(private router: Router) {}

  onLogin() {
    console.log('Iniciando sesión con:', this.credentials);
    // Próxima integración con Firebase Auth / API
    this.router.navigate(['/calculadora']);
  }
}