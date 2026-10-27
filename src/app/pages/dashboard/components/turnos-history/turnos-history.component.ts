import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-turnos-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './turnos-history.component.html',
  styleUrls: ['./turnos-history.component.scss']
})
export class TurnosHistoryComponent {
  @Input() historial: any[] = [];
  @Output() eliminarRegistro = new EventEmitter<string>();

  onEliminar(id: string): void {
    this.eliminarRegistro.emit(id);
  }
}