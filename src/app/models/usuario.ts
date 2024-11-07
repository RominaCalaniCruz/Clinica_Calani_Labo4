import { Especialidad } from "./especialidad.model";

export interface Usuario {
    id: string;
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    edad: number;
    dni: number;
    foto1: string;
    perfil: Perfil 
}
export interface Paciente extends Usuario{
    obraSocial:string;
    foto2: string;
}

export interface Especialista extends Usuario{
    especialidades: Especialidad[];
    cuenta_habilitada: boolean;
}



export enum Perfil {
    Especialista = "Especialista",
    Paciente = "Paciente",
    Administrador = "Administrador"
}
  
