import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { DataTable } from 'simple-datatables';

import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-lista-logs',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],

  templateUrl: './lista-logs.component.html',
  styleUrl: './lista-logs.component.scss'
})
export class ListaLogsComponent implements OnInit, AfterViewInit, OnDestroy {
  fireSvc = inject(FirestoreService);
  // toastM = inject(ToastrService);
  router = inject(Router);
  spinnerSvc = inject(NgxSpinnerService);
  tablaRef: any;
  mySubscription!: Subscription;
  loading = true;
  listaLogs: any[] = [];
  constructor(private pipeFecha: DatePipe) {
    this.spinnerSvc.show();
  }
  formatData(data: any[]): any[] {
    return data.map(item => {
      const formateada = this.pipeFecha.transform(item.fecha.toDate(), 'EEEE dd MMM - HH:mm', undefined, 'es-AR');
      return {
        ...item,
        fecha: formateada,
        foto: `<img src="${item.foto}" class="rounded-full" alt="Imagen" width="50" height="auto">`
      };
    });
  }
  ngOnDestroy(): void {
    this.tablaRef.destroy();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
  }
  ngAfterViewInit() {
    this.mySubscription = this.fireSvc.traerLogs().subscribe((data) => {
      this.listaLogs = data;
      this.loading = false;
      this.spinnerSvc.hide();
      console.log(this.listaLogs);

      this.tablaRef = new DataTable("#pagination-table", {
        perPage: 5,
        perPageSelect: [5, 10, 15],
        searchable: true,
        sortable: false,
        labels: {
          placeholder: "Buscar log...",
          perPage: "Registros por página",
          noRows: "No se encontraron registros",
          info: "Mostrando {start} a {end} de {rows} registros",
          noResults: "No se encontraron resultados",
        },
        template: (options, dom) => 
          `<div class='${options.classes.top}'>
          
              ${options.paging && options.perPageSelect ? `
                <div class='${options.classes.dropdown}'>
                <label>
                    <select class='${options.classes.selector}'></select> ${options.labels.perPage}
                </label>
                </div>` : ""
            }
             <button id="download-btn" type="button" class="flex items-center text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm md:text-lg px-5 py-2.5 text-center md:me-2 md:mb-2"
               >
                    <p class="cursor-pointer">Descargar Excel</p> 
                </button>
        ${options.searchable ?
            `<div class='${options.classes.search}'>
                <input class='${options.classes.input}' placeholder='${options.labels.placeholder}' type='search' title='${options.labels.searchTitle}'${dom.id ? ` aria-controls="${dom.id}"` : ""}>
            </div>` :
            ""
          }
    </div>
    <div class='${options.classes.container}'${options.scrollY.length ? ` style='height: ${options.scrollY}; overflow-Y: auto;'` : ""}></div>
    <div class='${options.classes.bottom}'>
        ${options.paging ?
            `<div class='px-5  ${options.classes.info}'></div>` :
            ""
          }
        <nav class='px-5 ${options.classes.pagination}'></nav>
    </div>`
      });
      const downloadButton = document.getElementById('download-btn');
      if (downloadButton) {
        downloadButton.addEventListener('click', () => this.descargarExcel());
      }
      // console.log(this.formatData(this.listaLogs));
      this.tablaRef.insert(this.formatData(this.listaLogs));
    });
  }
  ngOnInit() {
    

  }
  async descargarExcel(){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Logs');
    worksheet.columns = [
      { header: 'Correo electronico', key: 'correo', width: 25 },
      { header: 'Nombre Completo', key: 'nombre_completo', width: 35 },
      { header: 'Perfil', key: 'perfil', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 25 },

    ];

    this.listaLogs.forEach((log:any) => {
      worksheet.addRow({
        correo: log.correo,
        nombre_completo: log.nombre_completo,
        perfil: log.perfil,
        fecha: this.pipeFecha.transform(log.fecha.toDate(), 'dd/MM/yyyy - HH:mm', undefined, 'es-AR')
      });
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '006680' },
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'logs_sistema.xlsx';
    anchor.click();
    window.URL.revokeObjectURL(url);
  
      
  }
}
