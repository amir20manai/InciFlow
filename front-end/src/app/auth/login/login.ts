// Importation des décorateurs et interfaces Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// Outils de formulaires réactifs
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Routeur et lien de navigation
import { Router, RouterLink } from '@angular/router';
// Service d'authentification
import { AuthService } from '../../services/auth';

// Décorateur du composant de connexion
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  // Formulaire réactif de connexion
  loginForm!: FormGroup;
  // Indique si le mot de passe doit être affiché en clair ou masqué
  showPassword = false;
  // Message d'erreur affiché à l'utilisateur DANS LA PAGE
  errorMessage = '';

  // Injection des services nécessaires
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation du composant
  ngOnInit(): void {
    // Création du formulaire avec validateurs
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) // Regex stricte : @ + .
      ]],
      password: ['', Validators.required]
    });
  }

  // Getter pour accéder au contrôle email depuis le template
  get emailControl() {
    return this.loginForm.get('email');
  }

  // Getter pour accéder au contrôle password depuis le template
  get passwordControl() {
    return this.loginForm.get('password');
  }

  // Vérifie si l'email est invalide (utilisé pour la classe CSS rouge)
  isEmailInvalid(): boolean {
    const email = this.emailControl;
    return !!(email && email.invalid && (email.dirty || email.touched));
  }

  // Vérifie si le mot de passe est invalide
  isPasswordInvalid(): boolean {
    const password = this.passwordControl;
    return !!(password && password.invalid && (password.dirty || password.touched));
  }

  // Bascule l'affichage du mot de passe (clair / masqué)
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Soumission du formulaire de connexion
  onSubmit(): void {
    // 1️ Réinitialise le message d'erreur
    this.errorMessage = '';

    // 2️ Marque tous les champs comme "touchés" pour afficher les erreurs sous les champs
    this.loginForm.markAllAsTouched();

    // 3️ Vérifie la validité du formulaire
    if (this.loginForm.invalid) {
      if (this.emailControl?.errors?.['required']) {
        this.errorMessage = 'Veuillez saisir votre adresse email.';
      } else if (this.emailControl?.errors?.['email'] || this.emailControl?.errors?.['pattern']) {
        this.errorMessage = 'Veuillez saisir une adresse email valide (ex: nom@domaine.com).';
      } else if (this.passwordControl?.errors?.['required']) {
        this.errorMessage = 'Veuillez saisir votre mot de passe.';
      } else {
        this.errorMessage = 'Veuillez corriger les erreurs du formulaire.';
      }

      // Force la détection de changement AVANT le return
      this.cdr.detectChanges();
      return;
    }

    // 4️ Récupère les identifiants saisis
    const credentials = this.loginForm.value;

    // 5️ Appel au service d'authentification
    this.authService.login(credentials).subscribe({
      next: (response: any) => {
        // CAS 1 : Réponse sans token → email inexistant
        if (!response || !response.token) {
          this.errorMessage = "Ce profil n'existe pas. Veuillez vérifier votre adresse email ou créer un compte.";
          this.cdr.detectChanges();
          return;
        }

        //  CORRECTION : utilise authService.saveToken() pour unifier la clé 'token'
        this.authService.saveToken(response.token);

        const role = response.role ? response.role.toLowerCase() : 'employee';
        localStorage.setItem('role', role);

        // Redirection selon le rôle
        this.redirectByRole(role);
      },

      error: (err) => {
        // CAS 2 : Erreur HTTP renvoyée par le backend
        const status = err?.status;
        const backendMsg = (err?.error?.error || err?.error?.message || '').toString().toLowerCase();

        if (status === 404) {
          this.errorMessage = "Ce profil n'existe pas. Veuillez vérifier votre adresse email ou créer un compte.";
        } else if (status === 401 || status === 403) {
          this.errorMessage = 'Mot de passe incorrect. Veuillez réessayer.';
        } else if (backendMsg.includes('user not found')) {
          this.errorMessage = "Ce profil n'existe pas. Veuillez vérifier votre adresse email ou créer un compte.";
        } else if (backendMsg.includes('invalid password')) {
          this.errorMessage = 'Mot de passe incorrect. Veuillez réessayer.';
        } else if (status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage = 'Informations incorrectes. Veuillez vérifier votre email et votre mot de passe.';
        }

        this.cdr.detectChanges();
      }
    });
  }

  // Redirige l'utilisateur selon son rôle
  private redirectByRole(role: string): void {
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'technician':
        this.router.navigate(['/technicien/dashboard']);
        break;
      case 'employee':
      default:
        this.router.navigate(['/employee/dashboard']);
        break;
    }
  }
}