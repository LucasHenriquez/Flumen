import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private apiUrl = 'http://localhost:3000/api/turnos';

  constructor(private http: HttpClient) {}

  guardarTurno(payload: any): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }
}