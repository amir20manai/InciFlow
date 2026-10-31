// Importation du type de fonction pour les intercepteurs HTTP Angular
import { HttpInterceptorFn } from '@angular/common/http';

// Intercepteur JWT : ajoute automatiquement le token d'authentification
// à toutes les requêtes sortantes (sauf celles d'authentification)
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  //  EXCEPTION : on n'ajoute PAS de token aux routes d'authentification
  // (login/register/authenticate), car elles ne nécessitent pas d'être authentifié
  if (req.url.includes('/api/auth/')) {
    return next(req);
  }

  // Récupération du token JWT depuis le localStorage
  const token = localStorage.getItem('token');

  // Ajout du token dans le header Authorization de la requête
  if (token) {
    // On clone la requête (elle est immuable) et on ajoute le header
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  } else {
    // Avertissement si aucun token n'est trouvé (utile pour le débogage)
    console.warn('Interception - Aucun token trouvé ! Requête envoyée sans Authorization.');
  }

  // Si aucun token, on laisse passer la requête telle quelle
  return next(req);
};