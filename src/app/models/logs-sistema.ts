import { Timestamp } from "firebase/firestore";

export interface LogsSistema {
    id: string;
    fecha: Timestamp;
    usuario_email: string; 
    
}
