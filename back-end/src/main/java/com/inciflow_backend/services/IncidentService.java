package com.inciflow_backend.services;

import com.inciflow_backend.dto.IncidentRequest;
import com.inciflow_backend.dto.IncidentResponse;
import com.inciflow_backend.entity.Incident;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.entity.Notification;
import com.inciflow_backend.enums.IncidentPriority;
import com.inciflow_backend.enums.IncidentStatus;
import com.inciflow_backend.repository.CategoryRepository;
import com.inciflow_backend.repository.DepartmentRepository;
import com.inciflow_backend.repository.IncidentRepository;
import com.inciflow_backend.repository.UserRepository;
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

    // Dossier de stockage des images uploadées
    private final String UPLOAD_DIR = "uploads/";

    // ============================================================
    // CRÉATION
    // ============================================================
    @Transactional
    public IncidentResponse createIncident(String userEmail, IncidentRequest request) {
        User employee = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Récupération du département et de la catégorie
        var department = request.getDepartment() != null ?
                departmentRepository.findByName(request.getDepartment()).orElse(null) : null;

        var category = request.getCategory() != null ?
                categoryRepository.findByName(request.getCategory()).orElse(null) : null;

        // Gestion de l'upload d'image
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

        // Construction de l'incident
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

        // Envoi de notification à tous les admins
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

        return mapToResponse(savedIncident);
    }

    // ============================================================
    // LECTURE
    // ============================================================
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

    public IncidentResponse getIncidentById(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Incident not found"));
        return mapToResponse(incident);
    }

    // ============================================================
    // SUPPRESSION
    // ============================================================
    public void deleteIncident(Long incidentId) {
        if (!incidentRepository.existsById(incidentId)) {
            throw new RuntimeException("Incident not found");
        }
        incidentRepository.deleteById(incidentId);
    }

    // ============================================================
    // MAPPER (entité -> DTO)
    // ============================================================
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
                .notes(incident.getNotes())
                .build();
    }

    // ============================================================
    // TECHNICIEN
    // ============================================================

    // Récupérer les incidents assignés au technicien connecté (via email du token)
    public List<IncidentResponse> getActiveIncidentsByTechnicianEmail(String email) {
        User technician = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + email));

        List<Incident> allIncidents = incidentRepository.findByTechnicianId(technician.getId());

        return allIncidents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Démarrer un incident (passer à EN_COURS) + notification
    @Transactional
    public IncidentResponse startIncident(Long incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setStatus(IncidentStatus.EN_COURS);
        Incident saved = incidentRepository.save(incident);

        String message = "L'incident (INC-" + incident.getId() + " - " + incident.getTitle() + ") est en cours de fixation.";
        sendNotificationToEmployeeAndAdmins(incident, message);

        return mapToResponse(saved);
    }

    // Terminer un incident (passer à RESOLU) + notification
    @Transactional
    public IncidentResponse completeIncident(Long incidentId, String notes) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        incident.setStatus(IncidentStatus.RESOLU);
        incident.setNotes(notes);
        Incident saved = incidentRepository.save(incident);

        String message = "L'incident (INC-" + incident.getId() + " - " + incident.getTitle() + ") est résolu.";
        sendNotificationToEmployeeAndAdmins(incident, message);

        return mapToResponse(saved);
    }

    // ============================================================
    // ADMIN : Accepter un incident + assigner un technicien
    // ============================================================
    @Transactional
    public IncidentResponse acceptIncidentWithTechnician(Long incidentId, Long technicianId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found"));

        User technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found"));

        // Changement de statut + affectation du technicien
        incident.setStatus(IncidentStatus.ACCEPTE);
        incident.setTechnician(technician);
        Incident saved = incidentRepository.save(incident);

        // Notification au technicien
        Notification notifTech = Notification.builder()
                .user(technician)
                .message("Vous êtes assigné à l'incident (INC-" + incident.getId() + " - " + incident.getTitle() + ").")
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(notifTech);

        // Notification à l'employé qui a signalé l'incident
        User employee = incident.getEmployee();
        if (employee != null) {
            Notification notifEmp = Notification.builder()
                    .user(employee)
                    .message("Votre incident (INC-" + incident.getId() + " - " + incident.getTitle() + ") a été accepté.")
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();
            notificationRepository.save(notifEmp);
        }

        return mapToResponse(saved);
    }

    // ============================================================
    // ADMIN : Rejeter un incident + notification
    // ============================================================
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

        Incident saved = incidentRepository.save(incident);

        // Notification à l'employé
        User employee = incident.getEmployee();
        if (employee != null) {
            Notification notifEmp = Notification.builder()
                    .user(employee)
                    .message("Votre incident (INC-" + incident.getId() + " - " + incident.getTitle() + ") a été rejeté.")
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();
            notificationRepository.save(notifEmp);
        }

        return mapToResponse(saved);
    }

    // ============================================================
    // HELPER : Envoyer une notification à l'employé + tous les admins
    // ============================================================
    private void sendNotificationToEmployeeAndAdmins(Incident incident, String message) {
        // Notification à l'employé
        User employee = incident.getEmployee();
        if (employee != null) {
            Notification notif = Notification.builder()
                    .user(employee)
                    .message(message)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();
            notificationRepository.save(notif);
        }

        // Notification à tous les admins
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().name().toUpperCase().contains("ADMIN"))
                .toList();

        for (User admin : admins) {
            Notification notif = Notification.builder()
                    .user(admin)
                    .message(message)
                    .createdAt(LocalDateTime.now())
                    .isRead(false)
                    .build();
            notificationRepository.save(notif);
        }
    }
}