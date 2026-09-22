// Importation des outils Angular et RxJS
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
// Modèles d'incident
import { IncidentResponse, IncidentStatus } from '../models/incident';

// Service injectable dans toute l'application (singleton)
@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  // URL de base de l'API des incidents
  private apiUrl = 'http://localhost:8080/api/incidents';

  // BehaviorSubject : conserve en mémoire la dernière liste d'incidents chargée
  private incidentsSubject = new BehaviorSubject<IncidentResponse[]>([]);
  // Observable public pour que les composants puissent s'y abonner
  public incidents$ = this.incidentsSubject.asObservable();

  // Injection du client HTTP
  constructor(private http: HttpClient) { }

  // Crée un nouvel incident (avec upload d'image via FormData)
  createIncident(formData: FormData): Observable<IncidentResponse> {
    return this.http.post<IncidentResponse>(this.apiUrl, formData);
  }

  // Récupère tous les incidents et met à jour le BehaviorSubject
  getAllIncidents(): Observable<IncidentResponse[]> {
    return this.http.get<IncidentResponse[]>(this.apiUrl).pipe(
      // Enregistre la liste dans le BehaviorSubject à chaque nouvelle récupération
      tap(data => this.incidentsSubject.next(data))
    );
  }

  // Récupère un incident par son ID
  getIncidentById(id: number): Observable<IncidentResponse> {
    return this.http.get<IncidentResponse>(`${this.apiUrl}/${id}`);
  }

  // Récupère la pièce jointe (image) d'un incident sous forme de Blob
  getAttachment(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/attachment`, { responseType: 'blob' });
  }

  // Récupère les incidents de l'utilisateur connecté
  getMyIncidents(): Observable<IncidentResponse[]> {
    return this.http.get<IncidentResponse[]>(`${this.apiUrl}/my-incidents`);
  }

  // Met à jour le statut d'un incident
  updateStatus(id: number, status: IncidentStatus): Observable<IncidentResponse> {
    return this.http.patch<IncidentResponse>(
      `${this.apiUrl}/${id}/status-update?status=${status}`,
      {}
    );
  }

  // Assigne un technicien et change le statut en une seule opération
  assignAndStatus(incidentId: number, technicianId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${incidentId}/assign-and-status?technicianId=${technicianId}&status=${status}`,
      {}
    );
  }

  // Accepte un incident : crée automatiquement une intervention pour le technicien
  acceptIncidentWithIntervention(incidentId: number, technicianId: number): Observable<any> {
    const payload = { technicianId: technicianId };
    return this.http.post(`${this.apiUrl}/${incidentId}/accept`, payload);
  }

  // Rejette un incident (le technicien est optionnel)
  rejectIncident(incidentId: number, data: { technicianId: number | null }): Observable<any> {
    return this.http.post(`${this.apiUrl}/${incidentId}/reject`, data);
  }
}