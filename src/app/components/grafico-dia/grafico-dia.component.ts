import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ApexChart, ApexAxisChartSeries,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions, NgApexchartsModule, 
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ChartComponent} from 'ng-apexcharts';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { FirestoreService } from '../../services/firestore.service';
import { Turno } from '../../models/turno';
import { jsPDF } from 'jspdf'; 
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  fill: ApexFill
};
@Component({
  selector: 'app-grafico-dia',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule],
  templateUrl: './grafico-dia.component.html',
  styleUrl: './grafico-dia.component.scss'
})
export class GraficoDiaComponent {
  chartOptions: Partial<ChartOptions> | any;
  fireSvc = inject(FirestoreService);
  @ViewChild("chart", { static: false }) chart!: ChartComponent;

  spinnerSvc = inject(NgxSpinnerService);
  listaTurnos: any[] = [];

  mySubscription!: Subscription;

constructor() {
    
    this.spinnerSvc.show();
    this.chartOptions = {
      series: [],
      chart: {
        height: 500,
        width: 700,
        type: "bar",
        background: '#f5f5f5',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 4,
          borderRadiusApplication: 'end',
          horizontal: false,
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        labels: {
          style: {
            colors: ['#006680','#006680','#006680','#006680','#006680','#006680'], 
            fontSize: '20px', 
            fontFamily: 'Noto',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: '#66af30',
            fontSize: '18px',
            fontFamily: 'Noto',
          },
        },
      },
      tooltip: {
        theme: 'light',
      },
      fill:{
        type: 'gradient',
        gradient: {
          shade: 'light', 
          type: 'vertical',
          shadeIntensity: 0.5,
          gradientToColors: ['#bee8f4'], 
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 0.6,
          stops: [0, 100],
          colorStops: [
            { offset: 0, color: '#006680', opacity: 1 },
            { offset: 100, color: '#bee8f4', opacity: 1 },
          ],
        },
      }
    };
  }
  ngAfterViewInit() {
    this.mySubscription = this.fireSvc.traerTurnos().subscribe((data) => {
      this.listaTurnos = data;
      console.log(this.listaTurnos);
      const cantidadEspecialidades = this.calcularTurnosPorDia(this.listaTurnos);
      console.log(cantidadEspecialidades);
      
      this.chartOptions.series = [
        {
          name:"Turnos",
          data:cantidadEspecialidades
        }
      ];
      this.chartOptions.plotOptions.bar.colors = {
        ranges: [{ from: 0, to: 5, color: '#00E396' }],
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
  calcularTurnosPorDia(turnos: Turno[]){
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const turnosPorDia: number[] = new Array(diasSemana.length).fill(0);

    turnos.forEach((turno) => {
      const dia = turno.fecha_turno.toDate().getDay(); 
      if (dia >= 1 && dia <= 6) {
        turnosPorDia[dia - 1]++;
      }
    });

    return turnosPorDia;
  }
  downloadPDF(): void {
    if (!this.chart || !this.chart.chart) {
      console.error('El gráfico no está disponible');
      return;
    }
    this.chart.dataURI().then((uri :any) => {
      const imgData = uri.imgURI;
      const doc = new jsPDF();
      const title = "Cantidad de turnos por Día";
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

      doc.save('cantidad_turnos_x_dia.pdf');
    }).catch((error) => {
      console.error('Error al obtener la imagen del gráfico:', error);
    });
  }
}
