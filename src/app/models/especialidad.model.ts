export interface Especialidad {
    id: string;
    nombre: string;
    duracionTurno: number;
    horariosAtencion: HorarioAtencion[] | null;
    foto: string | null | File;
}

export interface HorarioAtencion {
    dia: string;
    rangoHorario: { inicio: number; fin: number }; 
    habilitado:boolean;
}