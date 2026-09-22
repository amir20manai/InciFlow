// Importation des outils Angular
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// ============================================================
// GUARD DE RÔLE
// Vérifie que l'utilisateur a le bon rôle pour la route
// Le rôle attendu est défini via `data.role` dans les routes
// ============================================================
export const roleGuard: CanActivateFn = (route, state) => {
  // Injection du routeur
  const router = inject(Router);

  // Récupération du rôle utilisateur (stocké au login)
  const userRole = localStorage.getItem('role');

  // Récupération du rôle attendu depuis la config de la route
  const expectedRole = route.data['role'];

  // Log de débogage (à retirer en production)
  console.log('roleGuard : rôle utilisateur =', userRole, '| rôle attendu =', expectedRole);

  // ✅ Cas 1 : Les rôles correspondent → accès autorisé
  if (userRole === expectedRole) {
    return true;
  }

  // ❌ Cas 2 : Rôles différents → redirection vers l'espace du bon rôle
  console.warn('roleGuard : Accès refusé. Redirection.');

  switch (userRole) {
    case 'admin':
      router.navigate(['/admin/dashboard']);
      break;
    case 'technician':
    case 'technicien':
      router.navigate(['/technicien/dashboard']);
      break;
    case 'employee':
    case 'employe':
      router.navigate(['/employee/dashboard']);
      break;
    default:
      router.navigate(['/login']);
      break;
  }

  return false;
};