package com.inciflow_backend.services;

import com.inciflow_backend.dto.IncidentRequest;
import com.inciflow_backend.dto.IncidentResponse;
import com.inciflow_backend.entity.Incident;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.entity.Notification;
import com.inciflow_backend.entity.Intervention;
import com.inciflow_backend.enums.IncidentPriority;
import com.inciflow_backend.enums.IncidentStatus;
import com.inciflow_backend.repository.CategoryRepository;
import com.inciflow_backend.repository.DepartmentRepository;
import com.inciflow_backend.repository.IncidentRepository;
import com.inciflow_backend.repository.UserRepository;
import com.inciflow_backend.repository.InterventionRepository;
import com.inciflow_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

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
    private final NotificationRepository notificationRepository;
    private final InterventionRepository interventionRepository;

    private final String UPLOAD_DIR = "uploads/";

    @Transactional
    public IncidentResponse createIncident(String userEmail, IncidentRequest request) {
        User employee = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        var department = request.getDepartment() != null ?
                departmentRepository.findByName(request.getDepartment()).orElse(null) : null;

        var category = request.getCategory() != null ?
                categoryRepository.findByName(request.getCategory()).orElse(null) : null;

        String imageUrl = null;
        MultipartFile imageFile = request.getImage();

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

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

        // --- ZIEDET EL NOTIFICATION LEL ADMIN (Msa77aha b .contains("ADMIN")) ---
        String notifMessage = String.format("(INC-%d) %s a été signalé", savedIncident.getId(), savedIncident.getTitle());

        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().toUpperCase().contains("ADMIN"))
                .toList();

        for (User admin : admins) {
            Notification notification = Notification.builder()
                    .user(admin)
                    .message(notifMessage)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();
            notificationRepository.save(notification);
        }
        // ---------------------------------------------------------------------

        return mapToResponse(savedIncident);
    }

    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> getIncidentsByEmployee(String email) {
        User employee = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return incidentRepository.findByEmployee(employee).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> getIncidentsByStatus(IncidentStatus status) {
        return incidentRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public IncidentResponse updateIncidentStatus(Long incidentId, IncidentStatus newStatus) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setStatus(newStatus);
        Incident updatedIncident = incidentRepository.save(incident);

        return mapToResponse(updatedIncident);
    }

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

    public void deleteIncident(Long incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new RuntimeException("Incident not found");
        }
        incidentRepository.deleteById(incidentId);
    }

    public IncidentResponse getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        return mapToResponse(incident);
    }

    private IncidentResponse mapToResponse(Incident incident) {
        String empEmail = null;
        if (incident.getEmployee() != null) {
            empEmail = incident.getEmployee().getEmail();
        }

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
                .employeeEmail(empEmail)
                .technicianEmail(incident.getTechnician() != null ? incident.getTechnician().getEmail() : null)
                .build();
    }

    @Transactional
    public IncidentResponse acceptIncidentWithIntervention(Long incidentId, Long technicianId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        incident.setStatus(IncidentStatus.EN_COURS);
        incident.setTechnician(technician);
        Incident savedIncident = incidentRepository.save(incident);

        User targetUser = incident.getEmployee();
        if (targetUser != null) {
            Notification notification = new Notification();
            notification.setUser(targetUser);
            notification.setMessage("Votre incident (INC-" + incident.getId() + ") a été accepté.");
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);
        }

        Intervention intervention = new Intervention();
        intervention.setIncident(savedIncident);
        intervention.setTechnician(technician);
        intervention.setInterventionDate(LocalDateTime.now());
        intervention.setStatus(IncidentStatus.EN_COURS);
        interventionRepository.save(intervention);

        return mapToResponse(savedIncident);
    }

    @Transactional
    public IncidentResponse rejectIncidentWithNotification(Long incidentId, Long technicianId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setStatus(IncidentStatus.REJETE);

        if (technicianId != null) {
            User technician = userRepository.findById(technicianId)
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
            incident.setTechnician(technician);
        }

        Incident savedIncident = incidentRepository.save(incident);

        User targetUser = incident.getEmployee();
        if (targetUser != null) {
            Notification notification = new Notification();
            notification.setUser(targetUser);
            notification.setMessage("Votre incident (INC-" + incident.getId() + ") a été rejeté.");
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notificationRepository.save(notification);
        }

        return mapToResponse(savedIncident);
    }
}