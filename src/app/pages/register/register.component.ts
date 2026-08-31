import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  userData = { name: '', email: '', password: '', role: 'tecnico' };

  constructor(private router: Router) {}

  onRegister() {
    console.log('Registrando usuario:', this.userData);
    // Próxima conexión con Firebase Auth
    this.router.navigate(['/calculadora']);
  }
}