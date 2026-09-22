// Importation des décorateurs et interfaces Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires pour ngModel
import { FormsModule } from '@angular/forms';
// Service utilisateur pour les opérations CRUD
import { UserService } from '../../services/user';
// Service département pour récupérer la liste des départements
import { DepartmentService } from '../../services/departement';

// Décorateur du composant de gestion des utilisateurs
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.html',
  styleUrls: ['./utilisateurs.css']
})
export class Utilisateurs implements OnInit {
  // Texte de recherche pour filtrer les utilisateurs
  searchQuery: string = '';
  // Rôle sélectionné pour le filtre ('ALL' = tous)
  selectedRole: string = 'ALL';
  // Liste complète des utilisateurs
  users: any[] = [];
  // Liste des noms de départements
  departmentsList: string[] = [];
  // Liste filtrée des utilisateurs (affichée dans le tableau)
  filteredUsers: any[] = [];
  // Message d'erreur
  errorMessage = '';

  // Variables pour la modale de modification
  isEditModalOpen: boolean = false;  // État d'ouverture de la modale
  selectedUser: any = {};            // Utilisateur en cours d'édition

  // Injection des services et du détecteur de changements
  constructor(
    private userService: UserService, 
    private departmentService: DepartmentService, 
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadUsers();         // Charge les utilisateurs
    this.loadDepartments();   // Charge les départements
  }

  // Charge la liste des départements depuis le backend
  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (res: any) => {
        // Gère différents formats de réponse (tableau direct, objet avec content/data)
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        // Extrait les noms et filtre les valeurs vides ou 'General'
        this.departmentsList = list.map((d: any) => d.name || d).filter((d: string) => d && d !== 'General');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching departments', err);
      }
    });
  }

  // Charge la liste des utilisateurs depuis le backend
  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('DATA RECEIVED FROM BACKEND:', res);
        
        // Gère différents formats de réponse
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        // Palette de couleurs pour les avatars
        const colors = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
        
        // Transforme chaque utilisateur pour l'affichage
        this.users = list.map((u: any, index: number) => {
          const firstName = u?.firstName || u?.prenom || '';
          const lastName = u?.lastName || u?.nom || '';
          const fullName = `${firstName} ${lastName}`.trim() || u?.email || 'User';
          
          // Calcule les initiales pour l'avatar
          const firstInitial = firstName.charAt(0) || '';
          const lastInitial = lastName.charAt(0) || '';
          const initials = (firstInitial + lastInitial).toUpperCase() || 'U';

          // Récupère le nom du département (objet ou chaîne)
          let deptName = 'General';
          if (u?.department) {
            deptName = typeof u.department === 'object' ? u.department.name : u.department;
          }

          return {
            ...u,
            firstName: firstName,
            lastName: lastName,
            name: fullName,
            subtitle: `${deptName} Member`,
            initials: initials,
            color: colors[index % colors.length],  // Couleur cyclique
            role: u?.role || 'Employee',
            department: deptName,
            phone: u?.phone || u?.telephone || 'No phone',
            email: u?.email || 'No email'
          };
        });

        this.filteredUsers = [...this.users];
        this.filterUsers();  // Applique les filtres
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        this.cdr.detectChanges();
      }
    });
  }

  // Filtre les utilisateurs selon la recherche et le rôle sélectionné
  filterUsers(): void {
    if (!this.users || !Array.isArray(this.users)) {
      this.filteredUsers = [];
      return;
    }

    this.filteredUsers = this.users.filter(u => {
      const query = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';

      // Vérifie si l'utilisateur correspond à la recherche (nom, email, département)
      const matchQuery = !query || 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.department && u.department.toLowerCase().includes(query));

      // Vérifie si l'utilisateur correspond au rôle sélectionné
      const matchRole = this.selectedRole === 'ALL' || 
        (u.role && u.role.toUpperCase() === this.selectedRole.toUpperCase());

      return matchQuery && matchRole;
    });

    this.cdr.detectChanges();
  }

  // Ouvre la modale d'édition pour un utilisateur
  openEditModal(user: any): void {
    this.selectedUser = { ...user };  // Copie pour ne pas modifier directement
    this.isEditModalOpen = true;
    this.cdr.detectChanges();
  }

  // Ferme la modale d'édition
  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = {};
    this.cdr.detectChanges();
  }

  // Sauvegarde les modifications de l'utilisateur
  saveUserChanges(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;

    // Prépare les données à envoyer au backend
    const payload = {
      firstName: this.selectedUser.firstName,
      lastName: this.selectedUser.lastName,
      email: this.selectedUser.email,
      role: this.selectedUser.role,
      department: {
        name: this.selectedUser.department
      }
    };

    this.userService.updateUser(this.selectedUser.id, payload).subscribe({
      next: (res) => {
        console.log('Utilisateur modifié avec succès', res);
        this.isEditModalOpen = false;
        this.loadUsers();  // Recharge la liste
      },
      error: (err) => {
        console.error('Erreur lors de la modification', err);
        alert('Erreur lors de la mise à jour de l\'utilisateur.');
      }
    });
  }

  // Supprime un utilisateur après confirmation
  deleteUser(id: number): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          // Retire l'utilisateur de la liste locale
          this.users = this.users.filter(u => u.id !== id);
          this.filterUsers();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error deleting user', err);
          alert('Erreur lors de la suppression.');
        }
      });
    }
  }

  // Retourne la classe CSS correspondant au rôle (pour le style du badge)
  getRoleClass(role: string): string {
    if (!role) return 'employee';
    switch (role.toLowerCase()) {
      case 'administrator': case 'admin': return 'admin';
      case 'technician': return 'technician';
      case 'employee': return 'employee';
      default: return 'employee';
    }
  }
}