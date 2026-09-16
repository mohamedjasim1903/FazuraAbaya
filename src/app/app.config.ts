import { ApplicationConfig } from '@angular/core';

import {
  provideRouter,
  withInMemoryScrolling
} from '@angular/router';

// IMPORTANT: initializeApp must come from '@angular/fire/app' (not
// 'firebase/app' directly) and must run INSIDE this factory, not at
// module scope. Mixing the two import paths, or calling initializeApp
// outside Angular's DI, causes:
// "Firebase: No Firebase App '[DEFAULT]' has been created" — the app
// ends up registered in one module instance while getFirestore()/
// getAuth()/getStorage() look for it in another. It can also cause
// "Component <x> has not been registered yet" if a raw firebase/app
// instance is later passed into @angular/fire's wrapped getAuth/
// getFirestore/getStorage, since those wrappers only complete their
// internal component registration when the app was created via
// @angular/fire's own initializeApp.
import {
  provideFirebaseApp,
  initializeApp
} from '@angular/fire/app';

import {
  provideFirestore,
  getFirestore
} from '@angular/fire/firestore';

import {
  provideAuth,
  getAuth
} from '@angular/fire/auth';

import {
  provideStorage,
  getStorage
} from '@angular/fire/storage';

import { routes } from './app.routes';

import { firebaseConfig } from './firebase.config';

export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),

    provideFirebaseApp(
      () => initializeApp(firebaseConfig)
    ),

    provideFirestore(
      () => getFirestore()
    ),

    provideAuth(
      () => getAuth()
    ),

    provideStorage(
      () => getStorage()
    )

  ]

};