import { inject, Injectable } from '@angular/core';
import {  addDoc, collection, collectionData, doc, Firestore, orderBy, query, Timestamp, updateDoc} from '@angular/fire/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  StringFormat,
  uploadBytes,
} from 'firebase/storage';
import { Especialidad } from '../models/especialidad.model';
import { LogsSistema } from '../models/logs-sistema';
import { Especialista, Paciente, Usuario } from '../models/usuario';
import { map, Observable } from 'rxjs';
export interface Message{
  email: string,
  nombre: string,
  fecha: Timestamp,
  mensaje: string
}

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) { }

  setDocument(obj: any, nombreCol: string){
    return addDoc(collection(this.firestore, nombreCol), obj);
  }

  guardarDato(coleccionName:string, objeto:any){
    let col = collection(this.firestore,coleccionName);
    return addDoc(col, objeto);
  }

  guardarLog(email: string) {
    const currentDate = Timestamp.fromDate(new Date());
    const log : LogsSistema = {
      usuario_email: email,
      fecha: currentDate
    };
    this.guardarDato('logs_sistema', log);
  }

  traerLista(coleccionNombre:string){
    let col = collection(this.firestore, coleccionNombre);
    const consulta = query(col, orderBy('fecha', 'desc'));
    return collectionData(query(col, orderBy('fecha', 'desc')));
  }
  traerEspecialidades(){
    let col = collection(this.firestore, 'especialidades');
    const consulta = query(col, orderBy('nombre', 'asc'));
    return collectionData(query(col, orderBy('nombre', 'asc')));
  }

  async subirFotoPerfil(file: File, imageName: string){
    const storage = getStorage();
    const filePath = `fotos_perfil/${imageName}`;
    const fileRef = ref(storage,filePath);
    // const task = this.storage.upload(filePath, file);
    // const url = getDownloadURL(fileRef);
    try {
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      throw error; 
    }
  }
  async nuevaEsp(esp:Especialidad) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'especialidades'), esp);
      esp.id = docRef.id;
      await updateDoc(doc(this.firestore, 'especialidades', esp.id), { ...esp });
      return docRef;
    } catch (error) {
      console.error('Error al agregar documento:', error);
      throw error;
    }
  }

  async nuevoEspecialista(doctor: Especialista) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'usuarios'), doctor);
      doctor.id = docRef.id;
      await updateDoc(doc(this.firestore, 'usuarios', doctor.id), { ...doctor });
      return docRef;
    } catch (error) {
      console.error('Error al agregar documento:', error);
      throw error;
    }
  }

  async nuevoPaciente(paciente: Paciente) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'usuarios'), paciente);
      paciente.id = docRef.id;
      await updateDoc(doc(this.firestore, 'usuarios', paciente.id), { ...paciente });
      return docRef;
    } catch (error) {
      console.error('Error al agregar documento:', error);
      throw error;
    }
  }

  obtenerAdminLogueado(email:string){
    const usersRef = collection(this.firestore, 'admins');
    const observable = collectionData(usersRef);
    let usuarios:Array<Usuario> = [];
    observable.subscribe((respuesta:any)=>{
      usuarios = respuesta as Array<Usuario>;      
      return usuarios.find((x)=>x.email ==email);
    });
    return usuarios.find((x)=>x.email ==email);
  }

  obtenerUsuarioDatos(email:string){
    const usersRef = collection(this.firestore, 'usuarios');
    const observable = collectionData(usersRef);
  
    return new Promise((resolve, reject) => {
      observable.subscribe({
        next: (usuarios: any[]) => {
          const usuario = usuarios.find((x: any) => x.email === email);
          resolve(usuario);
        },
        error: (error:any) => {
          console.error("Error al obtener el usuario:", error);
          reject(error);
        }
      });
    });
  }

  obtenerDoctorLogueado(email:string){
    const usersRef = collection(this.firestore, 'especialistas');
    const observable = collectionData(usersRef) as Observable<Especialista[]>;
    // let usuarios:Array<Especialista> = [];
    // observable.subscribe((respuesta:any)=>{
    //   usuarios = respuesta as Array<Especialista>;      
    //   return usuarios.find((x)=>x.email == email);
    // });
    // return usuarios.find((x)=>x.email ==email);
    return observable.pipe(map((users: Especialista[])=> users.find((x:Especialista)=>x.email == email)));
  }

  async buscarUsuarioPorEmail(email: string): Promise<any | null> {
    const colecciones = ['pacientes', 'especialistas', 'adminis'];
  
    for (const coleccion of colecciones) {
      const usersRef = collection(this.firestore, coleccion);
      const observable = await collectionData(usersRef).toPromise() as Array<any>;
      const usuarioEncontrado = observable.find((user) => user.email === email);
      if (usuarioEncontrado) {
        return { ...usuarioEncontrado }; 
      }
    }
    return null;
  }

}
