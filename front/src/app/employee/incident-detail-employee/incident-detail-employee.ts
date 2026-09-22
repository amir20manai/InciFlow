import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../services/incident';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-incident-detail-employee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-detail-employee.html', // ➔ Esm el HTML s7i7
  styleUrls: ['./incident-detail-employee.css']     // ➔ Esm el CSS s7i7
})
export class IncidentDetailEmployee implements OnInit {
  incidentId: number | null = null;
  incident: any | null = null;
  attachmentUrl: string | null = null;
  technicianName: string = 'Unassigned';

  priorityStyles: { [key: string]: { bg: string, color: string } } = {
    'BASSE': { bg: 'rgba(100, 116, 139, 0.08)', color: '#64748b' },
    'MOYENNE': { bg: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' },
    'HAUTE': { bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626' },
    'CRITIQUE': { bg: 'rgba(127, 29, 29, 0.15)', color: '#7f1d1d' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
        this.incident = res.body ? res.body : res;
        this.cdr.detectChanges();

        // Check if technician is assigned
        if (this.incident?.technicianId || this.incident?.technician) {
          const techId = this.incident.technicianId || this.incident.technician?.id;
          if (techId) {
            this.loadTechnicianName(techId);
          }
        } else {
          this.technicianName = 'Unassigned';
        }

        if (this.incident && this.incident.imageUrl) {
          this.loadAttachment(this.incident.id);
        }
      },
      error: (err: any) => console.error('Error loading incident details:', err)
    });
  }

  loadTechnicianName(techId: number): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        const tech = list.find((u: any) => u.id === techId);
        if (tech) {
          this.technicianName = `${tech.firstName || ''} ${tech.lastName || ''}`.trim() || tech.email;
        } else {
          this.technicianName = 'Unassigned';
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.technicianName = 'Unassigned';
        this.cdr.detectChanges();
      }
    });
  }

  loadAttachment(id: number): void {
    this.incidentService.getAttachment(id).subscribe({
      next: (blob: Blob) => {
        this.attachmentUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading attachment blob:', err)
    });
  }

  goBack(): void {
    this.router.navigate(['/employee/mes-signalements']);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      case 'REJETE': return 'rejected';
      default: return '';
    }
  }
}