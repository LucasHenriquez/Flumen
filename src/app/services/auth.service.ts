import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  guardarSesion(token: string, usuario: any): void {
    localStorage.setItem('flumen_token', token);
    localStorage.setItem('flumen_user', JSON.stringify(usuario));
  }

  cerrarSesion(): void {
    localStorage.removeItem('flumen_token');
    localStorage.removeItem('flumen_user');
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem('flumen_token');
  }
}