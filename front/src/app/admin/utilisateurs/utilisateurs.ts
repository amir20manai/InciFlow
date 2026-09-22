import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { DepartmentService } from '../../services/departement'; // <-- Zid l'import mtaâ el service mtaâk (thabbt fel chemin s7i7 wela la)

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './utilisateurs.html',
  styleUrls: ['./utilisateurs.css']
})
export class Utilisateurs implements OnInit {
  searchQuery: string = '';
  selectedRole: string = 'ALL';
  users: any[] = [];
  departmentsList: string[] = [];
  filteredUsers: any[] = [];
  errorMessage = '';

  // Variables pour la modale de modification
  isEditModalOpen: boolean = false;
  selectedUser: any = {};

  // Zid DepartmentService houni fel constructor
  constructor(
    private userService: UserService, 
    private departmentService: DepartmentService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadDepartments(); // <-- Nadiwha houni bech tjib el départements el kol mel base
  }

  // Fonction jdida tjib el départements lkol direct mel backend
  loadDepartments(): void {
    this.departmentService.getAllDepartments().subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        this.departmentsList = list.map((d: any) => d.name || d).filter((d: string) => d && d !== 'General');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching departments', err);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('DATA RECEIVED FROM BACKEND:', res);
        
        const list = Array.isArray(res) ? res : (res?.content || res?.data || []);
        const colors = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
        
        this.users = list.map((u: any, index: number) => {
          const firstName = u?.firstName || u?.prenom || '';
          const lastName = u?.lastName || u?.nom || '';
          const fullName = `${firstName} ${lastName}`.trim() || u?.email || 'User';
          
          const firstInitial = firstName.charAt(0) || '';
          const lastInitial = lastName.charAt(0) || '';
          const initials = (firstInitial + lastInitial).toUpperCase() || 'U';

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
            color: colors[index % colors.length],
            role: u?.role || 'Employee',
            department: deptName,
            phone: u?.phone || u?.telephone || 'No phone',
            email: u?.email || 'No email'
          };
        });

        this.filteredUsers = [...this.users];
        this.filterUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users', err);
        this.errorMessage = 'Erreur lors du chargement des utilisateurs.';
        this.cdr.detectChanges();
      }
    });
  }

  filterUsers(): void {
    if (!this.users || !Array.isArray(this.users)) {
      this.filteredUsers = [];
      return;
    }

    this.filteredUsers = this.users.filter(u => {
      const query = this.searchQuery ? this.searchQuery.toLowerCase().trim() : '';

      const matchQuery = !query || 
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.department && u.department.toLowerCase().includes(query));

      const matchRole = this.selectedRole === 'ALL' || 
        (u.role && u.role.toUpperCase() === this.selectedRole.toUpperCase());

      return matchQuery && matchRole;
    });

    this.cdr.detectChanges();
  }

  openEditModal(user: any): void {
    this.selectedUser = { ...user };
    this.isEditModalOpen = true;
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.selectedUser = {};
    this.cdr.detectChanges();
  }

  saveUserChanges(): void {
    if (!this.selectedUser || !this.selectedUser.id) return;

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
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erreur lors de la modification', err);
        alert('Erreur lors de la mise à jour de l’utilisateur.');
      }
    });
  }

  deleteUser(id: number): void {
    if (!id) return;
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
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