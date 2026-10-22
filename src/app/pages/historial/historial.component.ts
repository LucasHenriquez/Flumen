import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { AforoService } from '../../services/aforo.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './historial.component.html'
})
export class HistorialComponent implements OnInit {
  historial: any[] = [];
  cargando: boolean = true;
  errorMensaje: string = '';

  constructor(
    private aforoService: AforoService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarHistorial();
    }
  }

  cargarHistorial(): void {
    this.cargando = true;
    this.errorMensaje = '';

    this.aforoService.obtenerHistorial().subscribe({
      next: (res: any) => {
        console.log('📦 Registros recibidos desde MongoDB:', res);

        if (Array.isArray(res)) {
          this.historial = res;
        } else if (res && Array.isArray(res.historial)) {
          this.historial = res.historial;
        } else if (res && Array.isArray(res.data)) {
          this.historial = res.data;
        } else {
          this.historial = [];
        }

        this.cargando = false;
        this.cdr.detectChanges(); // 🚀 Forzar renderizado inmediato sin error NG0100
      },
      error: (err: any) => {
        console.error('❌ Error al consultar historial:', err);
        this.errorMensaje = 'No se pudo obtener el historial desde la base de datos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}