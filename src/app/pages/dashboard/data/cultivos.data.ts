import { CultivoConfig } from '../models/dashboard.models';

export interface CultivoExtendido extends CultivoConfig {
  subcategoria: string;
  demandaAnualM3Ha: string;
  tiempoCiclo: 'perenne' | 'estacional' | 'anual';
  estrategiaRiego: string;
}

export const CATALOGO_CULTIVOS_CHILE: Record<string, CultivoExtendido> = {
  // ==========================================
  // FRUTALES: CAROZO Y POMÁCEAS
  // ==========================================
  cerezo: {
    nombre: 'Cerezo (Lapins / Santina / Regina)',
    categoria: 'frutales_mayores',
    subcategoria: 'Carozo y Pomáceas',
    icono: '🍒',
    laminaMm: 45,
    kc: 0.95,
    frecuenciaDias: 7,
    colorSuelo: '#2d5a27',
    demandaAnualM3Ha: '6.500 - 8.200 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Riego crítico en llenado de fruto y postcosecha tardía'
  },
  manzano: {
    nombre: 'Manzano (Gala / Fuji / Granny Smith)',
    categoria: 'frutales_mayores',
    subcategoria: 'Carozo y Pomáceas',
    icono: '🍎',
    laminaMm: 50,
    kc: 0.90,
    frecuenciaDias: 7,
    colorSuelo: '#31572c',
    demandaAnualM3Ha: '7.500 - 9.500 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Sensible al golpe de sol; mantener humedad constante en floración'
  },
  ciruelo: {
    nombre: 'Ciruelo (D’Agen / Europeo / Japonés)',
    categoria: 'frutales_mayores',
    subcategoria: 'Carozo y Pomáceas',
    icono: '🟣',
    laminaMm: 42,
    kc: 0.85,
    frecuenciaDias: 8,
    colorSuelo: '#3a5a40',
    demandaAnualM3Ha: '6.000 - 7.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Buen aguante en suelos arcillosos de la zona central'
  },
  duraznero: {
    nombre: 'Duraznero y Nectarino',
    categoria: 'frutales_mayores',
    subcategoria: 'Carozo y Pomáceas',
    icono: '🍑',
    laminaMm: 48,
    kc: 0.90,
    frecuenciaDias: 7,
    colorSuelo: '#4f772d',
    demandaAnualM3Ha: '7.500 - 8.500 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Evitar asfixia radicular en suelos con napa alta'
  },
  pera: {
    nombre: 'Peral (Packham / Forelle)',
    categoria: 'frutales_mayores',
    subcategoria: 'Carozo y Pomáceas',
    icono: '🍐',
    laminaMm: 46,
    kc: 0.88,
    frecuenciaDias: 7,
    colorSuelo: '#386641',
    demandaAnualM3Ha: '7.000 - 9.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Alta transpiración en valles interiores calurosos'
  },
  damasco: {
    nombre: 'Damasco / Albaricoque',
    categoria: 'frutales_mayores',
    subcategoria: 'Carozo y Pomáceas',
    icono: '🟠',
    laminaMm: 40,
    kc: 0.82,
    frecuenciaDias: 8,
    colorSuelo: '#588157',
    demandaAnualM3Ha: '6.000 - 7.500 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Baja tolerancia a excesos de agua durante maduración'
  },

  // ==========================================
  // FRUTALES: FRUTOS SECOS
  // ==========================================
  nogal: {
    nombre: 'Nogal (Chandler / Serr)',
    categoria: 'frutales_mayores',
    subcategoria: 'Frutos Secos',
    icono: '🌰',
    laminaMm: 58,
    kc: 1.05,
    frecuenciaDias: 8,
    colorSuelo: '#344e41',
    demandaAnualM3Ha: '9.500 - 11.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Máximo requerimiento en llenado de pulpa (diciembre a febrero)'
  },
  avellano: {
    nombre: 'Avellano Europeo (Tonda Giffoni / Barcelona)',
    categoria: 'frutales_mayores',
    subcategoria: 'Frutos Secos',
    icono: '🌰',
    laminaMm: 50,
    kc: 0.95,
    frecuenciaDias: 7,
    colorSuelo: '#283618',
    demandaAnualM3Ha: '6.500 - 8.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Frutal en expansión centro-sur; sensible al estrés térmico'
  },
  almendro: {
    nombre: 'Almendro (Nonpareil / Carmel)',
    categoria: 'frutales_mayores',
    subcategoria: 'Frutos Secos',
    icono: '🟤',
    laminaMm: 44,
    kc: 0.80,
    frecuenciaDias: 9,
    colorSuelo: '#5c4d3c',
    demandaAnualM3Ha: '6.000 - 7.500 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Tolera riego deficitario en pre-cosecha para facilitar secado'
  },

  // ==========================================
  // FRUTALES: BERRIES Y PEQUEÑOS FRUTOS
  // ==========================================
  arandano: {
    nombre: 'Arándano (Duke / Legacy / O’Neal)',
    categoria: 'frutales_menores',
    subcategoria: 'Berries',
    icono: '🫐',
    laminaMm: 32,
    kc: 0.88,
    frecuenciaDias: 4,
    colorSuelo: '#1f3a52',
    demandaAnualM3Ha: '4.500 - 6.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Raíz poco profunda (<40 cm); requiere pulsos frecuentes'
  },
  frambuesa: {
    nombre: 'Frambuesa y Mora Híbrida',
    categoria: 'frutales_menores',
    subcategoria: 'Berries',
    icono: '🍇',
    laminaMm: 30,
    kc: 0.82,
    frecuenciaDias: 4,
    colorSuelo: '#4a154b',
    demandaAnualM3Ha: '4.000 - 5.500 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Muy sensible a la falta de agua en cosecha diaria'
  },
  frutilla: {
    nombre: 'Frutilla / Fresa en Camellón',
    categoria: 'frutales_menores',
    subcategoria: 'Berries',
    icono: '🍓',
    laminaMm: 35,
    kc: 0.85,
    frecuenciaDias: 3,
    colorSuelo: '#6b2d5c',
    demandaAnualM3Ha: '5.000 - 7.000 m³/ha/año',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Uso de acolchado plástico (mulch) con riego por goteo'
  },

  // ==========================================
  // FRUTALES: CÍTRICOS Y SUBTROPICALES
  // ==========================================
  citricos: {
    nombre: 'Cítricos (Limonero / Mandarino / Naranjo)',
    categoria: 'frutales_mayores',
    subcategoria: 'Cítricos',
    icono: '🍊',
    laminaMm: 48,
    kc: 0.80,
    frecuenciaDias: 7,
    colorSuelo: '#1e441e',
    demandaAnualM3Ha: '7.500 - 10.500 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Demanda continua; cuidar no cortar agua en cuaja primaveral'
  },
  palto: {
    nombre: 'Palto Hass (Ladera / Valle)',
    categoria: 'frutales_mayores',
    subcategoria: 'Tropicales y Perennes',
    icono: '🥑',
    laminaMm: 52,
    kc: 0.85,
    frecuenciaDias: 6,
    colorSuelo: '#1b4332',
    demandaAnualM3Ha: '9.000 - 11.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Vulnerable a asfixia radicular (Phytophthora) y salinidad'
  },
  olivo: {
    nombre: 'Olivo (Aceite y Mesa)',
    categoria: 'frutales_mayores',
    subcategoria: 'Tropicales y Perennes',
    icono: '🫒',
    laminaMm: 28,
    kc: 0.60,
    frecuenciaDias: 12,
    colorSuelo: '#4361ee',
    demandaAnualM3Ha: '4.000 - 6.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Alta resistencia al estrés hídrico regulado (RDC)'
  },
  kiwi: {
    nombre: 'Kiwi (Hayward)',
    categoria: 'frutales_mayores',
    subcategoria: 'Tropicales y Perennes',
    icono: '🥝',
    laminaMm: 55,
    kc: 1.00,
    frecuenciaDias: 5,
    colorSuelo: '#2b580c',
    demandaAnualM3Ha: '8.500 - 10.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Hoja grande con altísima evapotranspiración estival'
  },
  uva_mesa: {
    nombre: 'Uva de Mesa (Exportación)',
    categoria: 'vinedos',
    subcategoria: 'Vides',
    icono: '🍇',
    laminaMm: 42,
    kc: 0.80,
    frecuenciaDias: 6,
    colorSuelo: '#5c1d38',
    demandaAnualM3Ha: '6.500 - 8.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Riego dosificado para tamaño de baya sin partidura'
  },
  uva_vinifera: {
    nombre: 'Uva Vinífera (Vinos Finos)',
    categoria: 'vinedos',
    subcategoria: 'Vides',
    icono: '🍷',
    laminaMm: 26,
    kc: 0.62,
    frecuenciaDias: 10,
    colorSuelo: '#4a2800',
    demandaAnualM3Ha: '3.500 - 5.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Déficit hídrico controlado para concentración de polifenoles'
  },
  tuna: {
    nombre: 'Tuna / Nopal',
    categoria: 'frutales_mayores',
    subcategoria: 'Zonas Áridas',
    icono: '🌵',
    laminaMm: 18,
    kc: 0.35,
    frecuenciaDias: 20,
    colorSuelo: '#606c38',
    demandaAnualM3Ha: '1.500 - 3.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Consumo mínimo; metabolismo CAM adaptado al desierto'
  },

  // ==========================================
  // HORTALIZAS: FRUTO
  // ==========================================
  tomate: {
    nombre: 'Tomate (Consumo Fresco / Industrial)',
    categoria: 'hortalizas',
    subcategoria: 'Hortalizas de Fruto',
    icono: '🍅',
    laminaMm: 36,
    kc: 1.05,
    frecuenciaDias: 4,
    colorSuelo: '#386641',
    demandaAnualM3Ha: '5.500 - 7.000 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Riego parejo para evitar pudrición apical (blossom-end rot)'
  },
  choclo: {
    nombre: 'Choclo / Maíz Dulce',
    categoria: 'hortalizas',
    subcategoria: 'Hortalizas de Fruto',
    icono: '🌽',
    laminaMm: 45,
    kc: 1.15,
    frecuenciaDias: 5,
    colorSuelo: '#588157',
    demandaAnualM3Ha: '5.000 - 6.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Crítico desde emisión de penacho hasta llenado de grano'
  },
  zapallo: {
    nombre: 'Zapallo Camote e Italiano',
    categoria: 'hortalizas',
    subcategoria: 'Hortalizas de Fruto',
    icono: '🎃',
    laminaMm: 38,
    kc: 0.95,
    frecuenciaDias: 6,
    colorSuelo: '#6a994e',
    demandaAnualM3Ha: '4.000 - 5.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Foliar sensible a hongos; preferir riego por surco o goteo'
  },
  pimenton: {
    nombre: 'Pimentón y Ají',
    categoria: 'hortalizas',
    subcategoria: 'Hortalizas de Fruto',
    icono: '🫑',
    laminaMm: 36,
    kc: 1.00,
    frecuenciaDias: 4,
    colorSuelo: '#40916c',
    demandaAnualM3Ha: '5.000 - 6.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Evitar estrés hídrico para evitar caída prematura de flores'
  },
  pepino: {
    nombre: 'Pepino Ensalada y Berenjena',
    categoria: 'hortalizas',
    subcategoria: 'Hortalizas de Fruto',
    icono: '🥒',
    laminaMm: 34,
    kc: 0.98,
    frecuenciaDias: 4,
    colorSuelo: '#52b788',
    demandaAnualM3Ha: '4.500 - 5.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Alto contenido de agua en fruto; regar sin mojar cuello'
  },

  // ==========================================
  // HORTALIZAS: HOJA, TALLO E INFLORESCENCIAS
  // ==========================================
  lechuga: {
    nombre: 'Lechuga (Costina / Marina / Escarola)',
    categoria: 'hortalizas',
    subcategoria: 'Hoja y Tallo',
    icono: '🥬',
    laminaMm: 24,
    kc: 0.95,
    frecuenciaDias: 3,
    colorSuelo: '#74c69d',
    demandaAnualM3Ha: '2.000 - 3.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Ciclos rápidos (60-90 días); raíces muy superficiales'
  },
  esparrago: {
    nombre: 'Espárrago Verde',
    categoria: 'hortalizas',
    subcategoria: 'Hoja y Tallo',
    icono: '🌱',
    laminaMm: 46,
    kc: 0.95,
    frecuenciaDias: 6,
    colorSuelo: '#2d6a4f',
    demandaAnualM3Ha: '6.500 - 8.000 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Planta perenne; acumula reservas en rizomas en otoño'
  },
  alcachofa: {
    nombre: 'Alcachofa (Argentina / Chilena)',
    categoria: 'hortalizas',
    subcategoria: 'Hoja y Tallo',
    icono: '🌿',
    laminaMm: 42,
    kc: 0.90,
    frecuenciaDias: 6,
    colorSuelo: '#1b4332',
    demandaAnualM3Ha: '5.000 - 6.500 m³/ha/año',
    tiempoCiclo: 'perenne',
    estrategiaRiego: 'Demanda fuerte en formación de cabezuela comercial'
  },
  acelga: {
    nombre: 'Acelga y Espinaca',
    categoria: 'hortalizas',
    subcategoria: 'Hoja y Tallo',
    icono: '🍃',
    laminaMm: 26,
    kc: 0.92,
    frecuenciaDias: 3,
    colorSuelo: '#52796f',
    demandaAnualM3Ha: '2.500 - 4.000 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Humedad uniforme para evitar hojas fibrosas o amargas'
  },
  cruciferas: {
    nombre: 'Repollo / Brócoli / Coliflor',
    categoria: 'hortalizas',
    subcategoria: 'Crucíferas',
    icono: '🥦',
    laminaMm: 35,
    kc: 0.98,
    frecuenciaDias: 5,
    colorSuelo: '#354f52',
    demandaAnualM3Ha: '4.000 - 5.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Cultivos de otoño-primavera; complementan lluvias estacionales'
  },

  // ==========================================
  // HORTALIZAS: BULBOS, RAÍCES Y TUBÉRCULOS
  // ==========================================
  cebolla: {
    nombre: 'Cebolla Temprana y de Guarda',
    categoria: 'hortalizas',
    subcategoria: 'Bulbos y Raíces',
    icono: '🧅',
    laminaMm: 35,
    kc: 1.00,
    frecuenciaDias: 5,
    colorSuelo: '#6c584c',
    demandaAnualM3Ha: '4.500 - 6.000 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Cortar el riego 15-20 días antes de cosecha para curado'
  },
  zanahoria: {
    nombre: 'Zanahoria',
    categoria: 'hortalizas',
    subcategoria: 'Bulbos y Raíces',
    icono: '🥕',
    laminaMm: 32,
    kc: 0.95,
    frecuenciaDias: 4,
    colorSuelo: '#a68a64',
    demandaAnualM3Ha: '4.000 - 5.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Evitar oscilaciones bruscas para prevenir raíces rajadas'
  },
  papa: {
    nombre: 'Papa (Desirée / Pukará / Patagonia)',
    categoria: 'hortalizas',
    subcategoria: 'Bulbos y Raíces',
    icono: '🥔',
    laminaMm: 40,
    kc: 1.10,
    frecuenciaDias: 5,
    colorSuelo: '#7f5539',
    demandaAnualM3Ha: '5.000 - 6.500 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Riego decisivo en tuberización; evitar anegamiento'
  },
  ajo: {
    nombre: 'Ajo Chino y Rosado',
    categoria: 'hortalizas',
    subcategoria: 'Bulbos y Raíces',
    icono: '🧄',
    laminaMm: 28,
    kc: 0.85,
    frecuenciaDias: 6,
    colorSuelo: '#b7b7a4',
    demandaAnualM3Ha: '2.500 - 4.000 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Bajo requerimiento inicial en invierno; sensible en bulbificación'
  },

  // ==========================================
  // HORTALIZAS: LEGUMINOSAS
  // ==========================================
  poroto: {
    nombre: 'Poroto Verde y Granado',
    categoria: 'hortalizas',
    subcategoria: 'Leguminosas Hortícolas',
    icono: '🫘',
    laminaMm: 32,
    kc: 0.95,
    frecuenciaDias: 5,
    colorSuelo: '#43281c',
    demandaAnualM3Ha: '3.500 - 5.000 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Agua moderada; no regar en exceso durante floración inicial'
  },
  haba_arveja: {
    nombre: 'Haba y Arveja Verde',
    categoria: 'hortalizas',
    subcategoria: 'Leguminosas Hortícolas',
    icono: '🫛',
    laminaMm: 28,
    kc: 0.88,
    frecuenciaDias: 6,
    colorSuelo: '#335c67',
    demandaAnualM3Ha: '2.500 - 4.000 m³/ha/ciclo',
    tiempoCiclo: 'estacional',
    estrategiaRiego: 'Rotaciones de invierno y primavera con baja demanda térmica'
  }
};