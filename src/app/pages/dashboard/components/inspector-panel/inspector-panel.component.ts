import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UbicacionCanal } from '../../models/dashboard.models';
import { CATALOGO_CULTIVOS_CHILE, CultivoExtendido } from '../../data/cultivos.data';

@Component({
  selector: 'app-inspector-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspector-panel.component.html',
  styleUrls: ['./inspector-panel.component.scss']
})
export class InspectorPanelComponent {
  @Input() nombrePredio: string = '';
  @Input() anchoM: number = 100;
  @Input() largoM: number = 200;
  @Input() superficieHa: number = 2.0;
  @Input() numCuarteles: number = 2;
  @Input() cultivoKey: string = 'palto';
  @Input() ubicacionCanal: UbicacionCanal = 'norte';
  @Input() anchoBase: number = 0.80;
  @Input() tiranteCm: number = 40;
  @Input() pendientePorc: number = 0.15;
  @Input() tarifaM3CLP: number = 22;
  @Input() rugosidadManning: number = 0.015;
  @Input() guardando: boolean = false;

  @Output() cambioParametros = new EventEmitter<any>();
  @Output() agregarCanaleta = new EventEmitter<void>();
  @Output() conmutarOrientacion = new EventEmitter<void>();
  @Output() guardarTurno = new EventEmitter<void>();

  tabActiva: 'agronomico' | 'hidraulica' = 'agronomico';
  catalogos = CATALOGO_CULTIVOS_CHILE;

  get cultivoSeleccionado(): CultivoExtendido {
    return this.catalogos[this.cultivoKey] || this.catalogos['palto'] || Object.values(this.catalogos)[0];
  }

  emitirCambios(): void {
    this.cambioParametros.emit({
      nombrePredio: this.nombrePredio,
      anchoM: this.anchoM,
      largoM: this.largoM,
      cultivoKey: this.cultivoKey,
      ubicacionCanal: this.ubicacionCanal,
      anchoBase: this.anchoBase,
      tiranteCm: this.tiranteCm,
      pendientePorc: this.pendientePorc,
      tarifaM3CLP: this.tarifaM3CLP,
      rugosidadManning: this.rugosidadManning,
      numCuarteles: this.numCuarteles
    });
  }

  cambiarCultivo(): void {
    this.emitirCambios();
  }

  cambiarCuarteles(n: number): void {
    this.numCuarteles = n;
    this.emitirCambios();
  }

  setUbicacionCanal(p: UbicacionCanal): void {
    this.ubicacionCanal = p;
    this.emitirCambios();
  }

  onAgregarCanaleta(): void {
    this.agregarCanaleta.emit();
  }

  onConmutarOrientacion(): void {
    this.conmutarOrientacion.emit();
  }

  onGuardarTurno(): void {
    this.guardarTurno.emit();
  }
}