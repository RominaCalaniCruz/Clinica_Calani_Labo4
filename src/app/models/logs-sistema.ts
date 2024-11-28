import { Timestamp } from "firebase/firestore";

export interface LogsSistema {
    fecha: Timestamp;
    correo: string; 
    nombre_completo: string;
    perfil: string;
    foto: string;
}
