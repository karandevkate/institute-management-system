package com.academic.cpv.repository;

import com.academic.cpv.model.Task;
import com.academic.cpv.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByBatchId(Long batchId);
}
