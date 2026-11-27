import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CalculoService } from '../../services/calculo.service';
import { TurnosService } from '../../services/turnos.service';
import { CultivoConfig, CanaletaSecundaria, UbicacionCanal, OrientacionRed } from './models/dashboard.models';
import { CATALOGO_CULTIVOS_CHILE } from './data/cultivos.data';

import { CadCanvasComponent } from './components/cad-canvas/cad-canvas.component';
import { InspectorPanelComponent } from './components/inspector-panel/inspector-panel.component';
import { TurnosHistoryComponent } from './components/turnos-history/turnos-history.component';
import { FormsModule } from '@angular/forms';
import { InfoTooltipComponent } from '../../components/info-tooltip/info-tooltip.component';
import { ClimaService, ZONAS_AGRICOLAS_CHILE } from '../../services/clima.service';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CadCanvasComponent,
    InspectorPanelComponent,
    FormsModule,
    TurnosHistoryComponent,
    InfoTooltipComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  sidebarColapsada: boolean = false;
  sidebarMovilAbierta: boolean = false;
// Modo de interfaz: 'campo' (guiado 3 pasos) vs 'tecnico' (completo con CAD)
  modoInterfaz: 'campo' | 'tecnico' = 'tecnico';
  unidadSuperficieCampo: 'ha' | 'cuadras' = 'ha';
  valorSuperficieCampo: number = 2.0;

  // Reporte rápido de emergencias / fallas en canal (Manual CNR)
  mostrarModalIncidencia: boolean = false;
  incidenciaCanal = {
    tipo: 'compuerta_trancada',
    descripcion: ''
  };
  incidenciasReportadas: Array<{
    id: number;
    fecha: string;
    predio: string;
    tipoEtiqueta: string;
    descripcion: string;
  }> = [];
  usuario: any = {
    _id: null,
    nombre: 'Regante',
    correo: '',
    ocupacion: 'agricultor_particular'
  };
  ocupacionEtiqueta: string = 'Agricultor / Regante Particular';

  // Parcela y Cuarteles
  nombrePredio: string = 'Sector Los Maitenes - Cuartel 1';
  parcelaAnchoM: number = 100;
  parcelaLargoM: number = 200;
  superficieHa: number = 2.0;
  numCuarteles: number = 2;

  // Clima Open-Meteo
  zonasClima = ZONAS_AGRICOLAS_CHILE;
  zonaClimaSeleccionada: string = 'buin';
  cargandoClima: boolean = false;
  climaActual: {
    zona: string;
    temp: number;
    tempMax: number;
    humedad: number;
    lluvia48h: number;
    et0Hoy: number;
    factorAjusteSugerido: number;
  } | null = null;

  // Punto 2: Ajuste climático activo
  ajusteClimaticoAplicado: boolean = false;

  // Punto 3: Métricas de ahorro (Riego Tradicional 48% vs Flumen 85%)
  ahorroTurnoM3: number = 0;
  ahorroTurnoCLP: number = 0;
  volumenTradicionalM3: number = 0;

  // Punto 4: Agenda de Reparto y Detección de Conflictos de Canal
  mostrarModalAgenda: boolean = false;
  capacidadMaximaCanalLps: number = 350;
  nuevoBloqueAgenda = {
    predio: '',
    horaInicio: '08:00',
    caudalSolicitadoLps: 150,
    duracionHoras: 2
  };
  agendaTurnos: Array<{
    id: number;
    predio: string;
    horaInicio: string;
    horaFin: string;
    caudalLps: number;
    duracionHoras: number;
  }> = [
    { id: 1, predio: 'Parcela El Almendro - Rol 104-2', horaInicio: '06:00', horaFin: '09:30', caudalLps: 180, duracionHoras: 3.5 },
    { id: 2, predio: 'Agrícola Santa Rosa - Sector B', horaInicio: '08:00', horaFin: '11:00', caudalLps: 140, duracionHoras: 3.0 }
  ];

  // Cultivo y Topografía
  cultivos = CATALOGO_CULTIVOS_CHILE;
  cultivoKey: string = 'palto';

  // Hidráulica
  ubicacionCanal: UbicacionCanal = 'norte';
  orientacionRegaderas: OrientacionRed = 'vertical';
  anchoBase: number = 0.80;
  tiranteCm: number = 40;
  pendientePorc: number = 0.15;
  tarifaM3CLP: number = 22;
  rugosidadManning: number = 0.015;

  // Estado del Canvas CAD
  posicionCanalMatriz = 50;
  canaletas: CanaletaSecundaria[] = [];

  // Resultados calculados
  volumenObjetivoM3: number = 0;
  caudalLps: number = 0;
  caudalM3s: number = 0;
  velocidadAgua: number = 0;
  radioHidraulico: number = 0;
  froude: number = 0;
  regimen: string = 'Subcrítico';
  tiempoTotalHoras: number = 0;
  horasTurno: number = 0;
  minutosTurno: number = 0;
  costoTotalCLP: number = 0;

  historial: any[] = [];
  guardando: boolean = false;
  mensajeAlerta: string = '';

  // Modal de configuración
  mostrarModalConfig: boolean = false;
  usuarioEdit: any = {
    nombre: '',
    correo: '',
    ocupacion: 'agricultor_particular',
    asociacion: ''
  };

  constructor(
    private authService: AuthService,
    private calculoService: CalculoService,
    private turnosService: TurnosService,
    private climaService: ClimaService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const rawUser = localStorage.getItem('flumen_user');
      if (rawUser) {
        try {
          this.usuario = JSON.parse(rawUser);
          this.asignarEtiquetaOcupacion(this.usuario.ocupacion || this.usuario.cargo);
        } catch (e) {
          console.error(e);
        }
      }
      this.consultarClimaZona();
    }

    this.generarCanaletasPorDefecto();
    this.recalcular();
    this.cargarHistorial();
  }

  get zonasClimaAgrupadas(): { provincia: string; zonas: typeof ZONAS_AGRICOLAS_CHILE }[] {
    const grupos: Record<string, typeof ZONAS_AGRICOLAS_CHILE> = {};
    this.zonasClima.forEach(z => {
      if (!grupos[z.provincia]) {
        grupos[z.provincia] = [];
      }
      grupos[z.provincia].push(z);
    });
    return Object.entries(grupos).map(([provincia, zonas]) => ({
      provincia,
      zonas
    }));
  }

  consultarClimaZona(): void {
    const zonaObj = this.zonasClima.find(z => z.id === this.zonaClimaSeleccionada) || this.zonasClima[0];
    this.cargandoClima = true;

    this.climaService.obtenerPronosticoAgricola(zonaObj.lat, zonaObj.lon).subscribe({
      next: (res) => {
        const lluviaHoy = res.daily?.precipitation_sum?.[0] || 0;
        const lluviaManana = res.daily?.precipitation_sum?.[1] || 0;
        const lluviaTotal48h = Number((lluviaHoy + lluviaManana).toFixed(1));
        const et0Hoy = Number((res.daily?.et0_fao_evapotranspiration?.[0] || 0).toFixed(1));
        const tempMax = Math.round(res.daily?.temperature_2m_max?.[0] || 0);

        let factor = 1.0;
        if (lluviaTotal48h >= 12) {
          factor = 0; // Suspender riego por lluvia fuerte
        } else if (lluviaTotal48h >= 5) {
          factor = 0.6; // Reducir 40% por lluvia moderada
        } else if (tempMax >= 33 || et0Hoy >= 6.0) {
          factor = 1.15; // Aumentar 15% por ola de calor / alta evaporación
        }

        this.climaActual = {
          zona: zonaObj.nombre,
          temp: Math.round(res.current?.temperature_2m || 0),
          tempMax,
          humedad: Math.round(res.current?.relative_humidity_2m || 0),
          lluvia48h: lluviaTotal48h,
          et0Hoy,
          factorAjusteSugerido: factor
        };
        this.cargandoClima = false;
        this.recalcular();
      },
      error: (err) => {
        console.warn('No se pudo obtener el pronóstico Open-Meteo:', err);
        this.cargandoClima = false;
      }
    });
  }

  toggleAjusteClimatico(): void {
    this.ajusteClimaticoAplicado = !this.ajusteClimaticoAplicado;
    this.recalcular();
  }

  get cultivoActual(): CultivoConfig {
    return this.cultivos[this.cultivoKey] ||
           this.cultivos['palto'] ||
           Object.values(this.cultivos)[0];
  }

  get tiempoPorCuartelStr(): string {
    if (this.numCuarteles <= 1 || this.tiempoTotalHoras <= 0) {
      return `${this.horasTurno}h ${this.minutosTurno}m total`;
    }
    const hPorC = this.tiempoTotalHoras / this.numCuarteles;
    const h = Math.floor(hPorC);
    const m = Math.round((hPorC - h) * 60);
    return `${h}h ${m < 10 ? '0' + m : m}m / sector`;
  }

  get diagnosticoHidraulico(): {
    nivel: 'ok' | 'warning' | 'danger';
    titulo: string;
    mensaje: string;
    accionRecomendada: string;
  } {
    const abiertas = this.canaletas.filter(c => c.abierta !== false).length;

    if (this.canaletas.length > 0 && abiertas === 0) {
      return {
        nivel: 'danger',
        titulo: 'Paso de Agua Totalmente Cerrado',
        mensaje: 'Todas las compuertas están cerradas (0 L/s ingresando al terreno).',
        accionRecomendada: 'Haz clic en al menos un círculo rojo en el mapa para abrir el paso del agua.'
      };
    }

    if (this.rugosidadManning >= 0.025 && this.velocidadAgua > 1.2) {
      return {
        nivel: 'danger',
        titulo: `Alerta de Erosión en Canal de Tierra (${this.velocidadAgua} m/s)`,
        mensaje: 'El agua baja con demasiada fuerza para un canal sin cemento y puede socavar los bordes o arrastrar barro.',
        accionRecomendada: 'Reduce la inclinación o regula la entrada en la compuerta matriz.'
      };
    }

    if (this.froude > 1.0) {
      return {
        nivel: 'warning',
        titulo: `Flujo Rápido / Turbulento (Froude: ${this.froude})`,
        mensaje: 'El agua corre en régimen acelerado; puede generar oleaje o desbordes al chocar con las compuertas.',
        accionRecomendada: 'Vigila el nivel del borde libre en las canaletas secundarias.'
      };
    }

    if (this.pendientePorc < 0.05 || this.velocidadAgua < 0.3) {
      return {
        nivel: 'warning',
        titulo: `Bajada Muy Suave (${this.velocidadAgua} m/s)`,
        mensaje: 'El agua avanza lento. Existe riesgo de acumulación de hojas, tierra o embancamiento en el fondo.',
        accionRecomendada: 'Mantén limpia la acequia de malezas antes de iniciar el turno.'
      };
    }

    return {
      nivel: 'ok',
      titulo: `Flujo Estable y Seguro (${this.velocidadAgua} m/s)`,
      mensaje: `Velocidad ideal sin riesgo de erosión ni desborde. Régimen ${this.regimen.toLowerCase()} controlado.`,
      accionRecomendada: `Mantén abiertas ${abiertas} de ${this.canaletas.length} canaletas durante ${this.horasTurno}h ${this.minutosTurno}m.`
    };
  }

  asignarEtiquetaOcupacion(ocupacion: string): void {
    const map: Record<string, string> = {
      agricultor_particular: 'Agricultor / Regante Particular',
      profesional_agronomo: 'Técnico Agrícola / Ingeniero Agrónomo',
      asociacion_canalistas: 'Administrador / Asociación de Canalistas',
      celador_compuerta: 'Regador / Celador de Compuerta'
    };
    this.ocupacionEtiqueta = map[ocupacion] || 'Regante Registrado';
  }

  onCambioParametros(data: any): void {
    const cambioUbicacion = this.ubicacionCanal !== data.ubicacionCanal;

    this.nombrePredio = data.nombrePredio;
    this.parcelaAnchoM = data.anchoM;
    this.parcelaLargoM = data.largoM;
    this.cultivoKey = data.cultivoKey;
    this.ubicacionCanal = data.ubicacionCanal;
    this.anchoBase = data.anchoBase;
    this.tiranteCm = data.tiranteCm;
    this.pendientePorc = data.pendientePorc;
    this.tarifaM3CLP = data.tarifaM3CLP;
    this.rugosidadManning = data.rugosidadManning;
    this.numCuarteles = data.numCuarteles;

    if (cambioUbicacion) {
      if (this.ubicacionCanal === 'norte') {
        this.posicionCanalMatriz = 50;
      } else if (this.ubicacionCanal === 'sur') {
        this.posicionCanalMatriz = 530;
      } else if (this.ubicacionCanal === 'oeste') {
        this.posicionCanalMatriz = 55;
      } else if (this.ubicacionCanal === 'este') {
        this.posicionCanalMatriz = 880;
      }
    }

    const m2 = this.parcelaAnchoM * this.parcelaLargoM;
    this.superficieHa = Number((m2 / 10000).toFixed(2));
    this.recalcular();
  }

  onDimensionesChange(event: { ancho: number; largo: number }): void {
    this.parcelaAnchoM = event.ancho;
    this.parcelaLargoM = event.largo;
    const m2 = this.parcelaAnchoM * this.parcelaLargoM;
    this.superficieHa = Number((m2 / 10000).toFixed(2));
    this.recalcular();
  }

  onCanaletasChange(nuevasCanaletas: CanaletaSecundaria[]): void {
    this.canaletas = nuevasCanaletas;
    this.recalcular();
  }

  recalcular(): void {
    const cultivo = this.cultivoActual;
    if (!cultivo) return;

    // Volumen base agronómico (eficiencia tecnificada/aforada ~85%)
    const volumenBaseM3 = this.superficieHa * cultivo.laminaMm * 10;

    // Punto 2: Aplicar factor climático si el usuario activó la recomendación
    const factorClima = (this.ajusteClimaticoAplicado && this.climaActual)
      ? this.climaActual.factorAjusteSugerido
      : 1.0;

    this.volumenObjetivoM3 = Math.round(volumenBaseM3 * factorClima);

    // Punto 3: Comparativa vs Riego Tradicional sin aforo ("al ojo", eficiencia ~48%)
    this.volumenTradicionalM3 = Math.round(volumenBaseM3 * (0.85 / 0.48));
    this.ahorroTurnoM3 = Math.max(0, this.volumenTradicionalM3 - this.volumenObjetivoM3);
    this.ahorroTurnoCLP = Math.round(this.ahorroTurnoM3 * this.tarifaM3CLP);

    const b = Number(this.anchoBase);
    const y = Number(this.tiranteCm) / 100;
    const S = Number(this.pendientePorc) / 100;
    const n = Number(this.rugosidadManning);
    const g = 9.81;

    const area = b * y;
    const perimetro = b + 2 * y;
    const radioH = perimetro > 0 ? area / perimetro : 0;
    const velocidad = radioH > 0 && n > 0 ? (1 / n) * Math.pow(radioH, 2 / 3) * Math.pow(S, 1 / 2) : 0;
    const caudalMatriz = area * velocidad;

    const totalCanaletas = this.canaletas.length;
    const abiertas = this.canaletas.filter(c => c.abierta !== false).length;
    const factorCaudal = totalCanaletas > 0 ? (abiertas / totalCanaletas) : 1;

    const caudalEfectivo = caudalMatriz * factorCaudal;

    this.radioHidraulico = parseFloat(radioH.toFixed(3));
    this.velocidadAgua = parseFloat(velocidad.toFixed(2));
    this.caudalM3s = parseFloat(caudalEfectivo.toFixed(3));
    this.caudalLps = Math.round(caudalEfectivo * 1000);

    this.froude = y > 0 ? parseFloat((velocidad / Math.sqrt(g * y)).toFixed(2)) : 0;
    this.regimen = this.froude > 1.03 ? 'Supercrítico' : 'Subcrítico';

    if (caudalEfectivo > 0 && this.volumenObjetivoM3 > 0) {
      this.tiempoTotalHoras = (this.volumenObjetivoM3 / caudalEfectivo) / 3600;
      this.horasTurno = Math.floor(this.tiempoTotalHoras);
      this.minutosTurno = Math.round((this.tiempoTotalHoras - this.horasTurno) * 60);
      if (this.minutosTurno === 60) {
        this.horasTurno += 1;
        this.minutosTurno = 0;
      }
    } else {
      this.tiempoTotalHoras = 0;
      this.horasTurno = 0;
      this.minutosTurno = 0;
    }

    this.costoTotalCLP = Math.round(this.volumenObjetivoM3 * this.tarifaM3CLP);
  }

  generarCanaletasPorDefecto(): void {
    this.canaletas = [];
    const baseOrigin = this.orientacionRegaderas === 'vertical' ? 140 : 130;
    const span = this.orientacionRegaderas === 'vertical' ? 620 : 380;

    for (let i = 1; i <= 3; i++) {
      const pos = Math.round(baseOrigin + span * (i / 4));
      this.canaletas.push({
        id: Date.now() + i,
        nombre: `Regadera ${i}`,
        posicion: pos,
        abierta: true
      });
    }
  }

  onAgregarCanaleta(): void {
    if (this.canaletas.length >= 8) return;
    const span = this.orientacionRegaderas === 'vertical' ? 450 : 250;
    this.canaletas.push({
      id: Date.now(),
      nombre: `Regadera ${this.canaletas.length + 1}`,
      posicion: span + this.canaletas.length * 30,
      abierta: true
    });
    this.recalcular();
  }

  onEliminarCanaletaChild(index: number): void {
    this.canaletas.splice(index, 1);
    this.recalcular();
  }

  onConmutarOrientacion(): void {
    this.orientacionRegaderas = this.orientacionRegaderas === 'vertical' ? 'horizontal' : 'vertical';
    this.generarCanaletasPorDefecto();
    this.recalcular();
  }

  imprimirComprobanteTurno(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w) return;

    w.document.write(`
      <html>
      <head>
        <title>Comprobante de Turno - Flumen</title>
        <style>
          body { font-family: sans-serif; padding: 30px; color: #0f172a; }
          .header { border-bottom: 2px solid #1b4332; padding-bottom: 12px; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 30px; }
          .card { border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; background: #f8fafc; }
          .card span { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; }
          .card strong { font-size: 15px; }
          .signs { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }
          .line { border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>ORDEN DE MARCO PARTIDOR N° ${Math.floor(1000 + Math.random() * 9000)}</h2>
          <small>Asociación de Canalistas / Junta de Vigilancia - Sistema FLUMEN Chile</small>
        </div>
        <div class="grid">
          <div class="card"><span>Predio / Rol:</span><strong>${this.nombrePredio}</strong></div>
          <div class="card"><span>Regante Responsable:</span><strong>${this.usuario.nombre}</strong></div>
          <div class="card"><span>Cultivo Afecto:</span><strong>${this.cultivoActual.nombre}</strong></div>
          <div class="card"><span>Superficie:</span><strong>${this.superficieHa} Ha (${this.numCuarteles} cuarteles)</strong></div>
          <div class="card"><span>Caudal Asignado:</span><strong>${this.caudalLps} L/s (${this.caudalM3s} m³/s)</strong></div>
          <div class="card"><span>Tirante en Acequia:</span><strong>${this.tiranteCm} cm (Solera: ${this.anchoBase} m)</strong></div>
          <div class="card"><span>Duración Total Turno:</span><strong>${this.horasTurno}h ${this.minutosTurno}m</strong></div>
          <div class="card"><span>Volumen Cubicado:</span><strong>${this.volumenObjetivoM3.toLocaleString()} m³</strong></div>
        </div>
        <div class="signs">
          <div><div class="line">Firma Celador / Juez de Río</div></div>
          <div><div class="line">Firma Regante Conforme</div></div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    w.document.close();
  }

  guardarTurnoActual(): void {
    this.guardando = true;
    this.mensajeAlerta = '';

    const b = Number(this.anchoBase);
    const y = Number(this.tiranteCm) / 100;
    const area = Number((b * y).toFixed(3));
    const perimetro = Number((b + 2 * y).toFixed(3));

    const payload = {
      usuarioId: (this.usuario && this.usuario._id && this.usuario._id.length === 24) ? this.usuario._id : null,
      nombrePredio: this.nombrePredio || 'Predio Agrícola General',
      cultivoKey: this.cultivoKey,
      cultivo: this.cultivoActual.nombre,
      cultivoIcono: this.cultivoActual.icono,
      parametrosCanal: {
        base: b,
        tirante: Number(this.tiranteCm),
        pendientePorc: Number(this.pendientePorc),
        rugosidad: Number(this.rugosidadManning),
        distanciaMetros: Number(this.parcelaLargoM) || 500
      },
      calculosHidraulicos: {
        areaM2: area,
        perimetroM: perimetro,
        radioHidraulicoM: Number(this.radioHidraulico),
        velocidadMs: Number(this.velocidadAgua),
        caudalM3s: Number(this.caudalM3s),
        caudalLitrosSeg: Number(this.caudalLps),
        froude: Number(this.froude),
        regimen: this.regimen || 'Subcrítico'
      },
      liquidacionTurno: {
        volumenM3: Number(this.volumenObjetivoM3),
        tiempoTotalHoras: Number(parseFloat(this.tiempoTotalHoras.toFixed(2))),
        tiempoHoras: Number(this.horasTurno),
        tiempoMinutos: Number(this.minutosTurno),
        tarifaM3: Number(this.tarifaM3CLP),
        costoTotalCLP: Number(this.costoTotalCLP),
        tiempoLlegadaMinutos: 0
      }
    };

    const request$ = this.turnosService ? this.turnosService.guardarTurno(payload) : this.calculoService.guardarCalculo(payload);

    request$.subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeAlerta = '✓ Turno guardado exitosamente en MongoDB Atlas.';
        this.cargarHistorial();
        setTimeout(() => this.mensajeAlerta = '', 3500);
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeAlerta = '❌ Error al guardar el turno en MongoDB.';
        console.error('Error al guardar el turno:', err);
      }
    });
  }

  cargarHistorial(): void {
    this.calculoService.obtenerHistorial().subscribe({
      next: (res) => { this.historial = res.data || []; },
      error: () => {}
    });
  }

  eliminarRegistro(id: string): void {
    if (isPlatformBrowser(this.platformId) && confirm('¿Deseas eliminar este turno registrado?')) {
      this.calculoService.eliminarCalculo(id).subscribe({
        next: () => {
          this.historial = this.historial.filter(h => h._id !== id);
        }
      });
    }
  }

  private generarGraficoTortaBase64(datosPorCultivo: { [key: string]: number }): string {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#1B4332';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('DISTRIBUCIÓN DE VOLUMEN ENTREGADO POR CULTIVO', 30, 35);

    const labels = Object.keys(datosPorCultivo);
    const values = Object.values(datosPorCultivo);
    const total = values.reduce((a, b) => a + b, 0);

    if (total === 0) return '';

    const colors = ['#2D6A4F', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7', '#D8F3DC'];
    let startAngle = 0;
    const centerX = 170;
    const centerY = 200;
    const radius = 110;

    values.forEach((val, i) => {
      const sliceAngle = (val / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    let legendY = 120;
    labels.forEach((label, i) => {
      const val = values[i];
      const pct = ((val / total) * 100).toFixed(1);

      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(330, legendY - 12, 16, 16);

      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 13px Arial';
      ctx.fillText(`${label}`, 356, legendY);

      ctx.fillStyle = '#64748B';
      ctx.font = '12px Arial';
      ctx.fillText(`${val.toLocaleString('es-CL')} m³ (${pct}%)`, 356, legendY + 16);

      legendY += 45;
    });

    return canvas.toDataURL('image/png').split(',')[1];
  }

  // EXPORTACIÓN EXCEL (.XLSX) PROFESIONAL DIRECTA
  async exportarAExcel(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.historial.length === 0) {
      alert('No existen turnos registrados para exportar.');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FLUMEN - Gestión Hídrica';

    const volumenesPorCultivo: { [key: string]: number } = {};
    this.historial.forEach(h => {
      const cultivo = h.cultivo || h.predio?.cultivo || 'Palto Hass';
      const vol = h.liquidacionTurno?.volumenM3 || h.gestionTurno?.volumenObjetivoM3 || 0;
      volumenesPorCultivo[cultivo] = (volumenesPorCultivo[cultivo] || 0) + vol;
    });

    // PESTAÑA 1: DASHBOARD CON GRÁFICO DE TORTA
    const wsResumen = workbook.addWorksheet('Dashboard Ejecutivo');
    wsResumen.views = [{ showGridLines: true }];

    wsResumen.columns = [
      { width: 22 }, { width: 22 }, { width: 22 },
      { width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }
    ];

    wsResumen.mergeCells('A1:G2');
    const titleCell = wsResumen.getCell('A1');
    titleCell.value = 'FLUMEN - DASHBOARD EJECUTIVO DE GESTIÓN HÍDRICA';
    titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B4332' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    wsResumen.getCell('A3').value = 'Reporte Consolidado | Asociación de Canalistas y Regantes';
    wsResumen.getCell('A3').font = { name: 'Calibri', size: 10, italic: true, color: { argb: '475569' } };

    const totalTurnos = this.historial.length;
    const volTotal = this.historial.reduce((acc, h) => acc + (h.liquidacionTurno?.volumenM3 || h.gestionTurno?.volumenObjetivoM3 || 0), 0);
    const costoTotal = this.historial.reduce((acc, h) => acc + (h.liquidacionTurno?.costoTotalCLP || h.gestionTurno?.costoTotalCLP || 0), 0);

    const cardFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E8F5E9' } };
    const cardBorder: Partial<ExcelJS.Borders> = {
      top: { style: 'thin', color: { argb: 'A5D6A7' } },
      left: { style: 'thin', color: { argb: 'A5D6A7' } },
      bottom: { style: 'thin', color: { argb: 'A5D6A7' } },
      right: { style: 'thin', color: { argb: 'A5D6A7' } }
    };

    wsResumen.mergeCells('A5:B5');
    wsResumen.getCell('A5').value = 'TOTAL TURNOS REGISTRADOS';
    wsResumen.getCell('A5').font = { size: 9, bold: true, color: { argb: '2D6A4F' } };
    wsResumen.getCell('A5').alignment = { horizontal: 'center', vertical: 'middle' };

    wsResumen.mergeCells('A6:B6');
    wsResumen.getCell('A6').value = totalTurnos;
    wsResumen.getCell('A6').font = { size: 18, bold: true, color: { argb: '1B4332' } };
    wsResumen.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };

    wsResumen.mergeCells('C5:D5');
    wsResumen.getCell('C5').value = 'VOLUMEN TOTAL ENTREGADO (m³)';
    wsResumen.getCell('C5').font = { size: 9, bold: true, color: { argb: '2D6A4F' } };
    wsResumen.getCell('C5').alignment = { horizontal: 'center', vertical: 'middle' };

    wsResumen.mergeCells('C6:D6');
    wsResumen.getCell('C6').value = volTotal;
    wsResumen.getCell('C6').numFmt = '#,##0" m³"';
    wsResumen.getCell('C6').font = { size: 18, bold: true, color: { argb: '1B4332' } };
    wsResumen.getCell('C6').alignment = { horizontal: 'center', vertical: 'middle' };

    wsResumen.mergeCells('E5:G5');
    wsResumen.getCell('E5').value = 'COSTO TOTAL ACUMULADO';
    wsResumen.getCell('E5').font = { size: 9, bold: true, color: { argb: '2D6A4F' } };
    wsResumen.getCell('E5').alignment = { horizontal: 'center', vertical: 'middle' };

    wsResumen.mergeCells('E6:G6');
    wsResumen.getCell('E6').value = costoTotal;
    wsResumen.getCell('E6').numFmt = '"$"#,##0" CLP"';
    wsResumen.getCell('E6').font = { size: 18, bold: true, color: { argb: '1B4332' } };
    wsResumen.getCell('E6').alignment = { horizontal: 'center', vertical: 'middle' };

    ['A5', 'B5', 'A6', 'B6', 'C5', 'D5', 'C6', 'D6', 'E5', 'F5', 'G5', 'E6', 'F6', 'G6'].forEach(ref => {
      const c = wsResumen.getCell(ref);
      c.fill = cardFill;
      c.border = cardBorder;
    });

    const chartBase64 = this.generarGraficoTortaBase64(volumenesPorCultivo);
    if (chartBase64) {
      const imageId = workbook.addImage({
        base64: chartBase64,
        extension: 'png',
      });

      wsResumen.addImage(imageId, {
        tl: { col: 0, row: 8 },
        ext: { width: 600, height: 360 }
      });
    }

    // PESTAÑA 2: HISTORIAL DETALLADO
    const wsHistorial = workbook.addWorksheet('Historial Detallado');
    wsHistorial.views = [{ showGridLines: true }];

    wsHistorial.mergeCells('A1:H1');
    const hHeader = wsHistorial.getCell('A1');
    hHeader.value = 'REGISTRO HISTÓRICO DE TURNOS DE RIEGO - MONGO DB';
    hHeader.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFF' } };
    hHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2D6A4F' } };
    hHeader.alignment = { horizontal: 'center', vertical: 'middle' };

    const headers = ['Fecha y Hora', 'Predio / Cuartel', 'Cultivo', 'Superficie', 'Caudal Asignado', 'Duración Turno', 'Volumen Cubicado', 'Costo Estimado'];
    const rowHeader = wsHistorial.addRow(headers);
    rowHeader.height = 25;

    rowHeader.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1B4332' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    this.historial.forEach((h, idx) => {
      const fecha = new Date(h.fechaCreacion).toLocaleString('es-CL');
      const predio = h.nombrePredio || h.predio?.nombre || 'Sector Los Maitenes';
      const cultivo = h.cultivo || h.predio?.cultivo || 'Palto Hass';
      const superficie = h.superficieHa || h.predio?.superficieHa || 2.0;
      const caudal = h.calculosHidraulicos?.caudalLitrosSeg || h.resultadosHidraulicos?.caudalLitrosSeg || 0;
      const duracion = h.liquidacionTurno ? `${h.liquidacionTurno.tiempoHoras}h ${h.liquidacionTurno.tiempoMinutos}m` : (h.gestionTurno?.tiempoFormateado || '0h 0m');
      const volumen = h.liquidacionTurno?.volumenM3 || h.gestionTurno?.volumenObjetivoM3 || 0;
      const costo = h.liquidacionTurno?.costoTotalCLP || h.gestionTurno?.costoTotalCLP || 0;

      const row = wsHistorial.addRow([fecha, predio, cultivo, superficie, caudal, duracion, volumen, costo]);
      row.height = 20;

      const isEven = idx % 2 === 0;
      const rowFill: ExcelJS.Fill = isEven
        ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }
        : { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } };

      row.eachCell((cell, colIndex) => {
        cell.fill = rowFill;
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };

        if (colIndex === 1 || colIndex === 6) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else if (colIndex === 2 || colIndex === 3) {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      });

      row.getCell(4).numFmt = '0.0" Ha"';
      row.getCell(5).numFmt = '#,##0" L/s"';
      row.getCell(7).numFmt = '#,##0" m³"';
      row.getCell(8).numFmt = '"$"#,##0';
    });

    wsHistorial.columns.forEach(column => {
      let maxLen = 0;
      column.eachCell!({ includeEmpty: true }, cell => {
        const value = cell.value ? cell.value.toString() : '';
        if (value.length > maxLen) {
          maxLen = value.length;
        }
      });
      column.width = Math.max(maxLen + 4, 18);
    });

    // Generación del archivo .xlsx nativo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FLUMEN_Reporte_Ejecutivo_${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  scrollHaciaHistorial(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('sec-historial')?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Punto 4: Agenda de Reparto y Detección de Conflictos
  abrirModalAgenda(): void {
    this.nuevoBloqueAgenda = {
      predio: this.nombrePredio,
      horaInicio: '09:00',
      caudalSolicitadoLps: this.caudalLps || 150,
      duracionHoras: Number(Math.max(0.5, this.tiempoTotalHoras).toFixed(1))
    };
    this.mostrarModalAgenda = true;
  }

  cerrarModalAgenda(): void {
    this.mostrarModalAgenda = false;
  }

  private horaAMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  private minutosAHora(totalMin: number): string {
    const minDia = ((Math.round(totalMin) % 1440) + 1440) % 1440;
    const h = Math.floor(minDia / 60);
    const m = minDia % 60;
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
  }

  agregarBloqueAgenda(): void {
    if (!this.nuevoBloqueAgenda.predio.trim()) return;
    const inicioMin = this.horaAMinutos(this.nuevoBloqueAgenda.horaInicio);
    const finMin = inicioMin + Math.round(this.nuevoBloqueAgenda.duracionHoras * 60);

    this.agendaTurnos.push({
      id: Date.now(),
      predio: this.nuevoBloqueAgenda.predio.trim(),
      horaInicio: this.nuevoBloqueAgenda.horaInicio,
      horaFin: this.minutosAHora(finMin),
      caudalLps: Number(this.nuevoBloqueAgenda.caudalSolicitadoLps),
      duracionHoras: Number(this.nuevoBloqueAgenda.duracionHoras)
    });

    this.agendaTurnos.sort((a, b) => this.horaAMinutos(a.horaInicio) - this.horaAMinutos(b.horaInicio));
  }

  eliminarBloqueAgenda(id: number): void {
    this.agendaTurnos = this.agendaTurnos.filter(t => t.id !== id);
  }

  get analisisConflictosCanal(): {
    hayConflicto: boolean;
    picoCaudalLps: number;
    franjaCritica: string;
  } {
    let pico = 0;
    let franja = '';

    for (const turno of this.agendaTurnos) {
      const iniA = this.horaAMinutos(turno.horaInicio);
      const finA = iniA + Math.round(turno.duracionHoras * 60);

      let caudalSimultaneo = 0;
      for (const otro of this.agendaTurnos) {
        const iniB = this.horaAMinutos(otro.horaInicio);
        const finB = iniB + Math.round(otro.duracionHoras * 60);

        if (iniA < finB && finA > iniB) {
          caudalSimultaneo += otro.caudalLps;
        }
      }

      if (caudalSimultaneo > pico) {
        pico = caudalSimultaneo;
        franja = `${turno.horaInicio} - ${turno.horaFin}`;
      }
    }

    return {
      hayConflicto: pico > this.capacidadMaximaCanalLps,
      picoCaudalLps: pico,
      franjaCritica: franja
    };
  }

  // Modal de Configuración de Usuario
  abrirModalConfig(): void {
    this.usuarioEdit = {
      nombre: this.usuario.nombre || 'Regante',
      correo: this.usuario.correo || '',
      ocupacion: this.usuario.ocupacion || 'agricultor_particular',
      asociacion: this.usuario.asociacion || 'Canalistas Zona Central'
    };
    this.mostrarModalConfig = true;
  }

  cerrarModalConfig(): void {
    this.mostrarModalConfig = false;
  }

  guardarConfigUsuario(): void {
    this.usuario = {
      ...this.usuario,
      nombre: this.usuarioEdit.nombre.trim(),
      correo: this.usuarioEdit.correo.trim(),
      ocupacion: this.usuarioEdit.ocupacion,
      asociacion: this.usuarioEdit.asociacion.trim()
    };

    this.asignarEtiquetaOcupacion(this.usuario.ocupacion);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('flumen_user', JSON.stringify(this.usuario));
    }

    this.mensajeAlerta = '✓ Perfil de regante actualizado correctamente.';
    setTimeout(() => this.mensajeAlerta = '', 3000);
    this.cerrarModalConfig();
  }
  cambiarModoInterfaz(modo: 'campo' | 'tecnico'): void {
    this.modoInterfaz = modo;
    if (modo === 'campo') {
      this.unidadSuperficieCampo = 'ha';
      this.valorSuperficieCampo = this.superficieHa;
    }
  }

  seleccionarCultivoRapido(key: string): void {
    this.cultivoKey = key;
    this.recalcular();
  }

  ajustarSuperficieCampo(valor: number, unidad: 'ha' | 'cuadras'): void {
    this.unidadSuperficieCampo = unidad;
    this.valorSuperficieCampo = Math.max(0.1, Number(valor) || 0.5);

    // 1 cuadra chilena = 1.5625 hectáreas
    const hectareas = unidad === 'cuadras'
      ? this.valorSuperficieCampo * 1.5625
      : this.valorSuperficieCampo;

    this.superficieHa = Number(hectareas.toFixed(2));
    const ladoAprox = Math.round(Math.sqrt(this.superficieHa * 10000));
    this.parcelaAnchoM = ladoAprox;
    this.parcelaLargoM = ladoAprox;
    this.recalcular();
  }

  escucharInstruccionVoz(): void {
    if (!isPlatformBrowser(this.platformId) || !('speechSynthesis' in window)) {
      alert('Tu navegador no soporta lectura por voz.');
      return;
    }

    window.speechSynthesis.cancel();

    const climaTexto = this.climaActual
      ? (this.climaActual.lluvia48h >= 12
          ? 'Atención: se pronostican lluvias fuertes, se recomienda postergar el riego.'
          : `El clima en ${this.climaActual.zona.split('(')[0]} está despejado con ${this.climaActual.temp} grados.`)
      : '';

    const texto = `Instrucción de riego Flumen para ${this.nombrePredio}. ` +
      `Para regar ${this.superficieHa} hectáreas de ${this.cultivoActual.nombre}, ` +
      `debes abrir tu compuerta durante ${this.horasTurno} horas y ${this.minutosTurno} minutos. ` +
      `El costo estimado del turno es de ${this.costoTotalCLP} pesos. ${climaTexto}`;

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-CL';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  enviarOrdenWhatsApp(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const mensaje =
      `*ORDEN DE RIEGO - SISTEMA FLUMEN*\n` +
      `📍 *Predio:* ${this.nombrePredio}\n` +
      `👤 *Regante:* ${this.usuario.nombre}\n` +
      `🌱 *Cultivo:* ${this.cultivoActual.nombre} (${this.superficieHa} Ha)\n` +
      `⏱️ *Abrir compuerta:* ${this.horasTurno}h ${this.minutosTurno}m (${this.tiempoPorCuartelStr})\n` +
      `💧 *Caudal:* ${this.caudalLps} L/s | *Volumen:* ${this.volumenObjetivoM3.toLocaleString('es-CL')} m³\n` +
      `💰 *Valor estimado:* $${this.costoTotalCLP.toLocaleString('es-CL')} CLP`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  }

  abrirModalIncidencia(): void {
    this.incidenciaCanal = { tipo: 'compuerta_trancada', descripcion: '' };
    this.mostrarModalIncidencia = true;
  }

  cerrarModalIncidencia(): void {
    this.mostrarModalIncidencia = false;
  }

  registrarIncidenciaCanal(): void {
    const etiquetas: Record<string, string> = {
      compuerta_trancada: 'Compuerta trancada o dañada',
      canal_obstruido: 'Canal tapado con ramas, basura o barro',
      sin_agua: 'Canal viene seco / falta de dotación',
      desborde_rotura: 'Desborde o derrumbe de borde en acequia'
    };

    this.incidenciasReportadas.unshift({
      id: Date.now(),
      fecha: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      predio: this.nombrePredio,
      tipoEtiqueta: etiquetas[this.incidenciaCanal.tipo] || 'Alerta en canal',
      descripcion: this.incidenciaCanal.descripcion.trim() || 'Sin observaciones adicionales'
    });

    this.mensajeAlerta = '🚨 Aviso registrado para el Celador y la Asociación de Canalistas.';
    setTimeout(() => this.mensajeAlerta = '', 4000);
    this.cerrarModalIncidencia();
  }
  cerrarSesion(): void {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}