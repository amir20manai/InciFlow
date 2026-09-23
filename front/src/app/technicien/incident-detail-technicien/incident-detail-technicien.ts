import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident';

@Component({
  selector: 'app-incident-detail-technicien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-detail-technicien.html',
  styleUrls: ['./incident-detail-technicien.css']
})
export class IncidentDetailTechnicien implements OnInit {
  incidentId: number | null = null;
  incident: any | null = null;
  attachmentUrl: string | null = null;
  reportNotes: string = '';

  // Styles des priorités (couleur de fond, texte, bordure)
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de l'incident depuis l'URL
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.incidentId = Number(idParam);
        this.loadInterventionDetails(this.incidentId);
      }
    });
  }

  // ============================================================
  // Charger les détails de l'intervention
  // ============================================================
  loadInterventionDetails(id: number): void {
    this.incident = null;
    this.attachmentUrl = null;

    this.incidentService.getIncidentById(id).subscribe({
      next: (res: any) => {
        this.incident = res;
        if (this.incident.notes) {
          this.reportNotes = this.incident.notes;
        }

        // Charger l'image si elle existe
        if (this.incident.imageUrl) {
          this.loadAttachment(id);
        }

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erreur lors du chargement des détails:', err)
    });
  }

  // ============================================================
  // Charger l'image (Blob URL)
  // ============================================================
  loadAttachment(id: number): void {
    this.incidentService.getAttachment(id).subscribe({
      next: (blob: Blob) => {
        this.attachmentUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur chargement image:', err);
        this.attachmentUrl = null;
      }
    });
  }

  // ============================================================
  // Démarrer l'intervention (EN_COURS)
  // ============================================================
  startIntervention(): void {
    if (this.incidentId === null) return;

    this.incidentService.startIntervention(this.incidentId).subscribe({
      next: (res: any) => {
        alert('Intervention démarrée (Statut: EN_COURS).');
        this.incident = res;
        this.router.navigate(['/technicien/interventions']);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur start:', err);
        alert('Erreur lors du démarrage de l\'intervention.');
      }
    });
  }

  // ============================================================
  // Terminer l'intervention (RESOLU)
  // ============================================================
  completeIntervention(): void {
    if (this.incidentId === null) return;

    this.incidentService.completeIntervention(this.incidentId, this.reportNotes).subscribe({
      next: (res: any) => {
        alert('Intervention terminée avec succès (Statut: RESOLU).');
        this.incident = res;
        this.router.navigate(['/technicien/interventions']);
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur complete:', err);
        alert('Erreur lors de la clôture de l\'intervention.');
      }
    });
  }

  // ============================================================
  // Retour : on lit le paramètre "from" pour savoir où revenir
  // ============================================================
  goBack(): void {
    this.route.queryParams.subscribe(params => {
      const from = params['from'];

      if (from === 'historique') {
        this.router.navigate(['/technicien/historique']);
      } else {
        this.router.navigate(['/technicien/interventions']);
      }
    });
  }

  // ============================================================
  // Classe CSS du statut
  // ============================================================
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    switch (status) {
      case 'EN_COURS': return 'in-progress';
      case 'NOUVEAU': return 'open';
      case 'RESOLU': return 'resolved';
      case 'REJETE': return 'rejected';
      case 'ACCEPTE': return 'accepted';
      default: return '';
    }
  }
}