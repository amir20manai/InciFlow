package com.inciflow_backend.services;

import com.inciflow_backend.dto.CategoryResponseDTO;
import com.inciflow_backend.entity.Category;
import com.inciflow_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Récupérer toutes les catégories avec leur nombre d'incidents
    public List<CategoryResponseDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();

        return categories.stream().map(cat -> {
            long count = (cat.getIncidents() != null) ? cat.getIncidents().size() : 0;
            return new CategoryResponseDTO(
                    cat.getId(),
                    cat.getName(),
                    cat.getDotColor(),
                    count
            );
        }).collect(Collectors.toList());
    }

    // Créer une nouvelle catégorie
    public CategoryResponseDTO createCategory(Category category) {
        Category savedCategory = categoryRepository.save(category);
        long count = 0;
        return new CategoryResponseDTO(
                savedCategory.getId(),
                savedCategory.getName(),
                savedCategory.getDotColor(),
                count
        );
    }

    // Mettre à jour une catégorie existante
    public CategoryResponseDTO updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));

        category.setName(categoryDetails.getName());
        if (categoryDetails.getDotColor() != null) {
            category.setDotColor(categoryDetails.getDotColor());
        }

        Category updatedCategory = categoryRepository.save(category);
        long count = (updatedCategory.getIncidents() != null) ? updatedCategory.getIncidents().size() : 0;

        return new CategoryResponseDTO(
                updatedCategory.getId(),
                updatedCategory.getName(),
                updatedCategory.getDotColor(),
                count
        );
    }

    // Supprimer une catégorie par son ID
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}