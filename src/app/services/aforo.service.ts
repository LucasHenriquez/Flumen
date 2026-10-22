import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AforoService {
  private apiUrl = 'http://localhost:4000/api/aforo';

  constructor(private http: HttpClient) {}

  // 🚀 Guardar el aforo calculado en MongoDB
  guardarAforo(datosAforo: any): Observable<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Mapeo automático de nombres del frontend a las propiedades de MongoDB (Aforo.ts)
    const payload = {
      anchoSolera: datosAforo.base || datosAforo.anchoSolera,
      tiranteAgua: datosAforo.tirante || datosAforo.tiranteAgua,
      pendiente: (datosAforo.pendientePorc ? datosAforo.pendientePorc / 100 : datosAforo.pendiente) || 0.0012,
      rugosidad: datosAforo.rugosidad,
      nombreCanal: 'Canal Principal'
    };

    return this.http.post(this.apiUrl, payload, { headers });
  }

  // Métodos complementarios
  calcularAforo(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/calcular`, datos);
  }

  obtenerHistorial(): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial`);
  }
}