import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident';
import { CategorieService } from '../../services/categorie';
import { DepartmentService, Department } from '../../services/departement';
import { NotificationService } from '../../services/notification'; // 👈 Zid el import hetha
import { CategoryResponse } from '../../models/categorie';
import { IncidentPriority } from '../../models/incident';

@Component({
  selector: 'app-nouveau-signalement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nouveau-signalement.html',
  styleUrls: ['./nouveau-signalement.css']
})
export class NouveauSignalement implements OnInit {
  globalSearch: string = '';
  
  incident = {
    title: '',
    description: '',
    category: '',      
    department: '',    
    priority: '' as IncidentPriority,
    image: null as File | null
  };

  imageName: string | null = null;
  loading: boolean = false;
  errorMessage: string = '';

  categories: CategoryResponse[] = [];
  departments: Department[] = [];

  constructor(
    private incidentService: IncidentService,
    private categorieService: CategorieService,
    private departmentService: DepartmentService,
    private notificationService: NotificationService, // 👈 Injects el service hetha
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadDepartments();
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => { this.categories = data; },
      error: (err) => { console.error('Erreur categories:', err); }
    });
  }

  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => { this.departments = data; },
      error: (err) => { console.error('Erreur departments:', err); }
    });
  }

  setPriority(prio: string): void {
    this.incident.priority = prio.toUpperCase() as IncidentPriority;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.incident.image = file;
      this.imageName = file.name;
    }
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('title', this.incident.title);
    formData.append('description', this.incident.description);
    formData.append('priority', this.incident.priority);
    formData.append('department', this.incident.department);
    formData.append('category', this.incident.category);
    
    if (this.incident.image) {
      formData.append('image', this.incident.image); 
    }

    // 1. Yebaath el incident lel backend
    this.incidentService.createIncident(formData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Incident created successfully:', response);

        // (Optionnel) Ken t7eb tzid ta3mel trigger lel front wela ttesti 
        // 5ater el backend bil tbi3a bech yb3ath notification lel Admin,
        // ama ken t7eb ta3mel notification bel JS mel front tnajem tzidha houni.

        this.router.navigate(['/employee/mes-signalements']);
      },
      error: (err) => {
        this.loading = false;
        console.log('DETAILS DE L ERREUR BACKEND:', err.error);
        this.errorMessage = 'Erreur: ' + (err.error?.message || 'Veuillez réessayer.');
      }
    });
  }

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