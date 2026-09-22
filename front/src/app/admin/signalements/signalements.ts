// Importation des décorateurs et interfaces Angular
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires pour ngModel
import { FormsModule } from '@angular/forms';
// Module de routage pour les liens routerLink
import { RouterModule } from '@angular/router';
// Subscription pour gérer les abonnements RxJS
import { Subscription } from 'rxjs';
// Service de gestion des incidents
import { IncidentService } from '../../services/incident';

// Interface représentant un incident (structure attendue côté front)
export interface Incident {
  id: number;
  title: string;
  description?: string;
  categoryName?: string;
  departmentName?: string;
  employeeEmail?: string;
  priority?: 'BASSE' | 'MOYENNE' | 'HAUTE' | 'CRITIQUE';
  status?: 'NOUVEAU' | 'EN_COURS' | 'RESOLU' | 'REJETE';
  createdAt?: string;
  imageUrl?: string;
}

// Composant admin : liste complète des incidents, avec recherche et filtres (statut, priorité)
@Component({
  selector: 'app-signalements',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signalements.html',
  styleUrls: ['./signalements.css']
})
export class Signalements implements OnInit, OnDestroy {

  // Champs de recherche (deux champs : un global et un local, utilisés dans le filtre)
  globalSearch: string = '';
  searchQuery: string = '';
  // Filtres sélectionnés
  selectedStatus: string = 'ALL';
  selectedPriority: string = 'ALL';

  // Liste complète des incidents
  incidents: Incident[] = [];
  // Liste filtrée des incidents (affichée dans le tableau)
  filteredIncidents: Incident[] = [];
  // Référence à l'abonnement pour pouvoir se désabonner
  private incidentSub?: Subscription;

  // Injection des services nécessaires
  constructor(
    private incidentService: IncidentService,
    private cdr: ChangeDetectorRef // Utilisé pour forcer le rendu après réception des données async
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadIncidents();
  }

  // Recharge les données à chaque fois que la vue redevient active
  // (utile si le composant n'est pas détruit entre deux navigations)
  ionViewWillEnter(): void {
    this.loadIncidents();
  }

  // Nettoyage : désabonnement pour éviter les fuites mémoire
  ngOnDestroy(): void {
    if (this.incidentSub) {
      this.incidentSub.unsubscribe();
    }
  }

  // Récupère tous les incidents depuis l'API et normalise la réponse en tableau
  loadIncidents(): void {
    // On se désabonne d'un éventuel appel précédent avant d'en relancer un nouveau,
    // pour éviter les abonnements multiples et les doublons de données
    if (this.incidentSub) {
      this.incidentSub.unsubscribe();
    }

    this.incidentSub = this.incidentService.getAllIncidents().subscribe({
      next: (data: any) => {
        console.log("RESPONSE MEL BACKEND:", data); // Debug : inspecter la forme de la réponse

        let incidentsArray: Incident[] = [];

        // Le backend peut renvoyer un tableau direct, un objet { content: [...] }, ou une autre clé tableau
        if (Array.isArray(data)) {
          incidentsArray = data;
        } else if (data && Array.isArray(data.content)) {
          incidentsArray = data.content;
        } else if (data && typeof data === 'object') {
          // Cherche la première propriété qui est un tableau
          const foundKey = Object.keys(data).find(k => Array.isArray(data[k]));
          if (foundKey) {
            incidentsArray = data[foundKey];
          }
        }

        this.incidents = incidentsArray;
        this.filteredIncidents = [...incidentsArray];
        this.filterIncidents(); // Applique les filtres

        // Force Angular à rafraîchir l'affichage immédiatement
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des incidents:', err);
      }
    });
  }

  // Filtre localement la liste des incidents selon la recherche texte et les filtres sélectionnés
  filterIncidents(): void {
    if (!this.incidents || !Array.isArray(this.incidents)) {
      this.filteredIncidents = [];
      return;
    }

    this.filteredIncidents = this.incidents.filter(inc => {
      const query = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';
      const global = this.globalSearch ? this.globalSearch.toLowerCase().trim() : '';

      // Recherche texte : correspond si le titre, l'id ou l'email contient la requête
      const matchQuery = !query ||
        (inc.title && inc.title.toLowerCase().includes(query)) ||
        (inc.id && inc.id.toString().toLowerCase().includes(query)) ||
        (inc.employeeEmail && inc.employeeEmail.toLowerCase().includes(query));

      // Recherche globale : correspond si le titre ou l'email contient la requête
      const matchGlobal = !global ||
        (inc.title && inc.title.toLowerCase().includes(global)) ||
        (inc.employeeEmail && inc.employeeEmail.toLowerCase().includes(global));

      // Filtre par statut
      const matchStatus = this.selectedStatus === 'ALL' || inc.status === this.selectedStatus;
      // Filtre par priorité
      const matchPriority = this.selectedPriority === 'ALL' || inc.priority === this.selectedPriority;

      return matchQuery && matchGlobal && matchStatus && matchPriority;
    });

    this.cdr.detectChanges();
  }

  // Convertit le statut backend en classe CSS pour le badge de statut
  getStatusClass(status?: string): string {
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
  getPriorityClass(priority?: string): string {
    return priority ? priority.toLowerCase() : '';
  }
}