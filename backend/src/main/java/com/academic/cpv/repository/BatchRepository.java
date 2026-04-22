package com.academic.cpv.repository;

import com.academic.cpv.model.Batch;
import com.academic.cpv.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByTrainer(User trainer);
}
