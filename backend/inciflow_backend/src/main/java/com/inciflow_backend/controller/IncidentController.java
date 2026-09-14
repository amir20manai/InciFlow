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

@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    // 1. إنشاء حادثة جديدة (تدعم الـ FormData وإرسال الصور والبيانات مع بعضها)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentResponse> createIncident(
            @ModelAttribute IncidentRequest request,
            Principal principal
    ) {
        String userEmail = principal != null ? principal.getName() : "employee@test.com";
        IncidentResponse response = incidentService.createIncident(userEmail, request);
        return ResponseEntity.ok(response);
    }

    // 2. جلب كل الحوادث
    @GetMapping
    public ResponseEntity<List<IncidentResponse>> getAllIncidents() {
        List<IncidentResponse> incidents = incidentService.getAllIncidents();
        return ResponseEntity.ok(incidents);
    }

    // 3. جلب حوادث اليوزر الحالي
    @GetMapping("/my-incidents")
    public ResponseEntity<List<IncidentResponse>> getMyIncidents(Principal principal) {
        String userEmail = principal != null ? principal.getName() : "employee@test.com";
        List<IncidentResponse> incidents = incidentService.getIncidentsByEmployee(userEmail);
        return ResponseEntity.ok(incidents);
    }

    // 4. جلب الحوادث حسب الحالة (NOUVEAU, EN_COURS, RESOLU)
    @GetMapping("/status/{status}")
    public ResponseEntity<List<IncidentResponse>> getIncidentsByStatus(@PathVariable IncidentStatus status) {
        List<IncidentResponse> incidents = incidentService.getIncidentsByStatus(status);
        return ResponseEntity.ok(incidents);
    }

    // 5. جلب تفاصيل حادثة واحدة بالـ ID (المفقودة والتي تحل مشكلة الـ 403 و صفحة التفاصيل)
    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable Long id) {
        IncidentResponse incident = incidentService.getIncidentById(id);
        if (incident == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(incident);
    }

    // 6. تحديث حالة الحادثة مباشرة بالـ Enum
    @PatchMapping("/{id}/status-update")
    public ResponseEntity<IncidentResponse> updateStatusDirect(
            @PathVariable Long id,
            @RequestParam IncidentStatus status
    ) {
        return ResponseEntity.ok(incidentService.updateIncidentStatus(id, status));
    }

    // 7. إسناد فني للحادثة
    @PatchMapping("/{id}/assign")
    public ResponseEntity<IncidentResponse> assignTechnician(
            @PathVariable Long id,
            @RequestParam String technicianEmail
    ) {
        return ResponseEntity.ok(incidentService.assignTechnician(id, technicianEmail));
    }

    // 8. حذف حادثة
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable Long id) {
        incidentService.deleteIncident(id);
        return ResponseEntity.noContent().build();
    }

    // 9. جلب صورة المرفق (Attachment) الخاصة بالحادثة لكي تعرض بسلام في الـ Angular
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
}