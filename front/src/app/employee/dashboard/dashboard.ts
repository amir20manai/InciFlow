import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident';
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
    { title: 'My Reports', value: '0', iconBg: 'rgba(37, 99, 235, 0.15)', iconColor: '#3b82f6' },
    { title: 'Active', value: '0', iconBg: 'rgba(14, 165, 233, 0.15)', iconColor: '#0ea5e9' },
    { title: 'Resolved', value: '0', iconBg: 'rgba(16, 185, 129, 0.15)', iconColor: '#10b981' }
  ];

  recentReports: any[] = [];

  notifications = [
    {
      title: 'Incident resolved',
      description: 'Your recent submitted incidents are being tracked in real time.',
      time: '2h ago'
    }
  ];

  constructor(
    private incidentService: IncidentService,
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
        // تنجم تحط الاسم واللقب مع بعضهم، وإلا الـ firstName فقط
        this.userName = `${fName} ${lName}`.trim();
      }
      
      this.cdr.detectChanges();
    } catch (e) {
      console.error('Error decoding token in dashboard', e);
    }
  }

  this.loadIncidentsData();
}

  loadIncidentsData(): void {
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
        const active = total - resolved;

        this.metrics[0].value = total.toString();
        this.metrics[1].value = active.toString();
        this.metrics[2].value = resolved.toString();

        this.recentReports = incidents.slice(0, 3).map((inc: any) => {
          const statusStr = String(inc?.status || 'Open');
          const isRes = statusStr.toUpperCase() === 'RESOLU' || statusStr.toUpperCase() === 'RESOLVED';
          
          return {
            code: `INC-${inc?.id || '0'}`,
            severity: inc?.priority || inc?.severity || 'Normal',
            title: inc?.title || 'No Title',
            category: inc?.categoryName || inc?.category?.name || inc?.category || 'General',
            time: this.formatTimeAgo(inc?.createdAt || inc?.date),
            status: isRes ? 'Resolved' : statusStr
          };
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error fetching dashboard data:', err);
        this.recentReports = [];
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