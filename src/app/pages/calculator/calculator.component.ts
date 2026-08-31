import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

export interface CalculationResult {
  // Parámetros Hidráulicos de Ingeniería
  area: number;
  perimetroMojado: number;
  radioHidraulico: number;
  velocidad: number;
  caudal: number;
  caudalLitros: number;
  volumen: number;
  tiempoTransito: number;
  froude: number;
  regimen: string;
  regimenTipo: 'subcritico' | 'critico' | 'supercritico';
  energiaEspecifica: number;
  volumenDiario: number;

  // Parámetros de Turno y Cobro al Agricultor
  volumenObjetivo: number;
  tiempoTotalHoras: number;
  tiempoHoras: number;
  tiempoMinutos: number;
  costoTurno: number;
  tiempoLlegadaAguaMinutos: number;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss'
})
export class CalculatorComponent implements AfterViewInit {
  @ViewChild('ratingCanvas') ratingCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('energyCanvas') energyCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('timeCanvas') timeCanvas?: ElementRef<HTMLCanvasElement>;

  // 1. Variables Geométricas y de Terreno
  base: number = 1.00;
  tirante: number = 0.50;
  longitud: number = 150.0;
  distanciaPredio: number = 500; // Distancia en metros desde la compuerta al campo
  pendientePorc: number = 0.12;  // 0.12% = 0.0012 m/m
  rugosidad: number = 0.015;

  // 2. Variables de Turno, Volumen y Cobro
  volumenObjetivo: number = 2500; // m3 de agua asignados
  tarifaPorM3: number = 18;       // CLP $ por m3 entregado

  rugosidades = [
    { label: 'Hormigón liso / Cemento (n = 0.013)', value: 0.013 },
    { label: 'Hormigón terminado normal (n = 0.015)', value: 0.015 },
    { label: 'Mampostería / Piedra (n = 0.020)', value: 0.020 },
    { label: 'Tierra limpia y uniforme (n = 0.025)', value: 0.025 },
    { label: 'Tierra con maleza / Gravilla (n = 0.035)', value: 0.035 }
  ];

  resultado: CalculationResult | null = null;
  curvaAforo: { y: number; q: number }[] = [];
  curvaEnergia: { y: number; e: number }[] = [];

  ngAfterViewInit(): void {
    this.calcular();
  }

  // --- MÉTODOS DE USABILIDAD RÁPIDA (1 CLIC) ---

  cargarEjemplo(tipo: 'turno_chico' | 'riego_paltos' | 'llenado_tranque'): void {
    if (tipo === 'turno_chico') {
      this.base = 0.60;
      this.tirante = 0.30;
      this.rugosidad = 0.025;
      this.pendientePorc = 0.20;
      this.volumenObjetivo = 800;
      this.tarifaPorM3 = 18;
      this.distanciaPredio = 200;
    } else if (tipo === 'riego_paltos') {
      this.base = 1.00;
      this.tirante = 0.55;
      this.rugosidad = 0.015;
      this.pendientePorc = 0.12;
      this.volumenObjetivo = 3500;
      this.tarifaPorM3 = 22;
      this.distanciaPredio = 800;
    } else if (tipo === 'llenado_tranque') {
      this.base = 1.80;
      this.tirante = 0.90;
      this.rugosidad = 0.014;
      this.pendientePorc = 0.08;
      this.volumenObjetivo = 12000;
      this.tarifaPorM3 = 15;
      this.distanciaPredio = 1500;
    }
    this.calcular();
  }

  ajustarTirante(delta: number): void {
    const nuevo = Number((this.tirante + delta).toFixed(2));
    if (nuevo >= 0.05) {
      this.tirante = nuevo;
      this.calcular();
    }
  }

  ajustarBase(delta: number): void {
    const nuevo = Number((this.base + delta).toFixed(2));
    if (nuevo >= 0.10) {
      this.base = nuevo;
      this.calcular();
    }
  }

  // --- MOTOR DE CÁLCULO HIDRÁULICO Y ECONÓMICO ---

