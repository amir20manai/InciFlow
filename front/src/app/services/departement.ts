// Importation des outils Angular et RxJS
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface représentant un département
export interface Department {
  id?: number;              // ID du département (optionnel car généré par le backend)
  name: string;             // Nom du département
  membersCount: number;     // Nombre de membres
  headName: string;         // Nom du responsable (chef de département)
  headInitials?: string;    // Initiales du chef (calculées côté front)
  headColor?: string;       // Couleur de l'avatar du chef (calculée côté front)
}

// Service de gestion des départements
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  // URL de base de l'API des départements
  private apiUrl = 'http://localhost:8080/api/departments';

  // Injection du client HTTP
  constructor(private http: HttpClient) {}

  // Récupère tous les départements
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  // Crée un nouveau département
  createDepartment(payload: { name: string; headName: string }): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, payload);
  }

  // Met à jour un département existant
  updateDepartment(id: number, payload: { name: string; headName: string }): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, payload);
  }

  // Supprime un département par son ID
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}