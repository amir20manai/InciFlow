package com.inciflow_backend.services;

import com.inciflow_backend.entity.Intervention;
import com.inciflow_backend.repository.InterventionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InterventionService {

    private final InterventionRepository interventionRepository;

    public List<Intervention> getAllInterventions() {
        return interventionRepository.findAll();
    }

    public Intervention saveIntervention(Intervention intervention) {
        return interventionRepository.save(intervention);
    }

    public Optional<Intervention> getInterventionById(Long id) {
        return interventionRepository.findById(id);
    }

    public void deleteIntervention(Long id) {
        interventionRepository.deleteById(id);
    }
}