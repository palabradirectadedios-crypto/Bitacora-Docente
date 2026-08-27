/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  getDocs,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Estudiante, InformeEstudiante, InformeExtra } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection to Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or connecting...");
    }
  }
}

// Estudiantes Firestore Operations
export function subscribeToEstudiantes(
  onData: (data: Estudiante[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'estudiantes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: Estudiante[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Estudiante);
      });
      // Sort by creation or name
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
      onData(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveEstudianteToFirestore(est: Estudiante) {
  const path = `estudiantes/${est.id}`;
  try {
    await setDoc(doc(db, 'estudiantes', est.id), est);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEstudianteFromFirestore(id: string) {
  const path = `estudiantes/${id}`;
  try {
    await deleteDoc(doc(db, 'estudiantes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Informes Estudiantes Firestore Operations
export function subscribeToInformesEstudiantes(
  onData: (data: InformeEstudiante[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'informes_estudiantes';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: InformeEstudiante[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as InformeEstudiante);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveInformeEstudianteToFirestore(informe: InformeEstudiante) {
  const path = `informes_estudiantes/${informe.id}`;
  try {
    await setDoc(doc(db, 'informes_estudiantes', informe.id), informe);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateInformeEstudianteInFirestore(id: string, updated: Partial<InformeEstudiante>) {
  const path = `informes_estudiantes/${id}`;
  try {
    await updateDoc(doc(db, 'informes_estudiantes', id), updated);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInformeEstudianteFromFirestore(id: string) {
  const path = `informes_estudiantes/${id}`;
  try {
    await deleteDoc(doc(db, 'informes_estudiantes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Informes Extra Firestore Operations
export function subscribeToInformesExtra(
  onData: (data: InformeExtra[]) => void,
  onError?: (err: unknown) => void
) {
  const path = 'informes_extra';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const list: InformeExtra[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as InformeExtra);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(list);
    },
    (error) => {
      onError?.(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveInformeExtraToFirestore(informe: InformeExtra) {
  const path = `informes_extra/${informe.id}`;
  try {
    await setDoc(doc(db, 'informes_extra', informe.id), informe);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateInformeExtraInFirestore(id: string, updated: Partial<InformeExtra>) {
  const path = `informes_extra/${id}`;
  try {
    await updateDoc(doc(db, 'informes_extra', id), updated);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInformeExtraFromFirestore(id: string) {
  const path = `informes_extra/${id}`;
  try {
    await deleteDoc(doc(db, 'informes_extra', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Clear all collections in Firestore
export async function clearAllFirestoreData() {
  try {
    const estSnap = await getDocs(collection(db, 'estudiantes'));
    for (const d of estSnap.docs) {
      await deleteDoc(doc(db, 'estudiantes', d.id));
    }

    const infSnap = await getDocs(collection(db, 'informes_estudiantes'));
    for (const d of infSnap.docs) {
      await deleteDoc(doc(db, 'informes_estudiantes', d.id));
    }

    const extraSnap = await getDocs(collection(db, 'informes_extra'));
    for (const d of extraSnap.docs) {
      await deleteDoc(doc(db, 'informes_extra', d.id));
    }
  } catch (error) {
    console.warn('Error clearing Firestore data:', error);
  }
}

