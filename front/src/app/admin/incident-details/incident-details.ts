import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident';
import { IncidentResponse, IncidentStatus } from '../../models/incident';

@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-details.html',
  styleUrls: ['./incident-details.css']
})
export class IncidentDetails implements OnInit {
  incidentId: number | null = null;
  incident: IncidentResponse | null = null;
  attachmentUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // الاستماع لتغييرات الـ ID في الرابط لتحديث الصفحة فوراً عند التنقل
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.incidentId = Number(idParam);
        this.loadIncidentDetails(this.incidentId);
      }
    });
  }

  loadIncidentDetails(id: number): void {
    this.incident = null; 
    this.attachmentUrl = null;

    this.incidentService.getIncidentById(id).subscribe({
      next: (res: any) => {
        // لو الباكند يرجع في الـ Response كاملة (مع الهيدرز)، ناخذ الـ body، وإلا ناخذ الres مباشرة
        this.incident = res.body ? res.body : res;
        console.log("Incident loaded successfully:", this.incident);
        
        // إجبار الواجهة على التحديث فور وصول البيانات
        this.cdr.detectChanges();

        if (this.incident && this.incident.imageUrl) {
          this.loadAttachment(this.incident.id);
        }
      },
      error: (err) => console.error('Error loading incident details:', err)
    });
  }

  loadAttachment(id: number): void {
    this.incidentService.getAttachment(id).subscribe({
      next: (blob) => {
        this.attachmentUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges(); // تحديث الواجهة حتى بعد تحميل الصورة
      },
      error: (err) => {
        console.error('Error loading attachment blob:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/signalements']);
  }

  updateStatus(newStatus: IncidentStatus): void {
    if (this.incidentId !== null) {
      this.incidentService.updateStatus(this.incidentId, newStatus).subscribe({
        next: (updated) => {
          this.incident = updated;
          this.cdr.detectChanges();
          this.incidentService.loadAllIncidents();
        },
        error: (err) => console.error('Error updating status:', err)
      });
    }
  }

  getStatusClass(status: IncidentStatus): string {
    switch (status) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      default: return '';
    }
  }

  getPriorityClass(priority: string): string {
    return priority ? priority.toLowerCase() : '';
  }
}