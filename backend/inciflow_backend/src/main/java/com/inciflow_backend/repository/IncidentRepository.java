package com.inciflow_backend.repository;

import com.inciflow_backend.entity.Incident;
import com.inciflow_backend.entity.User;
import com.inciflow_backend.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // الدوال الزوز هذيما لازم يكونوا مكتوبين هكا بالظبط داخل الـ Interface:
    List<Incident> findByStatus(IncidentStatus status);

    List<Incident> findByEmployee(User employee);
}