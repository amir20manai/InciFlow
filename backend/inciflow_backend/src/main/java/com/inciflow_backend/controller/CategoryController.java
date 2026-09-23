package com.inciflow_backend.controller;

import com.inciflow_backend.dto.CategoryResponseDTO;
import com.inciflow_backend.entity.Category;
import com.inciflow_backend.services.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:4200")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // ============================================================
    // Récupérer toutes les catégories
    // GET /api/categories
    // ============================================================
    @GetMapping
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // ============================================================
    // Créer une nouvelle catégorie
    // POST /api/categories
    // ============================================================
    @PostMapping
    public ResponseEntity<CategoryResponseDTO> createCategory(@RequestBody Category category) {
        CategoryResponseDTO saved = categoryService.createCategory(category);
        return ResponseEntity.ok(saved);
    }

    // ============================================================
    // Mettre à jour une catégorie existante
    // PUT /api/categories/{id}
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDTO> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        CategoryResponseDTO updated = categoryService.updateCategory(id, category);
        return ResponseEntity.ok(updated);
    }

    // ============================================================
    // Supprimer une catégorie
    // DELETE /api/categories/{id}
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}