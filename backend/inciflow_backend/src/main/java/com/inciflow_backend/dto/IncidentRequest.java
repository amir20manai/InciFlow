package com.inciflow_backend.dto;

import com.inciflow_backend.enums.IncidentPriority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class IncidentRequest {
    private String title;
    private String description;
    private String priority;
    private String department;
    private String category;
    private MultipartFile image; // <--- لازم يكون موجود باش يقبل التصورة

    // Getters and Setters
}