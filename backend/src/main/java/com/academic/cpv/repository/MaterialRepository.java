package com.academic.cpv.repository;

import com.academic.cpv.model.Material;
import com.academic.cpv.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByBatch(Batch batch);
}
