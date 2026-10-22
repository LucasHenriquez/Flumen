import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  private apiUrl = 'http://localhost:4000/api/turnos';

  constructor(private http: HttpClient) {}

  crearTurno(datosTurno: {
    parcela: string;
    volumenRequeridoM3: number;
    caudalLS: number;
    tarifaPorM3?: number;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, datosTurno);
  }

  obtenerTurnos(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
}