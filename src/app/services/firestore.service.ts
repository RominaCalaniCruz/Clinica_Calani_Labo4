import { inject, Injectable } from '@angular/core';
import {  addDoc, collection, collectionData, doc, Firestore, getDocs, orderBy, query, Timestamp, updateDoc} from '@angular/fire/firestore';
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
    return collectionData(col);
  }
  traerEspecialidades(){
    let col = collection(this.firestore, 'especialidades');
    const consulta = query(col, orderBy('nombre', 'asc'));
    return collectionData(query(col, orderBy('nombre', 'asc')));
  }
  async traerListass(coleccion: string) {
    const collectionRef = collection(this.firestore, coleccion);
    const querySnapshot = await getDocs(query(collectionRef, orderBy('nombre', 'asc')));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  async subirFotoEspecialidad(file: File, imageName: string){
    const storage = getStorage();
    const filePath = `fotos_especialidades/${imageName}`;
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
  async nuevoAdmin(admin: Usuario) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'usuarios'), admin);
      admin.id = docRef.id;
      await updateDoc(doc(this.firestore, 'usuarios', admin.id), { ...admin });
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

  cambiarEstado(estado: boolean, idUsuario : string){
    const coleccion = collection(this.firestore, 'usuarios');
    const documento = doc(coleccion,idUsuario);
    //console.log(cliente.nombre);
    //console.log(cliente.uid);
    return updateDoc(documento,{
      cuenta_habilitada: estado
    });
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

  actualizarEspecialidadesUsuario(userId: string, especialidades: any[]): Promise<void> {
    const coleccion = collection(this.firestore, 'usuarios');
    const documento = doc(coleccion,userId);

    return updateDoc(documento,{ especialidades });
  }

}
