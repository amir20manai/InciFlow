// Importation des décorateurs et outils Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// Outils de routage : lien, navigation, lien actif
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
// Service utilisateur pour récupérer le profil
import { UserService } from '../../services/user';

// Composant : barre latérale (sidebar) avec informations utilisateur
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebarcomponent implements OnInit {
  // Nom complet de l'utilisateur connecté (affiché en haut de la sidebar)
  userName: string = 'Loading...';
  // Email de l'utilisateur connecté
  userEmail: string = '';
  // Initiales pour l'avatar (ex: "AB" pour "Ahmed Ben Ali")
  userInitials: string = '...';

  // Injection des services nécessaires
  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) {}

  // Appelé à l'initialisation du composant
  ngOnInit(): void {
    // Récupère les données utilisateur directement depuis le backend
    // (même logique que la page Profile pour garantir la cohérence)
    this.userService.getProfile().subscribe({
      next: (user: any) => {
        if (user) {
          // Récupération du prénom et du nom (plusieurs noms possibles selon le backend)
          const fName = user.firstName || user.firstname || '';
          const lName = user.lastName || user.lastname || '';
          this.userEmail = user.email || '';

          // Cas 1 : prénom et/ou nom renseignés → on les utilise
          if (fName || lName) {
            this.userName = `${fName} ${lName}`.trim();
            this.userInitials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase();
          }
          // Cas 2 : aucun nom renseigné → on utilise la partie avant @ de l'email
          else {
            const sub = this.userEmail.split('@')[0] || 'User';
            this.userName = sub;
            this.userInitials = this.userName.substring(0, 2).toUpperCase();
          }

          // Force Angular à rafraîchir la vue immédiatement
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        // En cas d'erreur (backend indisponible, token expiré...), on affiche
        // des valeurs par défaut pour éviter un écran vide
        console.error('Erreur chargement profil dans sidebar :', err);
        this.userName = 'User';
        this.userInitials = 'US';
        this.cdr.detectChanges();
      }
    });
  }

  // Déconnexion : vide le localStorage et redirige vers la page de connexion
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}