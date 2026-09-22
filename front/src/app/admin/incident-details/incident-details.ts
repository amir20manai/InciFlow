import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident';
import { UserService } from '../../services/user';
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
  
  technicians: any[] = [];
  selectedTechnicianId: number | null = null;

  // Ajout de l'objet priorityStyles pour corriger l'erreur TS2339
  priorityStyles: { [key: string]: { bg: string, color: string, border: string } } = {
    'BASSE': { bg: 'rgba(100, 116, 139, 0.08)', color: '#64748b', border: '#64748b' },
    'MOYENNE': { bg: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '#f59e0b' },
    'HAUTE': { bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', border: '#dc2626' },
    'CRITIQUE': { bg: 'rgba(127, 29, 29, 0.15)', color: '#7f1d1d', border: '#7f1d1d' }
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
    this.loadTechnicians();
  }

  loadIncidentDetails(id: number): void {
    this.incident = null; 
    this.attachmentUrl = null;

    this.incidentService.getIncidentById(id).subscribe({
      next: (res: any) => {
        this.incident = res.body ? res.body : res;
        this.cdr.detectChanges();

        if (this.incident && (this.incident as any).imageUrl) {
          this.loadAttachment(this.incident.id);
        }
      },
      error: (err: any) => console.error('Error loading incident details:', err)
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

  loadTechnicians(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        
        this.technicians = list.filter((u: any) => {
          const role = u.role ? u.role.toUpperCase() : '';
          return role === 'TECHNICIAN' || role === 'TECHNICIEN';
        });

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching users for technicians', err)
    });
  }

  acceptIncident(): void {
    if (!this.selectedTechnicianId || this.incidentId === null) {
      alert('Veuillez sélectionner un technicien !');
      return;
    }

    const technicianIdNumber = Number(this.selectedTechnicianId);

    this.incidentService.acceptIncidentWithIntervention(this.incidentId, technicianIdNumber).subscribe({
      next: (res: any) => {
        alert('Incident accepté avec succès, notification envoyée et intervention créée !');
        this.incident = res.incident || res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error accepting incident:', err);
        alert('Erreur lors de l’acceptation de l’incident.');
      }
    });
  }

  rejectIncident(): void {
    if (this.incidentId === null) return;

    const technicianIdNumber = this.selectedTechnicianId ? Number(this.selectedTechnicianId) : null;

    this.incidentService.rejectIncident(this.incidentId, { technicianId: technicianIdNumber }).subscribe({
      next: (res: any) => {
        alert('Incident rejeté avec succès et notification envoyée !');
        this.incident = res.incident || res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error rejecting incident:', err);
        alert('Erreur lors du rejet de l’incident.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/signalements']);
  }

  getStatusClass(status: IncidentStatus | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      case 'REJETE': return 'rejected';
      default: return '';
    }
  }

  getPriorityClass(priority: string | undefined): string {
    return priority ? priority.toLowerCase() : '';
  }
}