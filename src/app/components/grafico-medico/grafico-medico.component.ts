import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { Turno } from '../../models/turno';
import { ApexAxisChartSeries, ApexTitleSubtitle, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { FirestoreService } from '../../services/firestore.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf'; 
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  // dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  labels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-grafico-medico',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule,ReactiveFormsModule,FormsModule],
  templateUrl: './grafico-medico.component.html',
  styleUrl: './grafico-medico.component.scss'
})
export class GraficoMedicoComponent implements OnDestroy,AfterViewInit{
  chartOptions: Partial<ChartOptions> | any;
  fireSvc = inject(FirestoreService);
  @ViewChild("chart", { static: false }) chart!: ChartComponent;

  spinnerSvc = inject(NgxSpinnerService);
  listaTurnos: any[] = [];

  mySubscription!: Subscription;
  startDate: string = this.formatDate(new Date());
  endDate: string = this.formatDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000));
  constructor() {
    
    this.spinnerSvc.show();
    this.chartOptions = {
      series: [],
      chart: {
        height: 500,
        width: 700,
        type: "treemap",
        background: '#f5f5f5',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        treemap: {
          distributed: true, 
          enableShades: true,
        },
      },
      labels:[],
      xaxis: {
        labels: {
          rotate: -45, 
        },
      },
    };
  }
  ngAfterViewInit() {
    this.mySubscription = this.fireSvc.traerTurnos().subscribe((data) => {
      this.listaTurnos = data;
      console.log(this.listaTurnos);
      this.updateChartData();
      this.spinnerSvc.hide();

    });
  }
  ngOnDestroy(): void {
    // this.tablaRef.destroy();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  updateChartData(): void {
    const turnos = this.listaTurnos;
    const filteredTurnos = turnos.filter(turno => {
      const fechaTurno = turno.fecha_turno.toDate();
      return fechaTurno >= new Date(this.startDate) && fechaTurno <= new Date(this.endDate);
    });
    const turnosPorEspecialista = this.aggregateByEspecialista(filteredTurnos);
    const seriesData = Object.keys(turnosPorEspecialista).map(especialistaId => ({
      x: `${turnosPorEspecialista[especialistaId].nombre} ${turnosPorEspecialista[especialistaId].apellido}`,
      y: turnosPorEspecialista[especialistaId].turnos,
    }));
    this.chartOptions = {
      ...this.chartOptions,
      series: [{
        data: seriesData,
      }],
    };
  }
  private aggregateByEspecialista(turnos: any[]): any {
    return turnos.reduce((acc, turno) => {
      const especialistaId = turno.especialista.id;
      if (!acc[especialistaId]) {
        acc[especialistaId] = {
          nombre: turno.especialista.nombre,
          apellido: turno.especialista.apellido,
          turnos: 0,
        };
      }
      acc[especialistaId].turnos += 1;
      return acc;
    }, {});
  }
  downloadPDF(): void {
    if (!this.chart || !this.chart.chart) {
      console.error('El gráfico no está disponible');
      return;
    }
    this.chart.dataURI().then((uri :any) => {
      const imgData = uri.imgURI;
      const doc = new jsPDF();
      const title = "Cantidad de turnos por Especialista";
      const url = "clinica-calani-utn.web.app";
      doc.setTextColor(169, 169, 169);
      const pageWidth = doc.internal.pageSize.width;
    const textWidth = doc.getTextWidth(url); 
    const xPosition = (pageWidth - textWidth) / 2;
      doc.text(url, xPosition, 15);

      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);

      doc.text(title, 10, 30);

      doc.addImage(imgData, 'PNG', 10, 40, 180, 120);

      doc.save('turnos_por_medico.pdf');
    }).catch((error) => {
      console.error('Error al obtener la imagen del gráfico:', error);
    });
  }
}
