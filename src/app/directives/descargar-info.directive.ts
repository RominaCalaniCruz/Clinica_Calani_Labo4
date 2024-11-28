import { Directive, ElementRef, HostListener, inject, Input } from '@angular/core';
import { Perfil } from '../models/usuario';
import * as ExcelJS from 'exceljs';
import { ToastrService } from 'ngx-toastr';
import { FirestoreService } from '../services/firestore.service';

@Directive({
  selector: '[appDescargarInfo]',
  standalone: true
})
export class DescargarInfoDirective {
  toastM = inject(ToastrService);
  turnosLista : any[] = [];
  fireSvc = inject(FirestoreService);
  @Input('appDescargarInfo') usuario: any;

  constructor(private el: ElementRef) {

          
  }

  @HostListener('dblclick') async onDoubleClick() {
    if(this.usuario.perfil == Perfil.Paciente){
      try {
      this.turnosLista = await this.fireSvc.traerTurnosxIdPaciente(this.usuario.id)
       
        console.log(this.turnosLista);
        const nombrePaciente = this.usuario.nombre + ' ' + this.usuario.apellido;

        if(this.turnosLista.length == 0){
          this.toastM.info(`El paciente ${nombrePaciente} no tiene ningun turno aún.`)
        }
        else{
          await this.descargarExcel();
          this.toastM.success("Informacion de turnos descargado");
        }
      } catch (error) {
        this.toastM.error('Error al obtener los turnos:'+ error);
      }
    }
    
  }


  async descargarExcel(){
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Turnos');
    worksheet.mergeCells('A1:E1');
    const headerCell = worksheet.getCell('A1');
    headerCell.value = `Lista de Turnos de: ${this.usuario.nombre} ${this.usuario.apellido}`;
    headerCell.alignment = { vertical: 'middle', horizontal: 'center' };
    headerCell.font = { bold: true, size: 14 };
    headerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'bee8f4' },
    };

    worksheet.getCell('A2').value = 'Especialista';
  worksheet.getCell('B2').value = 'Especialidad';
  worksheet.getCell('C2').value = 'Fecha del turno';
  worksheet.getCell('D2').value = 'Estado del Turno';
  worksheet.getCell('E2').value = 'Duracion del Turno (minutos)';
  const headerRow = worksheet.getRow(2);
  headerRow.eachCell((cell) => {
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '006680' },
    };
    cell.font = {
      color: { argb: 'FFFFFFFF' },
    };
  });


    worksheet.columns = [
      { width: 20 }, 
      { width: 20 },  
      { width: 20 },  
      { width: 20 },
      { width: 30 }, 
    ];

    this.turnosLista.forEach((turno)=>{
      worksheet.addRow([`${turno.especialista.nombre} ${turno.especialista.apellido}`,
        turno.especialidad.nombre,
        turno.fecha_turno.toDate().toLocaleString(),
        turno.estado,
        turno.especialidad.duracion
      ]);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const nombrePaciente = this.usuario.nombre + ' ' + this.usuario.apellido;
    anchor.download = `turnos_${nombrePaciente}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  
      
  }
}
