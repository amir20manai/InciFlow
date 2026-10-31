import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IncidentService } from '../../services/incident';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-incident-detail-employee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-detail-employee.html',
  styleUrls: ['./incident-detail-employee.css']
})
export class IncidentDetailEmployee implements OnInit {
  incidentId: number | null = null;
  incident: any | null = null;
  attachmentUrl: string | null = null;
  technicianName: string = 'Unassigned';

  priorityStyles: {
    [key: string]: {
      bg: string,
      color: string
    }
  } = {
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

  // ============================================================
  // Charger les détails de l'incident
  // ============================================================
  loadIncidentDetails(id: number): void {
    this.incident = null;
    this.attachmentUrl = null;
    this.technicianName = 'Unassigned';

    this.incidentService.getIncidentById(id).subscribe({
      next: (res: any) => {
        this.incident = res?.body ? res.body : res;
        console.log('FULL INCIDENT OBJECT:', JSON.stringify(this.incident, null, 2));

        const status = this.incident?.status ? this.incident.status.toUpperCase() : '';

        if (status === 'NOUVEAU' || status === 'REJETE') {
          this.technicianName = 'Unassigned';
        } else {
          // Chercher le technicien : objet, email, ou ID
          const techObj = this.incident?.technician || this.incident?.assignedTechnician || this.incident?.technicien;
          const techEmail = this.incident?.technicianEmail;

          if (techObj && (techObj.firstName || techObj.lastName || techObj.email)) {
            this.technicianName = `${techObj.firstName || ''} ${techObj.lastName || ''}`.trim() || techObj.email;
          } else if (techEmail) {
            this.loadTechnicianByEmail(techEmail);
          } else {
            const techId = Number(this.incident?.technicianId || this.incident?.idTechnicien || this.incident?.technician?.id);
            if (!isNaN(techId) && techId > 0) {
              this.loadTechnicianName(techId);
            } else {
              this.technicianName = 'Unassigned';
            }
          }
        }

        if (this.incident && this.incident.imageUrl) {
          this.loadAttachment(this.incident.id);
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement détails incident :', err);
        this.technicianName = 'Unassigned';
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // Charger le nom du technicien par ID
  // ============================================================
  loadTechnicianName(techId: number): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        const tech = list.find((u: any) => Number(u.id) === Number(techId));
        if (tech) {
          this.technicianName = `${tech.firstName || ''} ${tech.lastName || ''}`.trim() || tech.email || 'Unassigned';
        } else {
          this.technicianName = 'Non assigné';
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement technicien :', err);
        this.technicianName = 'Non assigné';
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // Charger le nom du technicien par email
  // ============================================================
  loadTechnicianByEmail(email: string): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        const tech = list.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
        if (tech) {
          this.technicianName = `${tech.firstName || ''} ${tech.lastName || ''}`.trim() || tech.email || email;
        } else {
          this.technicianName = email;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.technicianName = email;
        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // Charger la pièce jointe (image)
  // ============================================================
  loadAttachment(id: number): void {
    this.incidentService.getAttachment(id).subscribe({
      next: (blob: Blob) => {
        this.attachmentUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement pièce jointe :', err);
      }
    });
  }

  // ============================================================
  // Retour
  // ============================================================
  goBack(): void {
    this.router.navigate(['/employee/mes-signalements']);
  }

  // ============================================================
  // Classe CSS du statut
  // ============================================================
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      case 'REJETE': return 'rejected';
      case 'ACCEPTE': return 'accepted';
      default: return '';
    }
  }
}