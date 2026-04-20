package com.academic.atelier.repository;

import com.academic.atelier.model.Material;
import com.academic.atelier.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByBatch(Batch batch);
}
