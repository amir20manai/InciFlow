package com.inciflow_backend.controller;

import com.inciflow_backend.dto.IncidentRequest;
import com.inciflow_backend.dto.IncidentResponse;
import com.inciflow_backend.enums.IncidentStatus;
import com.inciflow_backend.services.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class IncidentController {

    private final IncidentService incidentService;

    // ============================================================
    // CREATE
    // ============================================================
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentResponse> createIncident(
            @ModelAttribute IncidentRequest request,
            Principal principal
    ) {
        String userEmail = principal != null ? principal.getName() : "employee@test.com";
        IncidentResponse response = incidentService.createIncident(userEmail, request);
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // READ
    // ============================================================
    @GetMapping
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        List<IncidentResponse> incidents = incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/my-incidents")
    public ResponseEntity<List<IncidentResponse>> getMyIncidents(Principal principal) {
        String userEmail = principal != null ? principal.getName() : "employee@test.com";
        List<IncidentResponse> incidents = incidentService.getIncidentsByEmployee(userEmail);
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<IncidentResponse>> getIncidentsByStatus(@PathVariable IncidentStatus status) {
        List<IncidentResponse> incidents = incidentService.getIncidentsByStatus(status);
        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable Long id) {
        IncidentResponse incident = incidentService.getIncidentById(id);
        if (incident == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(incident);
    }

    // ============================================================
    // DELETE
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // ATTACHMENT (Image)
    // ============================================================
    @GetMapping("/{id}/attachment")
    public ResponseEntity<Resource> getAttachment(@PathVariable Long id) {
        try {
            IncidentResponse incident = incidentService.getIncidentById(id);
            if (incident == null || incident.getImageUrl() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get("uploads").resolve(incident.getImageUrl()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ============================================================
    // TECHNICIEN ENDPOINTS
    // ============================================================

    // Get active incidents by technician EMAIL (via token)
    @GetMapping("/my-technician-incidents")
    public ResponseEntity<List<IncidentResponse>> getMyTechnicianIncidents(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String userEmail = principal.getName();
        List<IncidentResponse> incidents = incidentService.getActiveIncidentsByTechnicianEmail(userEmail);
        return ResponseEntity.ok(incidents);
    }

    // Start incident (EN_COURS)
    @PutMapping("/{id}/start")
    public ResponseEntity<?> startIncident(@PathVariable Long id) {
        try {
            IncidentResponse updated = incidentService.startIncident(id);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Complete incident (RESOLU + Report notes)
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> completeIncident(@PathVariable Long id, @RequestBody Map<String, String> requestBody) {
        try {
            String reportNotes = requestBody.get("report");
            IncidentResponse updated = incidentService.completeIncident(id, reportNotes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // ADMIN: Accepter incident + Assigner technicien
    // ============================================================
    @PostMapping("/{id}/accept")
    public ResponseEntity<?> acceptIncident(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        try {
            Long technicianId = null;
            if (payload != null && payload.get("technicianId") != null) {
                Object techObj = payload.get("technicianId");
                if (techObj != null && !techObj.toString().equalsIgnoreCase("null")) {
                    technicianId = Long.valueOf(techObj.toString());
                }
            }

            if (technicianId == null) {
                return ResponseEntity.badRequest().body("technicianId requis");
            }

            IncidentResponse response = incidentService.acceptIncidentWithTechnician(id, technicianId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // ADMIN: Rejeter incident
    // ============================================================
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectIncident(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload
    ) {
        try {
            Long technicianId = null;
            if (payload != null && payload.get("technicianId") != null) {
                Object techObj = payload.get("technicianId");
                if (techObj != null && !techObj.toString().equalsIgnoreCase("null")) {
                    technicianId = Long.valueOf(techObj.toString());
                }
            }

            IncidentResponse response = incidentService.rejectIncidentWithNotification(id, technicianId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}