package com.inciflow_backend.dto;

import com.inciflow_backend.enums.IncidentPriority;
import com.inciflow_backend.enums.IncidentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IncidentResponse {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private LocalDateTime createdAt;
    private IncidentStatus status;
    private IncidentPriority priority;
    private String departmentName;
    private String categoryName;
    private String employeeEmail;
    private String technicianEmail;
}