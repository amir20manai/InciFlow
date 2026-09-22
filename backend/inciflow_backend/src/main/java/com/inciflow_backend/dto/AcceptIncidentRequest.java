package com.inciflow_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AcceptIncidentRequest {

    @JsonProperty("technicianId")
    private Long technicianId;

    public Long getTechnicianId() {
        return technicianId;
    }

    public void setTechnicianId(Long technicianId) {
        this.technicianId = technicianId;
    }
}