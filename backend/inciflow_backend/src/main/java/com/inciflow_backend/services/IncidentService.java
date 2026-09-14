package com.inciflow_backend.services;

import com.inciflow_backend.dto.IncidentRequest;
import com.inciflow_backend.dto.IncidentResponse;
import com.inciflow_backend.entity.Incident;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.enums.IncidentPriority;
import com.inciflow_backend.enums.IncidentStatus;
import com.inciflow_backend.repository.CategoryRepository;
import com.inciflow_backend.repository.DepartmentRepository;
import com.inciflow_backend.repository.IncidentRepository;
import com.inciflow_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;

    // مسار حفظ التصاور في السيرفر
    private final String UPLOAD_DIR = "uploads/";

    // 1. إنشاء حادثة جديدة مع معالجة الصورة المرفقة
    public IncidentResponse createIncident(String userEmail, IncidentRequest request) {
        User employee = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        var department = request.getDepartment() != null ?
                departmentRepository.findByName(request.getDepartment()).orElse(null) : null;

        var category = request.getCategory() != null ?
                categoryRepository.findByName(request.getCategory()).orElse(null) : null;

        String imageUrl = null;
        MultipartFile imageFile = request.getImage();

        // معالجة وحفظ التصورة على السيرفر إذا كانت موجودة
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // 🛠️ التعديل هنا: تنظيف اسم الملف من المسافات والرموز الخاصة لتجنب الأخطاء
                String originalFilename = imageFile.getOriginalFilename();
                String cleanFileName = originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_") : "file";
                String fileName = System.currentTimeMillis() + "_" + cleanFileName;

                Path filePath = uploadPath.resolve(fileName);
                Files.copy(imageFile.getInputStream(), filePath);

                imageUrl = fileName;
            } catch (IOException e) {
                throw new RuntimeException("Erreur lors de la sauvegarde de l'image", e);
            }
        }

        Incident incident = Incident.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .imageUrl(imageUrl)
                .priority(request.getPriority() != null ? IncidentPriority.valueOf(request.getPriority().toUpperCase()) : IncidentPriority.MOYENNE)
                .status(IncidentStatus.NOUVEAU)
                .createdAt(LocalDateTime.now())
                .employee(employee)
                .department(department)
                .category(category)
                .build();

        Incident savedIncident = incidentRepository.save(incident);
        return mapToResponse(savedIncident);
    }

    // 2. جلب كل الحوادث
    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 3. جلب حوادث موظف معين
    public List<IncidentResponse> getIncidentsByEmployee(String email) {
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return incidentRepository.findByEmployee(employee).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 4. جلب الحوادث حسب الحالة
    public List<IncidentResponse> getIncidentsByStatus(IncidentStatus status) {
        return incidentRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // 5. تغيير حالة الحادثة
    public IncidentResponse updateIncidentStatus(Long incidentId, IncidentStatus newStatus) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setStatus(newStatus);
        Incident updatedIncident = incidentRepository.save(incident);

        return mapToResponse(updatedIncident);
    }

    // 6. إسناد فني للحادثة
    public IncidentResponse assignTechnician(Long incidentId, String technicianEmail) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        User technician = userRepository.findByEmail(technicianEmail)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        incident.setTechnician(technician);
        incident.setStatus(IncidentStatus.EN_COURS);

        Incident updatedIncident = incidentRepository.save(incident);

        return mapToResponse(updatedIncident);
    }

    // 7. حذف حادثة
    public void deleteIncident(Long incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new RuntimeException("Incident not found");
        }
        incidentRepository.deleteById(incidentId);
    }

    // 8. جلب حادثة واحدة بالـ ID
    public IncidentResponse getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        return mapToResponse(incident);
    }

    // دالة التحويل من Entity إلى Response DTO
    private IncidentResponse mapToResponse(Incident incident) {
        return IncidentResponse.builder()
                .id(incident.getId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .imageUrl(incident.getImageUrl())
                .createdAt(incident.getCreatedAt())
                .status(incident.getStatus())
                .priority(incident.getPriority())
                .departmentName(incident.getDepartment() != null ? incident.getDepartment().getName() : null)
                .categoryName(incident.getCategory() != null ? incident.getCategory().getName() : null)
                .employeeEmail(incident.getEmployee() != null ? incident.getEmployee().getEmail() : null)
                .technicianEmail(incident.getTechnician() != null ? incident.getTechnician().getEmail() : null)
                .build();
    }
}