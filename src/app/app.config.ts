import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import {provideSpinnerConfig} from 'ngx-spinner'
import { env } from '../environmentConfig';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideStorage,getStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimationsAsync(),
    provideSpinnerConfig({type:'ball-clip-rotate-multiple'}),
    provideFirebaseApp(() => initializeApp(env.firebaseConfig)), 
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    provideHttpClient(),
    provideToastr({
      timeOut: 2500,
      progressBar: true,
      closeButton: true,
      toastClass:'estilo ngx-toastr'
    }),
  ]
};
