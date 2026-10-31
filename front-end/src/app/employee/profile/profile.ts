// Importation des décorateurs et outils Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base
import { CommonModule } from '@angular/common';
// Module de formulaires
import { FormsModule } from '@angular/forms';
// Service utilisateur
import { UserService } from '../../services/user';

// Composant : profil de l'utilisateur (consultation + édition + changement de mot de passe)
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  // Informations de l'utilisateur
  firstName: string = '';
  lastName: string = '';
  fullName: string = '';
  email: string = '';
  role: string = 'EMPLOYEE';
  initials: string = '';
  title: string = 'System User';
  department: string = '';
  phone: string = '';

  // Champs du formulaire de changement de mot de passe
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Injection des services
  constructor(private userService: UserService, private cdr: ChangeDetectorRef) {}

  // Appelé à l'initialisation
  ngOnInit(): void {
    this.loadUserProfile();
  }

  // Charge le profil de l'utilisateur connecté
  loadUserProfile(): void {
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        console.log("Objet utilisateur complet du backend :", user);
        if (user) {
          // Récupération des champs (avec plusieurs noms possibles)
          this.firstName = user.firstName || user.firstname || '';
          this.lastName = user.lastName || user.lastname || '';
          this.email = user.email || '';
          this.role = user.role || 'EMPLOYEE';
          this.department = user.department || '';
          this.phone = user.phone || '';

          // Calcul du nom complet et des initiales
          this.fullName = `${this.firstName} ${this.lastName}`.trim();
          this.initials = `${this.firstName ? this.firstName.charAt(0) : ''}${this.lastName ? this.lastName.charAt(0) : ''}`.toUpperCase();
          this.title = this.role === 'ADMIN' ? 'System Administrator' : 'Employee';

          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Erreur chargement profil :', err);
      }
    });
  }

  // Met à jour le profil de l'utilisateur
  updateProfile(): void {
    const data = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      department: { name: this.department },
      phone: this.phone
    };

    this.userService.updateProfile(data).subscribe({
      next: (res) => {
        alert('Profil mis à jour avec succès !');
        // Rechargement de la page pour rafraîchir le sidebar et le profil
        window.location.reload();
      },
      error: (err) => {
        console.error('Erreur mise à jour profil :', err);
        alert('Erreur lors de la mise à jour du profil');
      }
    });
  }

  // Change le mot de passe de l'utilisateur
  changePassword(): void {
    // Vérification : les deux mots de passe doivent correspondre
    if (this.newPassword !== this.confirmPassword) {
      alert('Les nouveaux mots de passe ne correspondent pas !');
      return;
    }

    const data = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    };

    this.userService.changePassword(data).subscribe({
      next: (res) => {
        alert('Mot de passe changé avec succès !');
        // Réinitialisation des champs
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        alert(err.error?.error || 'Échec du changement de mot de passe. Vérifiez votre mot de passe actuel.');
      }
    });
  }
}