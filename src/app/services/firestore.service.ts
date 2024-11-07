import { inject, Injectable } from '@angular/core';
import {  addDoc, collection, collectionData, doc, Firestore, orderBy, query, Timestamp, updateDoc} from '@angular/fire/firestore';
import {
  getDownloadURL,
  getStorage,
  ref,
  StringFormat,
  uploadBytes,
} from 'firebase/storage';
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
    const log = {
      user: email,
      date: currentDate,
    };
    this.guardarDato('logs_users', log);
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
  async nuevaEsp(nombreArea: string) {
    try {
      let sector = {
        id: '',
        nombre: nombreArea
      }
      const docRef = await addDoc(collection(this.firestore, 'especialidades'), sector);
      sector.id = docRef.id;
      await updateDoc(doc(this.firestore, 'especialidades', sector.id), { ...sector });
      return docRef;
    } catch (error) {
      console.error('Error al agregar documento:', error);
      throw error;
    }
  }
  // async nuevoChofer(chofer: Chofer) {
  //   try {
  //     const docRef = await addDoc(collection(this.firestore, 'choferes'), chofer);
  //     chofer.id = docRef.id;
  //     this.actualizarChofer(chofer);
  //     return docRef;
  //   } catch (error) {
  //     console.error('Error al agregar documento:', error);
  //     throw error;
  //   }
  // }
}
