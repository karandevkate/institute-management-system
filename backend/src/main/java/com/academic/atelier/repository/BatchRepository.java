package com.academic.atelier.repository;

import com.academic.atelier.model.Batch;
import com.academic.atelier.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByTrainer(User trainer);
}
