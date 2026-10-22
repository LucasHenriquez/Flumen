import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  nombreUsuario: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.checkSession();
  }

  checkSession(): void {
    // Solo accede a localStorage si se ejecuta en el navegador (no en Node SSR)
    if (isPlatformBrowser(this.platformId)) {
      try {
        const token = localStorage.getItem('flumen_token');
        const rawUser = localStorage.getItem('flumen_user');

        if (token && rawUser) {
          this.isLoggedIn = true;
          const user = JSON.parse(rawUser);
          this.nombreUsuario = user.nombre ? user.nombre.split(' ')[0] : 'Regante';
        } else {
          this.isLoggedIn = false;
        }
      } catch {
        this.isLoggedIn = false;
      }
    }
  }

  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}