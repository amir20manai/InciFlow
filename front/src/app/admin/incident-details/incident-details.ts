// Importation des décorateurs et utilitaires Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Services de routage pour récupérer l'ID depuis l'URL et naviguer
import { ActivatedRoute, Router } from '@angular/router';
// Module de formulaires pour ngModel
import { FormsModule } from '@angular/forms';
// Services et modèles nécessaires
import { IncidentService } from '../../services/incident';
import { UserService } from '../../services/user';
import { IncidentResponse, IncidentStatus } from '../../models/incident';

// Composant admin : page de détail d'un incident — affichage complet, assignation
// à un technicien, et actions Accepter / Rejeter
@Component({
  selector: 'app-incident-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-details.html',
  styleUrls: ['./incident-details.css']
})
export class IncidentDetails implements OnInit {
  // ID de l'incident récupéré depuis l'URL
  incidentId: number | null = null;
  // Données complètes de l'incident
  incident: IncidentResponse | null = null;
  // URL locale de la pièce jointe (image)
  attachmentUrl: string | null = null;

  // Liste des techniciens disponibles
  technicians: any[] = [];
  // ID du technicien sélectionné pour l'assignation
  selectedTechnicianId: number | null = null;

  // Styles (couleur, fond, bordure) associés à chaque niveau de priorité,
  // utilisés dynamiquement dans le template via [ngStyle]
  priorityStyles: { [key: string]: { bg: string, color: string, border: string } } = {
    'BASSE': { bg: 'rgba(100, 116, 139, 0.08)', color: '#64748b', border: '#64748b' },
    'MOYENNE': { bg: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '#f59e0b' },
    'HAUTE': { bg: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', border: '#dc2626' },
    'CRITIQUE': { bg: 'rgba(127, 29, 29, 0.15)', color: '#7f1d1d', border: '#7f1d1d' }
  };

  // Injection des services nécessaires
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    // Récupère l'id de l'incident depuis l'URL et charge ses détails à chaque changement
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.incidentId = Number(idParam);
        this.loadIncidentDetails(this.incidentId);
      }
    });
    this.loadTechnicians();
  }

  // Charge les détails de l'incident, et sa pièce jointe si une image est associée
  loadIncidentDetails(id: number): void {
    // Réinitialise les données avant chargement
    this.incident = null;
    this.attachmentUrl = null;

    this.incidentService.getIncidentById(id).subscribe({
      next: (res: any) => {
        // Le backend peut renvoyer directement l'objet ou l'envelopper dans { body: ... }
        this.incident = res.body ? res.body : res;
        this.cdr.detectChanges();

        // Si l'incident a une image, charge la pièce jointe
        if (this.incident && (this.incident as any).imageUrl) {
          this.loadAttachment(this.incident.id);
        }
      },
      error: (err: any) => console.error('Error loading incident details:', err)
    });
  }

  // Télécharge la pièce jointe en tant que Blob et crée une URL locale pour l'afficher dans le template
  loadAttachment(id: number): void {
    this.incidentService.getAttachment(id).subscribe({
      next: (blob: Blob) => {
        // Crée une URL locale à partir du Blob
        this.attachmentUrl = URL.createObjectURL(blob);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading attachment blob:', err)
    });
  }

  // Charge tous les utilisateurs puis ne garde que ceux ayant le rôle technicien
  loadTechnicians(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        // Normalise la réponse en tableau
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);

        // Filtre les techniciens
        this.technicians = list.filter((u: any) => {
          const role = u.role ? u.role.toUpperCase() : '';
          return role === 'TECHNICIAN' || role === 'TECHNICIEN';
        });

        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching users for technicians', err)
    });
  }

  // Accepte l'incident : exige qu'un technicien soit sélectionné, puis crée l'intervention côté backend
  acceptIncident(): void {
    // Vérifie qu'un technicien est sélectionné et que l'ID de l'incident existe
    if (!this.selectedTechnicianId || this.incidentId === null) {
      alert('Veuillez sélectionner un technicien !');
      return;
    }

    const technicianIdNumber = Number(this.selectedTechnicianId);

    this.incidentService.acceptIncidentWithIntervention(this.incidentId, technicianIdNumber).subscribe({
      next: (res: any) => {
        alert('Incident accepté avec succès, notification envoyée et intervention créée !');
        // Met à jour l'incident avec la réponse du backend
        this.incident = res.incident || res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error accepting incident:', err);
        alert('Erreur lors de l\'acceptation de l\'incident.');
      }
    });
  }

  // Rejette l'incident ; le technicien est optionnel dans ce cas
  rejectIncident(): void {
    if (this.incidentId === null) return;

    // Le technicien est optionnel pour un rejet
    const technicianIdNumber = this.selectedTechnicianId ? Number(this.selectedTechnicianId) : null;

    this.incidentService.rejectIncident(this.incidentId, { technicianId: technicianIdNumber }).subscribe({
      next: (res: any) => {
        alert('Incident rejeté avec succès et notification envoyée !');
        // Met à jour l'incident avec la réponse du backend
        this.incident = res.incident || res;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error rejecting incident:', err);
        alert('Erreur lors du rejet de l\'incident.');
      }
    });
  }

  // Retourne à la liste des signalements
  goBack(): void {
    this.router.navigate(['/admin/signalements']);
  }

  // Convertit le statut backend (majuscules) en classe CSS pour le badge de statut
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

  // Convertit la priorité en minuscules pour l'utiliser comme classe CSS
  getPriorityClass(priority: string | undefined): string {
    return priority ? priority.toLowerCase() : '';
  }
}