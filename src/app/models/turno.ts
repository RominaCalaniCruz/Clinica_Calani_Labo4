import { Timestamp } from "firebase/firestore";

export interface Turno {
    id: string;
    especialidad_id: string;
    especialista_id: string;
    paciente_id:string;
    fecha_turno: Timestamp; //El paciente debe tener la posibilidad de elegir turno dentro de los proximos 15 dias
    fecha_turno_fin: Timestamp | null;
    estado: EstadoTurno;
    comentario: string;
    resenia: string;
    
}

export enum EstadoTurno {
    Libre = "Libre", 
    Pendiente = "Pendiente", 
    Aceptado = "Aceptado", 
    Rechazado = "Rechazado", 
    Cancelado = "Cancelado", 
    Realizado = "Realizado", 
  }