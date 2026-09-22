// Importation des décorateurs et outils Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Services de routage
import { ActivatedRoute, Router } from '@angular/router';
// Services utilisés
import { IncidentService } from '../../services/incident';
import { UserService } from '../../services/user';

// Composant du détail d'un incident côté employé
@Component({
  selector: 'app-incident-detail-employee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incident-detail-employee.html',
  styleUrls: ['./incident-detail-employee.css']
})
export class IncidentDetailEmployee implements OnInit {
  // ID de l'incident (récupéré depuis l'URL)
  incidentId: number | null = null;
  // Données de l'incident
  incident: any | null = null;
  // URL locale de la pièce jointe (image)
  attachmentUrl: string | null = null;
  // Nom du technicien assigné
  technicianName: string = 'Unassigned';

  // Styles par priorité (couleur de fond + texte)
  priorityStyles: { [key: string]: { bg: string, color: string } } = {
    'BASSE': { bg: 'rgba(100, 116, 139, 0.08)', color: '#64748b' },
    'MOYENNE': { bg: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' },
    'HAUTE': { bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626' },
    'CRITIQUE': { bg: 'rgba(127, 29, 29, 0.15)', color: '#7f1d1d' }
  };

  // Injection des services
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    // Récupère l'ID depuis l'URL et charge les détails
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.incidentId = Number(idParam);
        this.loadIncidentDetails(this.incidentId);
      }
    });
  }

  // Charge les détails d'un incident par son ID
  loadIncidentDetails(id: number): void {
    // Réinitialise les données
    this.incident = null;
    this.attachmentUrl = null;

    this.incidentService.getIncidentById(id).subscribe({
      next: (res: any) => {
        // Le backend peut renvoyer directement l'objet ou l'envelopper dans { body: ... }
        this.incident = res.body ? res.body : res;
        this.cdr.detectChanges();

        // Si un technicien est assigné, on charge son nom
        if (this.incident?.technicianId || this.incident?.technician) {
          const techId = this.incident.technicianId || this.incident.technician?.id;
          if (techId) {
            this.loadTechnicianName(techId);
          }
        } else {
          this.technicianName = 'Unassigned';
        }

        // Si une image est présente, on charge la pièce jointe
        if (this.incident && this.incident.imageUrl) {
          this.loadAttachment(this.incident.id);
        }
      },
      error: (err: any) => console.error('Erreur chargement détails incident :', err)
    });
  }

  // Charge le nom du technicien à partir de son ID
  loadTechnicianName(techId: number): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        // Normalise la réponse en tableau
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

  // Télécharge la pièce jointe en tant que Blob et crée une URL locale
  loadAttachment(id: number): void {
    this.incidentService.getAttachment(id).subscribe({
      next: (blob: Blob) => {
        this.attachmentUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Erreur chargement pièce jointe :', err)
    });
  }

  // Retour à la liste des signalements de l'employé
  goBack(): void {
    this.router.navigate(['/employee/mes-signalements']);
  }

  // Retourne la classe CSS correspondant au statut
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