  calcular(): void {
    if (!this.base || !this.tirante || !this.pendientePorc || !this.rugosidad) {
      return;
    }

    const b = Number(this.base);
    const y = Number(this.tirante);
    const L = Number(this.longitud || 100);
    const distPredio = Number(this.distanciaPredio || 500);
    const n = Number(this.rugosidad);
    const S = Number(this.pendientePorc) / 100; // Conversión % a m/m
    const g = 9.81;
    const vol = Number(this.volumenObjetivo || 1000);
    const tarifa = Number(this.tarifaPorM3 || 0);

    // 1. Geometría e Hidráulica de Manning
    const area = b * y;
    const perimetro = b + (2 * y);
    const radioH = area / perimetro;
    const velocidad = (1 / n) * Math.pow(radioH, 2 / 3) * Math.pow(S, 1 / 2);
    const caudalM3s = area * velocidad;
    const caudalLitros = caudalM3s * 1000;

    // 2. Tiempos de Turno y Cobro
    const tiempoTotalSeg = caudalM3s > 0 ? vol / caudalM3s : 0;
    const tiempoTotalHoras = tiempoTotalSeg / 3600;
    const tiempoHoras = Math.floor(tiempoTotalHoras);
    const tiempoMinutos = Math.round((tiempoTotalHoras - tiempoHoras) * 60);
    const costoTotal = Math.round(vol * tarifa);

    // 3. Tiempo de Viaje del Agua hasta el Predio
    const tiempoLlegadaMinutos = velocidad > 0 ? Math.round((distPredio / velocidad) / 60) : 0;

    // 4. Diagnóstico de Régimen (Froude) y Energía
    const froude = velocidad / Math.sqrt(g * y);
    let regimen = 'Subcrítico (Flujo Tranquilo - Apto Riego)';
    let regimenTipo: 'subcritico' | 'critico' | 'supercritico' = 'subcritico';

    if (Math.abs(froude - 1.0) <= 0.03) {
      regimen = 'Crítico (Inestable)';
      regimenTipo = 'critico';
    } else if (froude > 1.03) {
      regimen = 'Supercrítico (Flujo Rápido - Riesgo Erosión)';
      regimenTipo = 'supercritico';
    }

    const energia = y + (Math.pow(velocidad, 2) / (2 * g));

    this.resultado = {
      area: parseFloat(area.toFixed(3)),
      perimetroMojado: parseFloat(perimetro.toFixed(3)),
      radioHidraulico: parseFloat(radioH.toFixed(3)),
      velocidad: parseFloat(velocidad.toFixed(2)),
      caudal: parseFloat(caudalM3s.toFixed(3)),
      caudalLitros: Math.round(caudalLitros),
      volumen: parseFloat((area * L).toFixed(2)),
      tiempoTransito: parseFloat((velocidad > 0 ? L / velocidad : 0).toFixed(1)),
      froude: parseFloat(froude.toFixed(2)),
      regimen,
      regimenTipo,
      energiaEspecifica: parseFloat(energia.toFixed(3)),
      volumenDiario: Math.round(caudalM3s * 86400),
      volumenObjetivo: vol,
      tiempoTotalHoras: parseFloat(tiempoTotalHoras.toFixed(2)),
      tiempoHoras,
      tiempoMinutos,
      costoTurno: costoTotal,
      tiempoLlegadaAguaMinutos: tiempoLlegadaMinutos
    };

    // Generar datos y renderizar gráficos
    this.generarCurvas(b, n, S, y, g);
    setTimeout(() => {
      this.dibujarCurvaAforo();
      this.dibujarCurvaEnergia();
      this.dibujarCurvaTiempos(b, n, S, vol);
    }, 40);
  }

  // --- RENDERIZADO DE GRÁFICOS TÉCNICOS Y DE TIEMPO ---

  generarCurvas(b: number, n: number, S: number, currentY: number, g: number): void {
    this.curvaAforo = [];
    this.curvaEnergia = [];
    const maxY = Math.max(currentY * 1.6, 1.2);
    const steps = 20;
    const stepSize = maxY / steps;

    for (let i = 1; i <= steps; i++) {
      const yi = stepSize * i;
      const ai = b * yi;
      const pi = b + (2 * yi);
      const rhi = ai / pi;
      const vi = (1 / n) * Math.pow(rhi, 2 / 3) * Math.pow(S, 1 / 2);
      const qi = ai * vi;
      const ei = yi + (Math.pow(vi, 2) / (2 * g));

      this.curvaAforo.push({ y: yi, q: qi });
      this.curvaEnergia.push({ y: yi, e: ei });
    }
  }

