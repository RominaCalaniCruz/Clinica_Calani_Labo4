import { Timestamp } from "firebase/firestore";
import { HistoriaClinica } from "./historia-clinica.model";
import { Encuesta } from "./encuesta.model";

export interface Turno {
    id: string;

    especialidad: {
        nombre:string,
        duracion: number,
    };

    especialista:{
        id:string,
        nombre:string,
        apellido:string
    };

    paciente:{
        id: string,
        nombre:string,
        apellido:string,
        foto: string
    };

    fecha_turno: Timestamp; //El paciente debe tener la posibilidad de elegir turno dentro de los proximos 15 dias

    fecha_turno_fin: Timestamp | null;

    estado: EstadoTurno; //VISIBLE EN TABLA

    comentario: string; //cuando se cancela el turno
    //LLenar encuesta si Turno REALIZADO y debe dejar comentario

    calificacion: number|null; //1 a 5 estrellas
    encuesta: Encuesta | null;
    resenia: string;//visible si hay comentario o resenia del doctor
    //completar Encuesta si el turno esta REALIZADO y tiene una resenia
    historiaClinica: HistoriaClinica | null;
}

export enum EstadoTurno {
    Pendiente = "Pendiente", 
    Aceptado = "Aceptado", 
    Rechazado = "Rechazado", 
    Cancelado = "Cancelado", 
    Finalizado = "Finalizado", 
  }

  export enum AccionesTurno {
    Cancelar = "Cancelar", 
    VerResenia = "Ver reseña",
    Rechazar = "Rechazar", 
    Aceptar = "Aceptar", 
    Finalizar = "Finalizar", 
    Encuesta = "Completar encuesta",
    Calificar = "Calificar atención",
    
  }