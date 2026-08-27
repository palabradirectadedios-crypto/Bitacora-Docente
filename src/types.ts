/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Estudiante {
  id: string;
  nombre: string;
  grado: string;
  createdAt: string;
}

export type EstadoInforme = 'excelente' | 'bueno' | 'regular' | 'atencion_requerida';

export interface InformeEstudiante {
  id: string;
  estudianteId: string;
  fecha: string; // YYYY-MM-DD
  avance: string; // The text content of the report
  estado: EstadoInforme; // Status/progress level
  createdAt: string;
}

export type CategoriaExtra = 'imprevisto' | 'reunion' | 'observacion' | 'urgencia' | 'actividad';

export interface InformeExtra {
  id: string;
  titulo: string;
  fecha: string; // YYYY-MM-DD
  descripcion: string;
  categoria: CategoriaExtra;
  participantesIds: string[]; // List of registered Estudiante.id who participated (if any)
  createdAt: string;
}
