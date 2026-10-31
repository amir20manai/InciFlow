// Importation des décorateurs et utilitaires Angular
import { Component, OnInit, ChangeDetectorRef, NgZone, inject } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires pour ngModel
import { FormsModule } from '@angular/forms';
// Service de gestion des départements et modèle Department
import { DepartmentService, Department } from '../../services/departement';
// Service utilisateur pour récupérer la liste des employés
import { UserService } from '../../services/user';

// Composant admin : gestion des départements (liste, ajout, édition, suppression, chef de département)
@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departements.html',
  styleUrls: ['./departements.css']
})
export class Departements implements OnInit {
  // Champ de recherche globale (non utilisé dans la logique actuelle)
  globalSearch: string = '';

  // Injection des services via la fonction inject()
  private departmentService = inject(DepartmentService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  // États des fenêtres modales
  isAddModalOpen: boolean = false;   // Modale d'ajout ouverte ?
  isEditModalOpen: boolean = false;  // Modale d'édition ouverte ?

  // Formulaire d'ajout
  newDeptName: string = '';
  newDeptHead: string = '';

  // Formulaire d'édition
  selectedDepartment: Department | null = null;
  editDeptName: string = '';
  editDeptHead: string = '';

  // Listes de données
  departments: Department[] = [];
  employees: any[] = []; // Liste des employés utilisée pour choisir un chef de département

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees(); // Chargé dès l'ouverture du composant, pour remplir le sélecteur du formulaire
  }

  // Récupère les départements et prépare les informations d'affichage du chef de chacun
  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          // Palette de couleurs pour les avatars des chefs
          const colors = ['#2563eb', '#0ea5e9', '#f59e0b', '#ec4899', '#ef4444', '#6366f1'];

          this.departments = data.map((dept, index) => {
            const head = dept.headName || 'Unassigned';
            // Calcule les initiales du chef (2 lettres), ou "NA" si aucun chef n'est assigné
            const initials = head !== 'Unassigned'
              ? head.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'NA';

            return {
              ...dept,
              headName: head,
              headInitials: initials,
              headColor: colors[index % colors.length] // Couleur cyclique
            };
          });
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error loading departments:', err)
    });
  }

  // Récupère uniquement les utilisateurs ayant un rôle "employé", pour peupler le sélecteur
  // de chef de département. La recherche par sous-chaîne tolère plusieurs formats de rôle
  // (EMPLOYEE, ROLE_EMPLOYEE, emp, etc.), et le rôle peut être un champ simple ou un tableau.
  loadEmployees(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        console.log('--- ALL USERS ---', users); // Debug : vérifier la structure reçue du backend
        this.employees = (users || []).filter((u: any) => {
          const r = (u.role || '').toString().toUpperCase();
          const roles = Array.isArray(u.roles) ? u.roles.map((x: string) => x.toUpperCase()) : [];
          return r.includes('EMP') || roles.some((x: string) => x.includes('EMP'));
        });
        console.log('--- FILTERED EMPLOYEES ---', this.employees);
      },
      error: (err) => console.error('Error loading employees:', err)
    });
  }

  // --- Modale d'ajout ---

  // Ouvre la modale d'ajout et réinitialise le formulaire
  openAddModal(): void {
    this.ngZone.run(() => {
      this.isEditModalOpen = false;  // Ferme l'édition si ouverte
      this.newDeptName = '';         // Réinitialise le nom
      this.newDeptHead = '';         // Réinitialise le chef
      this.isAddModalOpen = true;
    });
  }

  // Ferme la modale d'ajout
  closeAddModal(): void {
    this.ngZone.run(() => {
      this.isAddModalOpen = false;
    });
  }

  // Enregistre un nouveau département via l'API
  saveDepartment(): void {
    this.ngZone.run(() => {
      // Vérifie que le nom n'est pas vide
      if (this.newDeptName.trim()) {
        const payload = {
          name: this.newDeptName.trim(),
          headName: this.newDeptHead.trim() || 'Unassigned' // Valeur par défaut si vide
        };

        this.departmentService.createDepartment(payload).subscribe({
          next: () => {
            this.loadDepartments();  // Recharge la liste
            this.closeAddModal();    // Ferme la modale
          },
          error: (err) => console.error('Error saving department:', err)
        });
      }
    });
  }

  // --- Modale d'édition ---

  // Ouvre la modale d'édition et pré-remplit le formulaire
  openEditModal(dept: Department): void {
    this.ngZone.run(() => {
      this.isAddModalOpen = false;   // Ferme l'ajout si ouvert
      this.selectedDepartment = dept;
      this.editDeptName = dept.name;
      this.editDeptHead = dept.headName;
      this.isEditModalOpen = true;
      this.cdr.detectChanges();
    });
  }

  // Ferme la modale d'édition
  closeEditModal(): void {
    this.ngZone.run(() => {
      this.isEditModalOpen = false;
      this.selectedDepartment = null;
      this.cdr.detectChanges();
    });
  }

  // Envoie les modifications du département au backend
  updateDepartment(): void {
    this.ngZone.run(() => {
      // Vérifie que le département et son ID sont présents
      if (!this.selectedDepartment || !this.selectedDepartment.id) return;
      // Vérifie que le nom n'est pas vide
      if (!this.editDeptName.trim()) return;

      const payload = {
        name: this.editDeptName.trim(),
        headName: this.editDeptHead.trim() || 'Unassigned'
      };

      this.departmentService.updateDepartment(this.selectedDepartment.id, payload).subscribe({
        next: () => {
          this.loadDepartments();  // Recharge la liste
          this.closeEditModal();   // Ferme la modale
        },
        error: (err) => console.error('Error updating department:', err)
      });
    });
  }

  // Supprime le département sélectionné
  deleteDepartment() {
    // Vérifie que le département et son ID sont présents
    if (!this.selectedDepartment || !this.selectedDepartment.id) return;

    this.departmentService.deleteDepartment(this.selectedDepartment.id).subscribe({
      next: () => {
        console.log('Department deleted successfully');
        this.loadDepartments();  // Recharge la liste
        this.closeEditModal();   // Ferme la modale
      },
      error: (err) => {
        console.error('FULL ERROR OBJECT:', err);
      }
    });
  }
}