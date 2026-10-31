// Importation des décorateurs et outils Angular
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// Module commun pour les directives de base (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// Outils de routage : navigation + lien actif
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
// Service utilisateur pour récupérer le profil
import { UserService } from '../../services/user';

// Composant : barre latérale (sidebar) de l'espace employé
@Component({
  selector: 'app-sidebar-technicien',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  // Nom complet de l'utilisateur connecté
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
    // pour garantir que les informations sont toujours à jour
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
            const firstInitial = fName ? fName.charAt(0) : '';
            const lastInitial = lName ? lName.charAt(0) : '';
            this.userInitials = `${firstInitial}${lastInitial}`.toUpperCase();
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
        // En cas d'erreur (backend indisponible, token expiré...), on tente
        // de récupérer les informations depuis le token JWT stocké localement
        console.error('Erreur récupération profil sidebar, fallback sur token :', err);
        this.loadFromTokenFallback();
      }
    });
  }

  // Méthode de secours : décode le token JWT pour extraire les infos utilisateur
  // (utilisé si l'appel au backend échoue)
  loadFromTokenFallback(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Décodage du payload du JWT (partie centrale du token)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const fName = payload.firstName || '';
        const lName = payload.lastName || '';
        this.userEmail = payload.email || payload.sub || '';
        this.userName = `${fName} ${lName}`.trim() || 'User';
        this.userInitials = `${fName.charAt(0)}${lName.charAt(0)}`.toUpperCase() || 'US';
        this.cdr.detectChanges();
      } catch (e) {
        // Si le token est corrompu, on ignore silencieusement
      }
    }
  }

  // Déconnexion : vide le localStorage et redirige vers la page de connexion
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}