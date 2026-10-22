import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  guardarSesion(token: string, usuario: any): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('flumen_token', token);
      localStorage.setItem('flumen_user', JSON.stringify(usuario));
    }
  }

  saveToken(token: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('flumen_token', token);
    }
  }

  cerrarSesion(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('flumen_token');
      localStorage.removeItem('flumen_user');
    }
  }

  obtenerUsuario(): any {
    if (typeof window !== 'undefined' && window.localStorage) {
      const user = localStorage.getItem('flumen_user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  estaAutenticado(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      return !!localStorage.getItem('flumen_token');
    }
    return false;
  }
}