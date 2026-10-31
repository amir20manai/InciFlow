// Importation des décorateurs et interfaces Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires pour ngModel
import { FormsModule } from '@angular/forms';
// Service utilisateur pour les opérations sur le profil
import { UserService } from '../../services/user';

// Décorateur du composant profil administrateur
@Component({
  selector: 'app-profile-admin',       // Sélecteur HTML
  standalone: true,                     // Composant autonome
  imports: [CommonModule, FormsModule], // Modules importés
  templateUrl: './profile.html',        // Fichier HTML
  styleUrl: './profile.css',            // Fichier CSS
})
export class ProfileAdmin implements OnInit {
  // Informations personnelles de l'utilisateur
  firstName: string = '';
  lastName: string = '';
  fullName: string = '';       // Nom complet (prénom + nom)
  email: string = '';
  role: string = 'EMPLOYEE';   // Rôle par défaut
  initials: string = '';       // Initiales pour l'avatar
  title: string = 'System User';
  department: string = '';
  phone: string = '';

  // Champs pour le changement de mot de passe
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Injection du service utilisateur et du détecteur de changements
  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Charge le profil de l'utilisateur connecté
  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        console.log("Full User Object from Backend:", user);
        if (user) {
          // Récupère les champs avec plusieurs noms possibles (camelCase ou lowercase)
          this.firstName = user.firstName || user.firstname || '';
          this.lastName = user.lastName || user.lastname || '';
          this.email = user.email || '';
          this.role = user.role || 'EMPLOYEE';
          this.department = user.department || '';
          this.phone = user.phone || '';
          
          // Calcul du nom complet et des initiales pour l'affichage
          this.fullName = `${this.firstName} ${this.lastName}`.trim();
          this.initials = `${this.firstName ? this.firstName.charAt(0) : ''}${this.lastName ? this.lastName.charAt(0) : ''}`.toUpperCase();
          this.title = this.role === 'ADMIN' ? 'System Administrator' : 'Employee';

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching profile details:', err);
      }
    });
  }

  // Met à jour le profil de l'utilisateur
  updateProfile(): void {
    // Prépare les données à envoyer
    const data = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      department: { name: this.department },
      phone: this.phone
    };

    this.userService.updateProfile(data).subscribe({
      next: (res) => {
        alert('Profile updated successfully!');
        // Recharge la page pour mettre à jour la sidebar et le profil
        window.location.reload();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        alert('Error updating profile');
      }
    });
  }

  // Change le mot de passe de l'utilisateur
  changePassword(): void {
    // Vérifie que les nouveaux mots de passe correspondent
    if (this.newPassword !== this.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    const data = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.userService.changePassword(data).subscribe({
      next: (res) => {
        alert('Password changed successfully!');
        // Réinitialise les champs
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        // Affiche l'erreur retournée par le backend
        alert(err.error?.error || 'Failed to change password. Check your current password.');
      }
    });
  }
}