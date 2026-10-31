// Importation des décorateurs et utilitaires Angular
import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
// Module commun pour les directives de base (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';
// Module de formulaires pour ngModel
import { FormsModule } from '@angular/forms';
// Service de gestion des catégories
import { CategorieService } from '../../services/categorie';
// Modèle de réponse d'une catégorie
import { CategoryResponse } from '../../models/categorie';

// Composant admin : gestion des catégories d'incidents (liste, ajout, édition, suppression)
@Component({
  selector: 'app-categories',       // Sélecteur HTML du composant
  standalone: true,                  // Composant autonome (pas besoin de NgModule)
  imports: [CommonModule, FormsModule], // Modules importés
  templateUrl: './categories.html',  // Fichier HTML du composant
  styleUrls: ['./categories.css']    // Fichier(s) CSS du composant
})
export class Categories implements OnInit {
  // Champ de recherche globale (non utilisé pour l'instant dans la logique de filtrage ci-dessous)
  globalSearch: string = '';

  // États d'affichage des deux fenêtres modales
  isAddModalVisible: boolean = false;   // Modale d'ajout ouverte ?
  isEditModalVisible: boolean = false;  // Modale d'édition ouverte ?

  // Champs du formulaire d'ajout
  newCategoryName: string = '';
  newCategoryColor: string = '#3b82f6'; // Couleur par défaut (bleu)

  // Catégorie actuellement sélectionnée pour édition, et champs du formulaire d'édition
  selectedCategory: CategoryResponse | null = null;
  editCategoryName: string = '';
  editCategoryColor: string = '#3b82f6';

  // Liste des catégories affichées
  categories: CategoryResponse[] = [];

  // Injection des services nécessaires
  constructor(
    private categoryService: CategorieService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // Permet de forcer la détection de changement même hors du cycle normal d'Angular
  ) {}

  // Appelé à l'initialisation du composant
  ngOnInit(): void {
    this.loadCategories();
  }

  // Récupère la liste des catégories depuis le backend et prépare les couleurs d'affichage
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          // Transforme chaque catégorie pour l'affichage
          this.categories = data.map((cat, index) => {
            // Palette de couleurs par défaut, utilisée en boucle si la catégorie n'a pas de couleur définie
            const colors = ['#3b82f6', '#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
            const hex = cat.dotColor || colors[index % colors.length];

            // Conversion de la couleur hexadécimale en composantes RGB
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);

            return {
              ...cat,
              count: cat.count || 0,          // Nombre d'incidents dans cette catégorie
              dotColor: hex,                   // Couleur du point/badge
              // Version "pâle" (15% d'opacité) de la couleur, utilisée comme fond du badge
              dotBg: `rgba(${r}, ${g}, ${b}, 0.15)`
            };
          });
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  // Ouvre la modale d'ajout et réinitialise le formulaire
  openAddModal(): void {
    this.ngZone.run(() => {
      this.isEditModalVisible = false;        // Ferme l'édition si ouverte
      this.newCategoryName = '';              // Réinitialise le nom
      this.newCategoryColor = '#3b82f6';      // Réinitialise la couleur
      this.isAddModalVisible = true;
    });
  }

  // Ferme la modale d'ajout
  closeAddModal(): void {
    this.ngZone.run(() => {
      this.isAddModalVisible = false;
    });
  }

  // Enregistre une nouvelle catégorie via l'API, puis recharge la liste
  saveCategory(): void {
    this.ngZone.run(() => {
      // Vérifie que le nom n'est pas vide
      if (this.newCategoryName.trim()) {
        const payload = {
          name: this.newCategoryName.trim(),
          dotColor: this.newCategoryColor
        };

        this.categoryService.createCategory(payload).subscribe({
          next: () => {
            this.loadCategories();  // Recharge la liste
            this.closeAddModal();   // Ferme la modale
          },
          error: (err) => console.error('Error saving category:', err)
        });
      }
    });
  }

  // Ouvre la modale d'édition et pré-remplit le formulaire avec la catégorie sélectionnée
  openEditModal(cat: CategoryResponse): void {
    this.ngZone.run(() => {
      this.isAddModalVisible = false;         // Ferme l'ajout si ouvert
      this.selectedCategory = cat;
      this.editCategoryName = cat ? cat.name : '';
      this.editCategoryColor = cat && cat.dotColor ? cat.dotColor : '#3b82f6';
      this.isEditModalVisible = true;
      this.cdr.detectChanges();
    });
  }

  // Enveloppée dans ngZone pour fonctionner dès le premier clic, sans nécessiter un second clic
  closeEditModal(): void {
    this.ngZone.run(() => {
      this.isEditModalVisible = false;
      this.selectedCategory = null;
      this.cdr.detectChanges();
    });
  }

  // Envoie les modifications de la catégorie sélectionnée au backend
  updateCategory(): void {
    this.ngZone.run(() => {
      console.log("Selected Category ID:", this.selectedCategory?.id); // Debug : vérifier que l'ID est bien présent
      console.log("Payload data:", { name: this.editCategoryName, dotColor: this.editCategoryColor });

      // Vérifie que la catégorie et son ID sont présents
      if (!this.selectedCategory || !this.selectedCategory.id) {
        console.error("ID is missing!");
        return;
      }

      const payload = {
        name: this.editCategoryName.trim(),
        dotColor: this.editCategoryColor
      };

      this.categoryService.updateCategory(this.selectedCategory.id, payload).subscribe({
        next: (res) => {
          console.log("Updated successfully:", res);
          this.loadCategories();   // Recharge la liste
          this.closeEditModal();   // Ferme la modale
        },
        error: (err) => console.error('Error updating category:', err)
      });
    });
  }

  // Supprime la catégorie sélectionnée après confirmation de l'utilisateur
  deleteCategory(): void {
    this.ngZone.run(() => {
      console.log("Delete ID:", this.selectedCategory?.id); // Debug : vérifier que l'ID est bien présent

      // Vérifie que la catégorie et son ID sont présents
      if (!this.selectedCategory || !this.selectedCategory.id) {
        console.error("ID is missing for delete!");
        return;
      }

      // Demande confirmation avant suppression
      if (confirm(`Voulez-vous vraiment supprimer la catégorie "${this.selectedCategory.name}" ?`)) {
        this.categoryService.deleteCategory(this.selectedCategory.id).subscribe({
          next: () => {
            console.log("Deleted successfully");
            this.loadCategories();  // Recharge la liste
            this.closeEditModal();  // Ferme la modale
          },
          error: (err) => console.error('Error deleting category:', err)
        });
      }
    });
  }
}