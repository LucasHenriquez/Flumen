import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ZonaAgricolaClima {
  id: string;
  provincia: string;
  nombre: string;
  lat: number;
  lon: number;
}

export const ZONAS_AGRICOLAS_CHILE: ZonaAgricolaClima[] = [
  // ==========================================
  // 1. PROVINCIA DE MAIPO (Cuenca Sur / Frutales y Vides)
  // ==========================================
  { id: 'buin', provincia: 'Provincia de Maipo', nombre: 'Buin (Alto Jahuel / Linderos / Viluco)', lat: -33.732, lon: -70.742 },
  { id: 'paine', provincia: 'Provincia de Maipo', nombre: 'Paine (Hospital / Champa / Huelquén / Pintué)', lat: -33.808, lon: -70.741 },
  { id: 'san_bernardo', provincia: 'Provincia de Maipo', nombre: 'San Bernardo (Nos / Lo Herrera / El Barrancón)', lat: -33.635, lon: -70.712 },
  { id: 'calera_tango', provincia: 'Provincia de Maipo', nombre: 'Calera de Tango (Lonquén / San Agustín)', lat: -33.642, lon: -70.778 },

  // ==========================================
  // 2. PROVINCIA DE MELIPILLA (Hortalizas, Frutales y Secano)
  // ==========================================
  { id: 'melipilla', provincia: 'Provincia de Melipilla', nombre: 'Melipilla (Pomaire / Chiñigüe / Codigua / Bollenar)', lat: -33.689, lon: -71.215 },
  { id: 'curacavi', provincia: 'Provincia de Melipilla', nombre: 'Curacaví (Valle de Puangue / Cerrillos)', lat: -33.404, lon: -71.135 },
  { id: 'maria_pinto', provincia: 'Provincia de Melipilla', nombre: 'María Pinto (Chorombo / Ibacache / Santa Emilia)', lat: -33.516, lon: -71.121 },
  { id: 'san_pedro', provincia: 'Provincia de Melipilla', nombre: 'San Pedro de Melipilla (Loica / Corneche / Nihue)', lat: -33.893, lon: -71.456 },
  { id: 'alhue', provincia: 'Provincia de Melipilla', nombre: 'Alhué (Villa Alhué / Loncha / Pichi)', lat: -34.032, lon: -71.101 },

  // ==========================================
  // 3. PROVINCIA DE TALAGANTE (Frutales, Hortalizas y Chacras)
  // ==========================================
  { id: 'talagante', provincia: 'Provincia de Talagante', nombre: 'Talagante (Lonquén Sur / Oliveto / Trebulco)', lat: -33.663, lon: -70.927 },
  { id: 'isla_maipo', provincia: 'Provincia de Talagante', nombre: 'Isla de Maipo (Naltagua / La Islita / San Antonio)', lat: -33.751, lon: -70.902 },
  { id: 'el_monte', provincia: 'Provincia de Talagante', nombre: 'El Monte (Paico Alto / Chiñigüe / Lo Chacón)', lat: -33.679, lon: -70.985 },
  { id: 'penaflor', provincia: 'Provincia de Talagante', nombre: 'Peñaflor (Malloco / Pelvín / El Guanaco)', lat: -33.606, lon: -70.876 },
  { id: 'padre_hurtado', provincia: 'Provincia de Talagante', nombre: 'Padre Hurtado (Santa Rosa de Chena / El Trebal)', lat: -33.575, lon: -70.816 },

  // ==========================================
  // 4. PROVINCIA DE CHACABUCO (Zona Norte / Paltos, Uvas y Hortalizas)
  // ==========================================
  { id: 'colina', provincia: 'Provincia de Chacabuco', nombre: 'Colina (Chicureo / Esmeralda / Peldehue / Chacabuco)', lat: -33.203, lon: -70.675 },
  { id: 'lampa', provincia: 'Provincia de Chacabuco', nombre: 'Lampa (Batuco / Lipangue / Chicauma / Valle Grande)', lat: -33.285, lon: -70.876 },
  { id: 'tiltil', provincia: 'Provincia de Chacabuco', nombre: 'Tiltil (Polpaico / Montenegro / Rungue / Caleu)', lat: -33.084, lon: -70.926 },

  // ==========================================
  // 5. PROVINCIA DE CORDILLERA Y BORDE PERIURBANO SANTIAGO
  // ==========================================
  { id: 'pirque', provincia: 'Cordillera y Periurbano', nombre: 'Pirque (El Principal / Santa Rita / Macul Alto)', lat: -33.633, lon: -70.573 },
  { id: 'san_jose_maipo', provincia: 'Cordillera y Periurbano', nombre: 'San José de Maipo (El Toyo / Las Vertientes / El Ingenio)', lat: -33.645, lon: -70.352 },
  { id: 'puente_alto', provincia: 'Cordillera y Periurbano', nombre: 'Puente Alto (Las Vizcachas / Bajos de Mena Agrícola)', lat: -33.611, lon: -70.575 },
  { id: 'maipu_agricola', provincia: 'Cordillera y Periurbano', nombre: 'Maipú Rural (Rinconada / El Trebal / Cuesta Barriga)', lat: -33.516, lon: -70.825 },
  { id: 'pudahuel_rural', provincia: 'Cordillera y Periurbano', nombre: 'Pudahuel Rural (Noviciado / Lo Aguirre / Peralito)', lat: -33.415, lon: -70.855 },
  { id: 'quilicura_norte', provincia: 'Cordillera y Periurbano', nombre: 'Quilicura / Huechuraba Agrícola (Lo Campino / Canal El Carmen)', lat: -33.352, lon: -70.728 },
  { id: 'la_pintana', provincia: 'Cordillera y Periurbano', nombre: 'La Pintana (Campus Antumapu / El Castillo Agrícola)', lat: -33.583, lon: -70.634 }
];

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  obtenerPronosticoAgricola(lat: number, lon: number): Observable<any> {
    const url = `${this.API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum,temperature_2m_max,et0_fao_evapotranspiration&timezone=America%2FSantiago&forecast_days=3`;
    return this.http.get(url);
  }
}