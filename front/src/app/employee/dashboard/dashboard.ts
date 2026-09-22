import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router'; 
import { IncidentService } from '../../services/incident'; 
import { NotificationService, NotificationResponse } from '../../services/notification'; 
import { IncidentResponse } from '../../models/incident'; 
 
@Component({ 
  selector: 'app-employee-dashboard', 
  standalone: true, 
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './dashboard.html', 
  styleUrls: ['./dashboard.css'] 
}) 
export class Dashboard implements OnInit { 
  globalSearch: string = ''; 
  userName: string = 'Alex'; 
   
  metrics = [ 
    { title: 'Total des rapports', value: '0', iconBg: 'rgba(37, 99, 235, 0.15)', iconColor: '#3b82f6' }, 
    { title: 'Rejeté', value: '0', iconBg: 'rgba(239, 68, 68, 0.15)', iconColor: '#ef4444' },    
    { title: 'Résolu', value: '0', iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#10b981' }    
  ]; 
 
  recentReports: any[] = []; 
  notifications: any[] = []; 
 
  constructor( 
    private incidentService: IncidentService, 
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef 
  ) {} 
 
  ngOnInit(): void { 
    const token = localStorage.getItem('token'); 
    if (token) { 
      try { 
        const base64Url = token.split('.')[1]; 
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); 
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => { 
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); 
        }).join('')); 
         
        const payload = JSON.parse(jsonPayload); 
        const fName = payload.firstName || ''; 
        const lName = payload.lastName || ''; 
         
        if (fName) { 
          this.userName = `${fName} ${lName}`.trim(); 
        } 
      } catch (e) { 
        console.error('Error decoding token in dashboard', e); 
      } 
    } 
 
    this.loadDashboardData(); 
  } 
 
  loadDashboardData(): void {
    // 1. Load Incidents & Metrics
    this.incidentService.getMyIncidents().subscribe({ 
      next: (incidents: IncidentResponse[]) => { 
        if (!incidents || !Array.isArray(incidents) || incidents.length === 0) { 
          this.recentReports = []; 
          this.cdr.detectChanges(); 
          return; 
        } 
 
        const total = incidents.length; 
        const resolved = incidents.filter(i => { 
          const s = String(i?.status || '').toUpperCase(); 
          return s === 'RESOLU' || s === 'RESOLVED'; 
        }).length; 
        
        const rejected = incidents.filter(i => { 
          const s = String(i?.status || '').toUpperCase(); 
          return s === 'REJETE' || s === 'REJECTED'; 
        }).length; 
 
        this.metrics[0].value = total.toString(); 
        this.metrics[1].value = rejected.toString(); 
        this.metrics[2].value = resolved.toString(); 
 
        // 1. ترتيب الـ incidents من الأجدد للقديم بالـ createdAt فقط (مع استعمال any لتجنب خطأ TypeScript)
        const sortedIncidents = [...incidents].sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA; // الأحدث لفوق
        });

        // 2. إخذاء أحدث 3 برك بعد الترتيب
        this.recentReports = sortedIncidents.slice(0, 3).map((inc: any) => { 
          const statusStr = String(inc?.status || 'Open'); 
          const isRes = statusStr.toUpperCase() === 'RESOLU' || statusStr.toUpperCase() === 'RESOLVED'; 
          const isRej = statusStr.toUpperCase() === 'REJETE' || statusStr.toUpperCase() === 'REJECTED';
           
          let displayStatus = statusStr;
          if (isRes) displayStatus = 'Resolved';
          else if (isRej) displayStatus = 'Rejected';

          return { 
            code: `INC-${inc?.id || '0'}`, 
            severity: inc?.priority || inc?.severity || 'Normal', 
            title: inc?.title || 'No Title', 
            category: inc?.categoryName || inc?.category?.name || inc?.category || 'General', 
            time: this.formatTimeAgo(inc?.createdAt), 
            status: displayStatus 
          }; 
        }); 
 
        this.cdr.detectChanges(); 
      }, 
      error: (err) => { 
        console.error(' Error fetching incidents:', err); 
        this.recentReports = []; 
        this.cdr.detectChanges(); 
      } 
    });

    // 2. Load Recent Notifications (أحدث 5 تنبيهات مرتبة من الأجدد للقديم)
    this.notificationService.getMyNotifications().subscribe({
      next: (notifs: NotificationResponse[]) => {
        if (!notifs || !Array.isArray(notifs)) {
          this.notifications = [];
          this.cdr.detectChanges();
          return;
        }

        const sortedNotifs = notifs.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });

        this.notifications = sortedNotifs.slice(0, 5).map(n => ({
          message: n.message,
          time: this.formatTimeAgo(n.createdAt),
          isRead: n.isRead
        }));

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(' Error fetching notifications:', err);
        this.notifications = [];
        this.cdr.detectChanges();
      }
    });
  } 
 
  formatTimeAgo(dateString?: string): string { 
    if (!dateString) return 'Recently'; 
    const date = new Date(dateString); 
    if (isNaN(date.getTime())) return 'Recently'; 
    const now = new Date(); 
    const diffHours = Math.abs(now.getTime() - date.getTime()) / 36e5; 
    if (diffHours < 24) { 
      return `${Math.floor(diffHours)}h ago`; 
    } 
    return `${Math.floor(diffHours / 24)}d ago`; 
  } 
}