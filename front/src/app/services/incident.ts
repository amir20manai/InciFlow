import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { IncidentResponse, IncidentStatus } from '../models/incident';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = 'http://localhost:8080/api/incidents';
  
  private incidentsSubject = new BehaviorSubject<IncidentResponse[]>([]);
  public incidents$ = this.incidentsSubject.asObservable();

  constructor(private http: HttpClient) { }

  createIncident(formData: FormData): Observable<IncidentResponse> {
    return this.http.post<IncidentResponse>(this.apiUrl, formData);
  }

  getAllIncidents(): Observable<IncidentResponse[]> {
    return this.http.get<IncidentResponse[]>(this.apiUrl).pipe(
      tap(data => this.incidentsSubject.next(data))
    );
  }

  getIncidentById(id: number): Observable<IncidentResponse> {
    return this.http.get<IncidentResponse>(`${this.apiUrl}/${id}`);
  }

  getAttachment(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/attachment`, { responseType: 'blob' });
  }

  getMyIncidents(): Observable<IncidentResponse[]> {
    return this.http.get<IncidentResponse[]>(`${this.apiUrl}/my-incidents`);
  }

  updateStatus(id: number, status: IncidentStatus): Observable<IncidentResponse> {
    return this.http.patch<IncidentResponse>(`${this.apiUrl}/${id}/status-update?status=${status}`, {});
  }

  assignAndStatus(incidentId: number, technicianId: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${incidentId}/assign-and-status?technicianId=${technicianId}&status=${status}`, {});
  }

  acceptIncidentWithIntervention(incidentId: number, technicianId: number): Observable<any> {
    const payload = { technicianId: technicianId };
    return this.http.post(`${this.apiUrl}/${incidentId}/accept`, payload);
  }

  rejectIncident(incidentId: number, data: { technicianId: number | null }): Observable<any> {
  return this.http.post(`${this.apiUrl}/${incidentId}/reject`, data);
}
}