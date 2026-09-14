import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategorieService } from '../../services/categorie';
import { CategoryResponse } from '../../models/categorie';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class Categories implements OnInit {
  globalSearch: string = '';
  
  isAddModalVisible: boolean = false;
  isEditModalVisible: boolean = false;

  newCategoryName: string = '';
  newCategoryColor: string = '#3b82f6';

  selectedCategory: CategoryResponse | null = null;
  editCategoryName: string = '';
  editCategoryColor: string = '#3b82f6';

  categories: CategoryResponse[] = [];

  constructor(
    private categoryService: CategorieService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone // <--- زدنا NgZone هنا
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.categories = data.map((cat, index) => {
            const colors = ['#3b82f6', '#0ea5e9', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
            const hex = cat.dotColor || colors[index % colors.length];
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            
            return {
              ...cat,
              count: cat.count || 0,
              dotColor: hex,
              dotBg: `rgba(${r}, ${g}, ${b}, 0.15)`
            };
          });
          this.cdr.detectChanges();
        });
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  openAddModal(): void {
    this.ngZone.run(() => {
      this.isEditModalVisible = false;
      this.newCategoryName = '';
      this.newCategoryColor = '#3b82f6';
      this.isAddModalVisible = true;
    });
  }

  closeAddModal(): void {
    this.ngZone.run(() => {
      this.isAddModalVisible = false;
    });
  }

  saveCategory(): void {
    this.ngZone.run(() => {
      if (this.newCategoryName.trim()) {
        const payload = { 
          name: this.newCategoryName.trim(),
          dotColor: this.newCategoryColor 
        };

        this.categoryService.createCategory(payload).subscribe({
          next: () => {
            this.loadCategories();
            this.closeAddModal();
          },
          error: (err) => console.error('Error saving category:', err)
        });
      }
    });
  }

  openEditModal(cat: CategoryResponse): void {
    this.ngZone.run(() => {
      this.isAddModalVisible = false;
      this.selectedCategory = cat;
      this.editCategoryName = cat ? cat.name : '';
      this.editCategoryColor = cat && cat.dotColor ? cat.dotColor : '#3b82f6';
      this.isEditModalVisible = true;
      this.cdr.detectChanges();
    });
  }

  // مغلفة بـ ngZone باش تخدم من أول كليك من غير ما تستحق كورسور
  closeEditModal(): void {
    this.ngZone.run(() => {
      this.isEditModalVisible = false;
      this.selectedCategory = null;
      this.cdr.detectChanges();
    });
  }

  updateCategory(): void {
    this.ngZone.run(() => {
      console.log("Selected Category ID:", this.selectedCategory?.id); // <--- شوف هل الـ ID موجود والا null؟
      console.log("Payload data:", { name: this.editCategoryName, dotColor: this.editCategoryColor });

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
          this.loadCategories();
          this.closeEditModal();
        },
        error: (err) => console.error('Error updating category:', err)
      });
    });
  }

  deleteCategory(): void {
    this.ngZone.run(() => {
      console.log("Delete ID:", this.selectedCategory?.id); // <--- شوف هل الـ ID موجود والا null؟

      if (!this.selectedCategory || !this.selectedCategory.id) {
        console.error("ID is missing for delete!");
        return;
      }

      if (confirm(`Voulez-vous vraiment supprimer la catégorie "${this.selectedCategory.name}" ?`)) {
        this.categoryService.deleteCategory(this.selectedCategory.id).subscribe({
          next: () => {
            console.log("Deleted successfully");
            this.loadCategories();
            this.closeEditModal();
          },
          error: (err) => console.error('Error deleting category:', err)
        });
      }
    });
  }
}