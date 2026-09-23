// Importation des décorateurs et outils Angular
import { Component, OnInit } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires
import { FormsModule } from '@angular/forms';
// Routage
import { Router } from '@angular/router';
// Services utilisés
import { IncidentService } from '../../services/incident';
import { CategorieService } from '../../services/categorie';
import { DepartmentService, Department } from '../../services/departement';
import { NotificationService } from '../../services/notification';
// Modèles
import { CategoryResponse } from '../../models/categorie';
import { IncidentPriority } from '../../models/incident';

// Composant : formulaire de création d'un nouveau signalement
@Component({
  selector: 'app-nouveau-signalement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nouveau-signalement.html',
  styleUrls: ['./nouveau-signalement.css']
})
export class NouveauSignalement implements OnInit {
  // Champ de recherche globale (non utilisé ici)
  globalSearch: string = '';

  // Modèle du formulaire d'incident
  incident = {
    title: '',
    description: '',
    category: '',
    department: '',
    priority: '' as IncidentPriority,
    image: null as File | null
  };

  // Nom du fichier image sélectionné
  imageName: string | null = null;
  // État de chargement
  loading: boolean = false;
  // Message d'erreur
  errorMessage: string = '';

  // Listes déroulantes
  categories: CategoryResponse[] = [];
  departments: Department[] = [];

  // Injection des services
  constructor(
    private incidentService: IncidentService,
    private categorieService: CategorieService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadCategories();
    this.loadDepartments();
  }

  // Charge la liste des catégories
  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => { this.categories = data; },
      error: (err) => { console.error('Erreur catégories :', err); }
    });
  }

  // Charge la liste des départements
  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => { this.departments = data; },
      error: (err) => { console.error('Erreur départements :', err); }
    });
  }

  // Définit la priorité sélectionnée
  setPriority(prio: string): void {
    this.incident.priority = prio.toUpperCase() as IncidentPriority;
  }

  // Gère la sélection d'un fichier image
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.incident.image = file;
      this.imageName = file.name;
    }
  }

  // Soumission du formulaire : création d'un nouvel incident
  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    // Construction du FormData (pour supporter l'upload d'image)
    const formData = new FormData();
    formData.append('title', this.incident.title);
    formData.append('description', this.incident.description);
    formData.append('priority', this.incident.priority);
    formData.append('department', this.incident.department);
    formData.append('category', this.incident.category);

    // Ajout de l'image si présente
    if (this.incident.image) {
      formData.append('image', this.incident.image);
    }

    // Envoi au backend
    this.incidentService.createIncident(formData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Incident créé avec succès :', response);
        // Redirection vers la liste des signalements
        this.router.navigate(['/employee/mes-signalements']);
      },
      error: (err) => {
        this.loading = false;
        console.log('Détails de l\'erreur backend :', err.error);
        this.errorMessage = 'Erreur : ' + (err.error?.message || 'Veuillez réessayer.');
      }
    });
  }

  // Réinitialise le formulaire (bouton Annuler)
  onCancel(): void {
    this.incident = {
      title: '',
      description: '',
      category: '',
      department: '',
      priority: 'MOYENNE' as IncidentPriority,
      image: null as File | null
    };
    this.imageName = null;
  }
}