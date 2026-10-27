import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CalculoResponse {
  success: boolean;
  data?: any;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CalculoService {
  private apiUrl = 'http://localhost:3000/api/calculos';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('flumen_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  guardarCalculo(data: any): Observable<CalculoResponse> {
    return this.http.post<CalculoResponse>(this.apiUrl, data, { headers: this.getHeaders() });
  }

  obtenerHistorial(): Observable<CalculoResponse> {
    return this.http.get<CalculoResponse>(this.apiUrl, { headers: this.getHeaders() });
  }

  eliminarCalculo(id: string): Observable<CalculoResponse> {
    return this.http.delete<CalculoResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}