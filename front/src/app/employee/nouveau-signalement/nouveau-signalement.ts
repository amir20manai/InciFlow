import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IncidentService } from '../../services/incident';
import { IncidentPriority } from '../../models/incident';

@Component({
  selector: 'app-nouveau-signalement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './nouveau-signalement.html',
  styleUrls: ['./nouveau-signalement.css']
})
export class NouveauSignalement {
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

  constructor(
    private incidentService: IncidentService,
    private router: Router
  ) {}

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

    // إرسال البيانات عبر FormData لضمان دعم إرسال الملفات (MultipartFile)
    const formData = new FormData();
    formData.append('title', this.incident.title);
    formData.append('description', this.incident.description);
    formData.append('priority', this.incident.priority);
    formData.append('department', this.incident.department);
    formData.append('category', this.incident.category);
    
    if (this.incident.image) {
      formData.append('image', this.incident.image); 
    }

    this.incidentService.createIncident(formData).subscribe({
      next: (response) => {
        this.loading = false;
        console.log('Incident created successfully:', response);
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