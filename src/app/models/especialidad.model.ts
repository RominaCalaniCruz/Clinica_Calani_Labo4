export interface Especialidad {
    id: string;
    nombre: string;
    duracionTurno: number;
    horariosAtencion: HorarioAtencion[] | null;
    foto: string | null | File;
}

export interface HorarioAtencion {
    dia: string;
    rangoHorario: { inicio: string; fin: string }; 
    habilitado:boolean;
}