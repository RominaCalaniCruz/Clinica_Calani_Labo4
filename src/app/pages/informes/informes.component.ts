import { Component } from '@angular/core';
import { GraficoEspComponent } from '../../components/grafico-esp/grafico-esp.component';
import { GraficoDiaComponent } from '../../components/grafico-dia/grafico-dia.component';
import { GraficoMedicoComponent } from '../../components/grafico-medico/grafico-medico.component';
import { ListaLogsComponent } from '../../components/lista-logs/lista-logs.component';
import { GraficoMedicoFinComponent } from '../../components/grafico-medico-fin/grafico-medico-fin.component';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [GraficoEspComponent,GraficoDiaComponent,GraficoMedicoComponent,ListaLogsComponent,GraficoMedicoFinComponent],
  templateUrl: './informes.component.html',
  styleUrl: './informes.component.scss'
})
export class InformesComponent {

}
