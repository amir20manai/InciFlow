import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { IncidentResponse, IncidentStatus } from '../models/incident';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private apiUrl = 'http://localhost:8080/api/incidents';
  
  // مخزن مؤقت للحفاظ على الداتا عند التنقل بين الصفحات
  private incidentsSubject = new BehaviorSubject<IncidentResponse[]>([]);
  public incidents$ = this.incidentsSubject.asObservable();

  constructor(private http: HttpClient) { }

  // إنشاء بلاغ جديد (الـ Interceptor يتكفل بإضافة الـ Token وحدو)
  createIncident(formData: FormData): Observable<IncidentResponse> {
    return this.http.post<IncidentResponse>(this.apiUrl, formData);
  }

  // جلب الداتا وتحديث الـ Subject تلقائياً
  loadAllIncidents(): void {
    this.http.get<IncidentResponse[]>(this.apiUrl).subscribe({
      next: (data) => this.incidentsSubject.next(data),
      error: (err) => console.error('Error loading incidents:', err)
    });
  }

  // جلب كل البلاغات للأدمن
  getAllIncidents(): Observable<IncidentResponse[]> {
    return this.http.get<IncidentResponse[]>(this.apiUrl).pipe(
      tap(data => this.incidentsSubject.next(data))
    );
  }

  // جلب حادثة واحدة بالـ ID (مهمة لصفحة التفاصيل عند عمل Refresh مباشر)
  getIncidentById(id: number): Observable<IncidentResponse> {
    return this.http.get<IncidentResponse>(`${this.apiUrl}/${id}`);
  }

  // جلب المرفق (التصويرة) الخاص بالحادثة كـ Blob مع تمرير الـ Token تلقائياً
  getAttachment(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/attachment`, { responseType: 'blob' });
  }

  // جلب بلاغات المستخدم الحالي
  getMyIncidents(): Observable<IncidentResponse[]> {
    return this.http.get<IncidentResponse[]>(`${this.apiUrl}/my-incidents`).pipe(
      tap(data => console.log('DATA RECEIVED from backend:', data)),
      catchError(error => {
        console.error('ERROR in getMyIncidents:', error);
        return throwError(() => error);
      })
    );
  }

  // تحديث حالة البلاغ
  updateStatus(id: number, status: IncidentStatus): Observable<IncidentResponse> {
    return this.http.patch<IncidentResponse>(`${this.apiUrl}/${id}/status-update?status=${status}`, {});
  }
}