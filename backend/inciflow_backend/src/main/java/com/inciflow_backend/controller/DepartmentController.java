package com.inciflow_backend.controller;

import com.inciflow_backend.dto.DepartmentResponseDTO;
import com.inciflow_backend.entity.Department;
import com.inciflow_backend.services.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    // ============================================================
    // Récupérer tous les départements
    // GET /api/departments
    // ============================================================
    @GetMapping
    public ResponseEntity<List<DepartmentResponseDTO>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    // ============================================================
    // Créer un nouveau département
    // POST /api/departments
    // ============================================================
    @PostMapping
    public ResponseEntity<DepartmentResponseDTO> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(departmentService.createDepartment(department));
    }

    // ============================================================
    // Mettre à jour un département existant
    // PUT /api/departments/{id}
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponseDTO> updateDepartment(@PathVariable Long id, @RequestBody Department departmentDetails) {
        return ResponseEntity.ok(departmentService.updateDepartment(id, departmentDetails));
    }

    // ============================================================
    // Supprimer un département
    // DELETE /api/departments/{id}
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepartment(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
        return ResponseEntity.ok().build();
    }
}