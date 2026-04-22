package com.academic.cpv.service;

import com.academic.cpv.model.*;
import java.util.List;

public interface TrainerService {
    List<Batch> getMyBatches(String username);
    List<Task> getBatchTasks(Long batchId);
    Material shareMaterial(Long batchId, Material material);
    Task createTask(Long batchId, Task task);
    List<StudentTask> getStudentProgress(Long taskId);
}