  dibujarCurvaAforo(): void {
    if (!this.ratingCanvas) return;
    const canvas = this.ratingCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pad = 42;
    const gw = w - pad * 2;
    const gh = h - pad * 2;
    const maxQ = Math.max(...this.curvaAforo.map(p => p.q)) * 1.1;
    const maxY = Math.max(...this.curvaAforo.map(p => p.y)) * 1.1;

    // Ejes
    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    ctx.fillStyle = '#718096';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillText('Caudal Q (m³/s)', w / 2 - 35, h - 10);
    ctx.save();
    ctx.translate(14, h / 2 + 25);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Tirante y (m)', 0, 0);
    ctx.restore();

    // Curva Q vs y
    ctx.strokeStyle = '#2b6cb0';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    this.curvaAforo.forEach((p, i) => {
      const x = pad + (p.q / maxQ) * gw;
      const y = h - pad - (p.y / maxY) * gh;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Punto de operación
    if (this.resultado) {
      const curX = pad + (this.resultado.caudal / maxQ) * gw;
      const curY = h - pad - (this.tirante / maxY) * gh;

      ctx.fillStyle = '#e53e3e';
      ctx.beginPath();
      ctx.arc(curX, curY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#e53e3e';
      ctx.beginPath();
      ctx.moveTo(curX, h - pad);
      ctx.lineTo(curX, curY);
      ctx.lineTo(pad, curY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  dibujarCurvaEnergia(): void {
    if (!this.energyCanvas) return;
    const canvas = this.energyCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pad = 42;
    const gw = w - pad * 2;
    const gh = h - pad * 2;
    const maxE = Math.max(...this.curvaEnergia.map(p => p.e)) * 1.15;
    const maxY = Math.max(...this.curvaEnergia.map(p => p.y)) * 1.1;

    // Ejes
    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    ctx.fillStyle = '#718096';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillText('Energía E (m)', w / 2 - 35, h - 10);
    ctx.save();
    ctx.translate(14, h / 2 + 25);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Tirante y (m)', 0, 0);
    ctx.restore();

    // Curva E vs y
    ctx.strokeStyle = '#319795';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    this.curvaEnergia.forEach((p, i) => {
      const x = pad + (p.e / maxE) * gw;
      const y = h - pad - (p.y / maxY) * gh;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Punto actual
    if (this.resultado) {
      const curX = pad + (this.resultado.energiaEspecifica / maxE) * gw;
      const curY = h - pad - (this.tirante / maxY) * gh;

      ctx.fillStyle = '#dd6b20';
      ctx.beginPath();
      ctx.arc(curX, curY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#dd6b20';
      ctx.beginPath();
      ctx.moveTo(curX, h - pad);
      ctx.lineTo(curX, curY);
      ctx.lineTo(pad, curY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  dibujarCurvaTiempos(b: number, n: number, S: number, vol: number): void {
    if (!this.timeCanvas) return;
    const canvas = this.timeCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const pad = 38;
    const gw = w - pad * 2;
    const gh = h - pad * 2;

    const tirantesPrueba = [0.20, 0.35, 0.50, 0.65, 0.80, 1.00];
    const puntos = tirantesPrueba.map(yt => {
      const a = b * yt;
      const p = b + 2 * yt;
      const v = (1 / n) * Math.pow(a / p, 2 / 3) * Math.pow(S, 1 / 2);
      const q = a * v;
      const horas = q > 0 ? (vol / q) / 3600 : 0;
      return { y: yt, horas };
    });

    const maxHoras = Math.max(...puntos.map(d => d.horas)) * 1.15;

    // Ejes
    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    ctx.fillStyle = '#718096';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillText('Nivel de Agua en Regla (m)', w / 2 - 60, h - 8);
    ctx.save();
    ctx.translate(12, h / 2 + 25);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Horas de Turno (h)', 0, 0);
    ctx.restore();

    // Trazado de Curva
    ctx.strokeStyle = '#dd6b20';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    puntos.forEach((d, i) => {
      const x = pad + (i / (puntos.length - 1)) * gw;
      const y = h - pad - (d.horas / maxHoras) * gh;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      ctx.fillStyle = '#4a5568';
      ctx.fillText(`${d.y.toFixed(2)}m`, x - 12, h - pad + 14);
    });
    ctx.stroke();

    // Punto de operación actual
    if (this.resultado) {
      const curRatio = Math.min(Math.max((this.tirante - 0.20) / (1.00 - 0.20), 0), 1);
      const curX = pad + curRatio * gw;
      const curY = h - pad - (this.resultado.tiempoTotalHoras / maxHoras) * gh;

      ctx.fillStyle = '#2b6cb0';
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1a365d';
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.fillText(`Turno: ${this.resultado.tiempoHoras}h ${this.resultado.tiempoMinutos}m`, curX - 35, curY - 10);
    }
  }

  get waterHeightSvg(): number {
    const maxHeight = 120;
    const ratio = Math.min(this.tirante / (this.tirante * 1.35), 0.85);
    return maxHeight * ratio;
  }
}