import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ViewChild, 
  ElementRef, 
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  HostListener 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CultivoConfig, CanaletaSecundaria, UbicacionCanal, OrientacionRed } from '../../models/dashboard.models';

export interface BoundingBoxGeom {
  x: number;
  y: number;
  w: number;
  h: number;
}

@Component({
  selector: 'app-cad-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cad-canvas.component.html',
  styleUrls: ['./cad-canvas.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CadCanvasComponent {
  @ViewChild('svgElement', { static: true }) svgElementRef!: ElementRef<SVGSVGElement>;

  @Input() anchoM: number = 100;
  @Input() largoM: number = 200;
  @Input() superficieHa: number = 2.0;
  @Input() pendientePorc: number = 0.15;
  @Input() caudalLps: number = 0;
  @Input() rugosidadManning: number = 0.015;

  @Input() cultivo: CultivoConfig = {
    nombre: 'Palto Hass',
    categoria: 'frutales_mayores',
    icono: '🥑',
    laminaMm: 52,
    kc: 0.85,
    frecuenciaDias: 6,
    colorSuelo: '#1b4332'
  };

  @Input() canaletas: CanaletaSecundaria[] = [];
  @Input() ubicacionCanal: UbicacionCanal = 'norte';
  @Input() orientacionRegaderas: OrientacionRed = 'vertical';
  @Input() posicionCanalMatriz: number = 55;
  @Input() numCuarteles: number = 2;

  @Output() posicionCanalMatrizChange = new EventEmitter<number>();
  @Output() canaletasChange = new EventEmitter<CanaletaSecundaria[]>();
  @Output() dimensionesChange = new EventEmitter<{ ancho: number; largo: number }>();
  @Output() eliminarCanaleta = new EventEmitter<number>();

  // Coordenadas base fijas en el lienzo SVG de 1100 x 680
  readonly PADDING_LEFT = 85;
  readonly PADDING_TOP = 85;
  readonly MIN_PARCELA_W = 600;
  readonly MAX_PARCELA_W = 860;
  readonly MIN_PARCELA_H = 360;
  readonly MAX_PARCELA_H = 500;

  readonly MAX_M_ANCHO = 1500;
  readonly MAX_M_LARGO = 2500;

  arrastrando = false;
  tipoArrastre: 'canal-matriz' | 'canaleta-item' | 'terreno-width' | 'terreno-height' | 'terreno-corner' | null = null;
  indiceCanaletaActiva = -1;

  dragOffset = 0;
  initialAnchoM = 100;
  initialLargoM = 200;
  initialMouseSvgX = 0;
  initialMouseSvgY = 0;

  constructor(private cdr: ChangeDetectorRef) {}

  trackByCanaleta(index: number, item: any): number {
    return item.id || index;
  }

  get geom(): BoundingBoxGeom {
    const escalaX = Math.min(Math.max((this.anchoM - 20) / (this.MAX_M_ANCHO - 20), 0), 1);
    const escalaY = Math.min(Math.max((this.largoM - 20) / (this.MAX_M_LARGO - 20), 0), 1);

    const w = Math.round(this.MIN_PARCELA_W + escalaX * (this.MAX_PARCELA_W - this.MIN_PARCELA_W));
    const h = Math.round(this.MIN_PARCELA_H + escalaY * (this.MAX_PARCELA_H - this.MIN_PARCELA_H));

    return {
      x: this.PADDING_LEFT,
      y: this.PADDING_TOP,
      w,
      h
    };
  }

  get canalMatrizPosCalculada(): number {
    const g = this.geom;
    if (this.ubicacionCanal === 'norte' || this.ubicacionCanal === 'sur') {
      const minY = g.y - 45;
      const maxY = g.y + g.h + 20;
      return Math.max(minY, Math.min(maxY, this.posicionCanalMatriz));
    } else {
      const minX = g.x - 45;
      const maxX = g.x + g.w + 20;
      return Math.max(minX, Math.min(maxX, this.posicionCanalMatriz));
    }
  }

  getSvgCoordinates(event: MouseEvent): { x: number; y: number } {
    const svg = this.svgElementRef.nativeElement;
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }
    return { x: event.clientX, y: event.clientY };
  }

  iniciarArrastreCanalMatriz(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.arrastrando = true;
    this.tipoArrastre = 'canal-matriz';
    const coords = this.getSvgCoordinates(event);

    if (this.ubicacionCanal === 'norte' || this.ubicacionCanal === 'sur') {
      this.dragOffset = coords.y - this.canalMatrizPosCalculada;
    } else {
      this.dragOffset = coords.x - this.canalMatrizPosCalculada;
    }
  }

  iniciarArrastreCanaleta(index: number, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.canaletas[index]) return;

    this.arrastrando = true;
    this.tipoArrastre = 'canaleta-item';
    this.indiceCanaletaActiva = index;
    const coords = this.getSvgCoordinates(event);

    if (this.orientacionRegaderas === 'vertical') {
      this.dragOffset = coords.x - this.canaletas[index].posicion;
    } else {
      this.dragOffset = coords.y - this.canaletas[index].posicion;
    }
  }

  iniciarArrastreTerreno(tipo: 'terreno-width' | 'terreno-height' | 'terreno-corner', event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.arrastrando = true;
    this.tipoArrastre = tipo;
    const coords = this.getSvgCoordinates(event);
    this.initialMouseSvgX = coords.x;
    this.initialMouseSvgY = coords.y;
    this.initialAnchoM = this.anchoM;
    this.initialLargoM = this.largoM;
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (!this.arrastrando || !this.tipoArrastre) return;

    const coords = this.getSvgCoordinates(event);
    const g = this.geom;

    if (this.tipoArrastre === 'canal-matriz') {
      let nuevaPos = 0;
      if (this.ubicacionCanal === 'norte' || this.ubicacionCanal === 'sur') {
        nuevaPos = Math.round(coords.y - this.dragOffset);
        nuevaPos = Math.max(g.y - 45, Math.min(g.y + g.h + 20, nuevaPos));
      } else {
        nuevaPos = Math.round(coords.x - this.dragOffset);
        nuevaPos = Math.max(g.x - 45, Math.min(g.x + g.w + 20, nuevaPos));
      }

      this.posicionCanalMatriz = nuevaPos;
      this.posicionCanalMatrizChange.emit(this.posicionCanalMatriz);
      this.cdr.markForCheck();
      return;
    }

    if (this.tipoArrastre === 'canaleta-item' && this.indiceCanaletaActiva >= 0) {
      const c = this.canaletas[this.indiceCanaletaActiva];
      if (c) {
        if (this.orientacionRegaderas === 'vertical') {
          let nuevaX = Math.round(coords.x - this.dragOffset);
          nuevaX = Math.max(g.x + 35, Math.min(g.x + g.w - 35, nuevaX));
          c.posicion = nuevaX;
        } else {
          let nuevaY = Math.round(coords.y - this.dragOffset);
          nuevaY = Math.max(g.y + 35, Math.min(g.y + g.h - 35, nuevaY));
          c.posicion = nuevaY;
        }
        this.canaletasChange.emit([...this.canaletas]);
        this.cdr.markForCheck();
      }
      return;
    }

    if (this.tipoArrastre && this.tipoArrastre.startsWith('terreno')) {
      const deltaX = coords.x - this.initialMouseSvgX;
      const deltaY = coords.y - this.initialMouseSvgY;

      const pxSpanW = this.MAX_PARCELA_W - this.MIN_PARCELA_W;
      const pxSpanH = this.MAX_PARCELA_H - this.MIN_PARCELA_H;

      const factorX = (this.MAX_M_ANCHO - 20) / pxSpanW;
      const factorY = (this.MAX_M_LARGO - 20) / pxSpanH;

      let nuevoAncho = this.initialAnchoM;
      let nuevoLargo = this.initialLargoM;

      if (this.tipoArrastre === 'terreno-width' || this.tipoArrastre === 'terreno-corner') {
        nuevoAncho = Math.round(this.initialAnchoM + deltaX * factorX);
        nuevoAncho = Math.max(20, Math.min(this.MAX_M_ANCHO, nuevoAncho));
      }

      if (this.tipoArrastre === 'terreno-height' || this.tipoArrastre === 'terreno-corner') {
        nuevoLargo = Math.round(this.initialLargoM + deltaY * factorY);
        nuevoLargo = Math.max(20, Math.min(this.MAX_M_LARGO, nuevoLargo));
      }

      // Emite cuando hay desplazamiento real mayor o igual a 2 metros
      if (Math.abs(nuevoAncho - this.anchoM) >= 2 || Math.abs(nuevoLargo - this.largoM) >= 2) {
        this.dimensionesChange.emit({ ancho: nuevoAncho, largo: nuevoLargo });
        this.cdr.markForCheck();
      }
    }
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    if (this.arrastrando) {
      this.arrastrando = false;
      this.tipoArrastre = null;
      this.indiceCanaletaActiva = -1;
      this.cdr.markForCheck();
    }
  }

  toggleCompuerta(index: number, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    if (this.canaletas[index]) {
      this.canaletas[index].abierta = !this.canaletas[index].abierta;
      this.canaletasChange.emit([...this.canaletas]);
      this.cdr.markForCheck();
    }
  }

  onEliminarCanaleta(index: number, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.eliminarCanaleta.emit(index);
  }

  curvaNivel(fraccionY: number): string {
    const g = this.geom;
    const yBase = g.y + g.h * fraccionY;
    const amp = 14;
    return `M ${g.x} ${yBase} Q ${g.x + g.w * 0.35} ${yBase - amp} ${g.x + g.w * 0.65} ${yBase + amp} T ${g.x + g.w} ${yBase}`;
  }

  get lineasDivision(): Array<{ x1: number; y1: number; x2: number; y2: number }> {
    const g = this.geom;
    const lines = [];

    if (this.numCuarteles === 2) {
      lines.push({ x1: g.x + g.w / 2, y1: g.y, x2: g.x + g.w / 2, y2: g.y + g.h });
    } else if (this.numCuarteles === 4) {
      lines.push({ x1: g.x + g.w / 2, y1: g.y, x2: g.x + g.w / 2, y2: g.y + g.h });
      lines.push({ x1: g.x, y1: g.y + g.h / 2, x2: g.x + g.w, y2: g.y + g.h / 2 });
    } else if (this.numCuarteles === 6) {
      lines.push({ x1: g.x + g.w * 0.333, y1: g.y, x2: g.x + g.w * 0.333, y2: g.y + g.h });
      lines.push({ x1: g.x + g.w * 0.666, y1: g.y, x2: g.x + g.w * 0.666, y2: g.y + g.h });
      lines.push({ x1: g.x, y1: g.y + g.h / 2, x2: g.x + g.w, y2: g.y + g.h / 2 });
    }
    return lines;
  }

  get sectoresCuarteles(): Array<{ nombre: string; superficieHa: number; estado: string; posX: number; posY: number }> {
    const g = this.geom;
    const sectors = [];
    const n = Math.max(1, this.numCuarteles || 1);
    const haSector = Number((this.superficieHa / n).toFixed(2));

    if (n === 1) {
      sectors.push({ nombre: 'Cuartel 1', superficieHa: haSector, estado: 'En Turno', posX: g.x + g.w / 2, posY: g.y + g.h / 2 });
    } else if (n === 2) {
      sectors.push({ nombre: 'Cuartel 1', superficieHa: haSector, estado: 'En Turno', posX: g.x + g.w * 0.25, posY: g.y + g.h / 2 });
      sectors.push({ nombre: 'Cuartel 2', superficieHa: haSector, estado: 'Próximo', posX: g.x + g.w * 0.75, posY: g.y + g.h / 2 });
    } else if (n === 4) {
      sectors.push({ nombre: 'Cuartel 1', superficieHa: haSector, estado: 'En Turno', posX: g.x + g.w * 0.25, posY: g.y + g.h * 0.25 });
      sectors.push({ nombre: 'Cuartel 2', superficieHa: haSector, estado: 'Espera', posX: g.x + g.w * 0.75, posY: g.y + g.h * 0.25 });
      sectors.push({ nombre: 'Cuartel 3', superficieHa: haSector, estado: 'Espera', posX: g.x + g.w * 0.25, posY: g.y + g.h * 0.75 });
      sectors.push({ nombre: 'Cuartel 4', superficieHa: haSector, estado: 'Regado', posX: g.x + g.w * 0.75, posY: g.y + g.h * 0.75 });
    } else if (n === 6) {
      for (let i = 0; i < 6; i++) {
        const col = i % 3;
        const row = Math.floor(i / 3);
        sectors.push({
          nombre: `Sector ${i + 1}`,
          superficieHa: haSector,
          estado: i === 0 ? 'En Turno' : 'Espera',
          posX: g.x + g.w * (col * 0.333 + 0.166),
          posY: g.y + g.h * (row * 0.5 + 0.25)
        });
      }
    }
    return sectors;
  }
}