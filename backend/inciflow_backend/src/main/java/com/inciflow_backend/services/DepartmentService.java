package com.inciflow_backend.services;

import com.inciflow_backend.dto.DepartmentResponseDTO;
import com.inciflow_backend.entity.Department;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public List<DepartmentResponseDTO> getAllDepartments() {
        return departmentRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public DepartmentResponseDTO createDepartment(Department department) {
        if (department.getHeadName() == null || department.getHeadName().trim().isEmpty()) {
            department.setHeadName("Unassigned");
        }
        Department saved = departmentRepository.save(department);
        return mapToDTO(saved);
    }

    public DepartmentResponseDTO updateDepartment(Long id, Department departmentDetails) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id " + id));

        department.setName(departmentDetails.getName());
        if (departmentDetails.getHeadName() != null) {
            department.setHeadName(departmentDetails.getHeadName());
        }

        Department updated = departmentRepository.save(department);
        return mapToDTO(updated);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id " + id));


        if (department.getUsers() != null) {
            for (User user : department.getUsers()) {
                user.setDepartment(null);
            }
        }

        departmentRepository.delete(department);
    }

    private DepartmentResponseDTO mapToDTO(Department dept) {
        int count = dept.getUsers() != null ? dept.getUsers().size() : 0;
        String head = dept.getHeadName() != null && !dept.getHeadName().trim().isEmpty()
                ? dept.getHeadName() : "Unassigned";

        return DepartmentResponseDTO.builder()
                .id(dept.getId())
                .name(dept.getName())
                .membersCount(count)
                .headName(head)
                .build();
    }
}