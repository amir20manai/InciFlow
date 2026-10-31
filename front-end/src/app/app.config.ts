// Importation des outils Angular principaux
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// Importation du système de routage
import { provideRouter } from '@angular/router';
// Importation du client HTTP + support des intercepteurs
import { provideHttpClient, withInterceptors } from '@angular/common/http';
// Importation des routes de l'application
import { routes } from './app.routes';
// Importation de l'intercepteur JWT (ajoute le token à chaque requête)
import { jwtInterceptor } from './interceptors/jwt-interceptor';

// Configuration globale de l'application Angular (standalone)
export const appConfig: ApplicationConfig = {
  providers: [
    // Active la détection de changements optimisée (regroupe les événements)
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Fournit le système de routage avec les routes définies
    provideRouter(routes),

    // Fournit le client HTTP en y injectant l'intercepteur JWT
    // → Chaque requête HTTP enverra automatiquement le token d'authentification
    provideHttpClient(withInterceptors([jwtInterceptor]))
  ]
};