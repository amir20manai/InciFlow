// Importation des outils Angular
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// ============================================================
// GUARD D'AUTHENTIFICATION
// Vérifie que l'utilisateur est connecté (token présent)
// Si non → redirection vers /login
// ============================================================
export const authGuard: CanActivateFn = (route, state) => {
  // Injection du routeur
  const router = inject(Router);

  // Récupération du token JWT depuis le localStorage
  const token = localStorage.getItem('token');

  //  Cas 1 : Token présent → accès autorisé
  if (token) {
    return true;
  }

  //  Cas 2 : Pas de token → redirection vers login
  console.warn('authGuard : Aucun token trouvé. Redirection vers /login');
  router.navigate(['/login']);
  return false;
};