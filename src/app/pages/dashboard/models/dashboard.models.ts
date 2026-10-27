export interface CultivoConfig {
  nombre: string;
  categoria: 'frutales_mayores' | 'frutales_menores' | 'vinedos' | 'hortalizas' | 'forrajeras';
  icono: string;
  laminaMm: number;        // Lámina neta de reposición recomendada (mm)
  kc: number;              // Coeficiente de cultivo FAO-56 / INIA en peak de temporada
  frecuenciaDias: number;  // Frecuencia típica de turno en verano
  colorSuelo: string;      // Tono de cuartel en el mapa
}

export interface CanaletaSecundaria {
  id: number;
  nombre: string;
  posicion: number;        // Coordenada en píxeles del eje dentro del plano
  abierta: boolean;        // Estado de la compuerta
}

export interface CuartelSector {
  id: number;
  nombre: string;
  superficieHa: number;
  estado: 'Turno Activo' | 'En Espera' | 'Regado';
  porcentajeSuperficie: number;
}

export type OrientacionRed = 'vertical' | 'horizontal';
export type UbicacionCanal = 'norte' | 'sur' | 'este' | 'oeste';