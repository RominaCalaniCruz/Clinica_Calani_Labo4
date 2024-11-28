import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
// import {
//   ApexAxisChartSeries,
//   ApexChart,
//   ChartComponent,
//   ApexDataLabels,
//   ApexPlotOptions,
//   ApexYAxis,
//   ApexLegend,
//   ApexStroke,
//   ApexXAxis,
//   ApexFill,
//   ApexTooltip
// } from "ng-apexcharts";
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
// import * as $ from 'jquery';
// declare var $: any;

// import 'datatables.net';
import { FirestoreService } from '../../services/firestore.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { Turno } from '../../models/turno';
import { jsPDF } from 'jspdf'; 
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
};

@Component({
  selector: 'app-grafico-esp',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule],
  providers: [DatePipe],
  templateUrl: './grafico-esp.component.html',
  styleUrl: './grafico-esp.component.scss'
})
export class GraficoEspComponent implements OnDestroy {
  fireSvc = inject(FirestoreService);
  // toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  tablaRef: any;
  mySubscription!: Subscription;
  loading = true;
  chartOptions: Partial<ChartOptions> | any;
  @ViewChild("chart", { static: false }) chart!: ChartComponent;
  listaTurnos: any[] = [];
  constructor(private pipeFecha: DatePipe) {
    this.spinnerSvc.show();
    this.chartOptions = {
      series: [],
      chart: {
        width: 380,
        type: "pie"
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ]
    };
  }
  ngAfterViewInit() {
    this.mySubscription = this.fireSvc.traerTurnos().subscribe((data) => {
      this.listaTurnos = data;
      this.loading = false;
      console.log(this.listaTurnos);
      const cantidadEspecialidades = this.calcularTurnosPorEspecialidad(this.listaTurnos);
      console.log(Object.keys(cantidadEspecialidades));
      
      this.chartOptions = {
        series: Object.values(cantidadEspecialidades), 
        chart: {
          width: 650,
          type: 'pie',
        },
        labels: Object.keys(cantidadEspecialidades), 
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 300,
              },
              legend: {
                position: 'bottom',
              },
            },
          },
        ],
        legend: {
          position: 'bottom',
          fontSize: '20px',  
          labels: {
            colors: "#00668",
          },
        },
      };
      this.spinnerSvc.hide();

    });
  }
  ngOnDestroy(): void {
    // this.tablaRef.destroy();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }
  calcularTurnosPorEspecialidad(turnos: Turno[]): Record<string, number> {
    const especialidadesCount: Record<string, number> = {};

    turnos.forEach((turno) => {
      const especialidad = turno.especialidad.nombre;
      if (!especialidadesCount[especialidad]) {
        especialidadesCount[especialidad] = 0;
      }
      especialidadesCount[especialidad]++;
    });

    return especialidadesCount;
  }
  downloadPDF(): void {
    if (!this.chart || !this.chart.chart) {
      console.error('El gráfico no está disponible');
      return;
    }
    this.chart.dataURI().then((uri :any) => {
      const imgData = uri.imgURI;
      const doc = new jsPDF();
      const title = "Cantidad de turnos por Especialidad";
      const url = "clinica-calani-utn.web.app";
      // const iconUrl = "https://drive.google.com/file/d/1GfVZt69ssQct1UNKeu6MvRSO3sX6bZ1P/view";
      // doc.addImage(iconUrl, 'PNG', 10, 10, 15, 15);
      // doc.setFontSize(12);
      doc.setTextColor(169, 169, 169);
      const pageWidth = doc.internal.pageSize.width;
    const textWidth = doc.getTextWidth(url); 
    const xPosition = (pageWidth - textWidth) / 2;
      doc.text(url, xPosition, 15);

      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0); // Restablecer color a negro para el título

      doc.text(title, 10, 30);

      doc.addImage(imgData, 'PNG', 10, 40, 180, 120);

      doc.save('turnos_x_especialidad.pdf');
    }).catch((error) => {
      console.error('Error al obtener la imagen del gráfico:', error);
    });
  }
}
