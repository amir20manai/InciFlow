// Importation des décorateurs et interfaces Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// Importation des outils de formulaires réactifs
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Importation du routeur et du lien de navigation
import { Router, RouterLink } from '@angular/router';
// Importation du service d'authentification
import { AuthService } from '../../services/auth';

// Décorateur du composant d'inscription
@Component({
  selector: 'app-register',        // Sélecteur HTML du composant
  standalone: true,                 // Composant autonome
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // Modules importés
  templateUrl: './register.html',   // Fichier HTML du composant
  styleUrl: './register.css'        // Fichier CSS du composant
})
export class RegisterComponent implements OnInit {
  // Formulaire réactif d'inscription
  registerForm!: FormGroup;
  // Indique si le mot de passe doit être affiché en clair ou masqué
  showPassword = false;
  // Message d'erreur global
  errorMessage = '';
  // Message de succès
  successMessage = '';

  // Injection des services nécessaires
  //  AJOUT : ChangeDetectorRef pour forcer l'affichage immédiat des messages
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // Appelé à l'initialisation du composant
  ngOnInit(): void {
    // Création du formulaire avec validateurs personnalisés
    this.registerForm = this.fb.group({
      // Prénom : obligatoire + alphabétique uniquement
      firstname: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
      ]],
      // Nom : obligatoire + alphabétique uniquement
      lastname: ['', [
        Validators.required,
        Validators.pattern(/^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/)
      ]],
      // Email : obligatoire + format valide (doit contenir @ et .)
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      ]],
      // Téléphone : optionnel + uniquement chiffres, espaces et le caractère "+"
      phone: ['', [
        Validators.pattern(/^[+]?[0-9\s]*$/)
      ]],
      // Mot de passe : obligatoire + minimum 6 caractères
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]],
      // Confirmation du mot de passe : obligatoire
      confirmPassword: ['', Validators.required]
    });
  }

  // Bascule l'affichage du mot de passe (clair / masqué)
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // --- Getters pratiques pour accéder aux contrôles depuis le template ---
  get firstnameControl() { return this.registerForm.get('firstname'); }
  get lastnameControl() { return this.registerForm.get('lastname'); }
  get emailControl() { return this.registerForm.get('email'); }
  get phoneControl() { return this.registerForm.get('phone'); }
  get passwordControl() { return this.registerForm.get('password'); }
  get confirmPasswordControl() { return this.registerForm.get('confirmPassword'); }

  // Soumission du formulaire d'inscription
  onSubmit(): void {
    // 1 Réinitialise les messages à chaque tentative
    this.errorMessage = '';
    this.successMessage = '';

    // 2️ Marque tous les champs comme "touchés" pour afficher les erreurs sous les champs
    this.registerForm.markAllAsTouched();

    // 3️ Si le formulaire est invalide, on affiche un message global et on arrête
    if (this.registerForm.invalid) {
      // Message global spécifique selon le premier champ invalide
      if (this.firstnameControl?.errors?.['required']) {
        this.errorMessage = 'Veuillez saisir votre prénom.';
      } else if (this.firstnameControl?.errors?.['pattern']) {
        this.errorMessage = 'Le prénom doit contenir uniquement des lettres.';
      } else if (this.lastnameControl?.errors?.['required']) {
        this.errorMessage = 'Veuillez saisir votre nom.';
      } else if (this.lastnameControl?.errors?.['pattern']) {
        this.errorMessage = 'Le nom doit contenir uniquement des lettres.';
      } else if (this.emailControl?.errors?.['required']) {
        this.errorMessage = 'Veuillez saisir votre adresse email.';
      } else if (this.emailControl?.errors?.['email'] || this.emailControl?.errors?.['pattern']) {
        this.errorMessage = 'Veuillez saisir une adresse email valide (ex: nom@domaine.com).';
      } else if (this.phoneControl?.errors?.['pattern']) {
        this.errorMessage = 'Le téléphone doit contenir uniquement des chiffres et le caractère "+".';
      } else if (this.passwordControl?.errors?.['required']) {
        this.errorMessage = 'Veuillez saisir votre mot de passe.';
      } else if (this.passwordControl?.errors?.['minlength']) {
        this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else if (this.confirmPasswordControl?.errors?.['required']) {
        this.errorMessage = 'Veuillez confirmer votre mot de passe.';
      } else {
        this.errorMessage = 'Veuillez corriger les erreurs dans le formulaire.';
      }

      //  FORCER la détection de changement AVANT le return
      this.cdr.detectChanges();
      return;
    }

    const formValues = this.registerForm.value;

    // 4️ Vérifie que les deux mots de passe correspondent
    if (formValues.password !== formValues.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas !';
      //  FORCER la détection de changement
      this.cdr.detectChanges();
      return;
    }

    // 5️ Prépare les données à envoyer au backend
    const userData = {
      firstName: formValues.firstname,
      lastName: formValues.lastname,
      email: formValues.email,
      password: formValues.password,
      phone: formValues.phone,
      role: 'EMPLOYEE',              // Rôle par défaut
      department: 'IT Department'    // Département par défaut
    };

    // 6️ Appel au service d'inscription
    this.authService.register(userData).subscribe({
      next: (response) => {
        this.successMessage = 'Compte créé avec succès !';
        //  FORCER la détection de changement
        this.cdr.detectChanges();
        // Redirection vers la page de connexion après 1,5 seconde
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        console.error('Registration error', err);
        const status = err?.status;
        const backendMsg = (err?.error?.error || err?.error?.message || '').toString().toLowerCase();

        if (status === 409 || backendMsg.includes('already') || backendMsg.includes('déjà')) {
          this.errorMessage = 'Cet email est déjà utilisé. Veuillez en choisir un autre ou vous connecter.';
        } else if (status === 400) {
          this.errorMessage = 'Les informations fournies sont invalides. Veuillez vérifier et réessayer.';
        } else if (status === 0) {
          this.errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else {
          this.errorMessage = "Erreur lors de l'inscription. Veuillez réessayer plus tard.";
        }

        //  FORCER la détection de changement APRÈS avoir défini le message
        this.cdr.detectChanges();
      }
    });
  }
}