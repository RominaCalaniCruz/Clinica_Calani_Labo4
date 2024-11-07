export interface Especialidad {
    id: string;
    nombre: string;
    duracionTurno: number;
    horariosAtencion: HorarioAtencion[] | null;
}

export interface HorarioAtencion {
    dia: string;
    rangoHorario: { inicio: string; fin: string }; 
}