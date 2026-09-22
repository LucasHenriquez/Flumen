import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface LivePreviewData {
  compuerta: string;
  tiempo: string;
  volumen: string;
  caudal: string;
  caudalLps: string;
  tirante: string;
  monto: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, OnDestroy {
  private timer: any;
  private currentIndex = 0;

  turnosDemo: LivePreviewData[] = [
    {
      compuerta: 'Compuerta Matriz 04',
      tiempo: '03h 45m',
      volumen: '2.500 m³',
      caudal: '0.185 m³/s',
      caudalLps: '185 L/s',
      tirante: '50 cm',
      monto: '$45.000 CLP'
    },
    {
      compuerta: 'Derivador Secundario El Sauce',
      tiempo: '01h 20m',
      volumen: '800 m³',
      caudal: '0.166 m³/s',
      caudalLps: '166 L/s',
      tirante: '35 cm',
      monto: '$14.400 CLP'
    },
    {
      compuerta: 'Tranque Comunitario Las Palmas',
      tiempo: '08h 10m',
      volumen: '12.000 m³',
      caudal: '0.410 m³/s',
      caudalLps: '410 L/s',
      tirante: '85 cm',
      monto: '$180.000 CLP'
    }
  ];

  demoActiva = this.turnosDemo[0];

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.turnosDemo.length;
      this.demoActiva = this.turnosDemo[this.currentIndex];
    }, 4500);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}