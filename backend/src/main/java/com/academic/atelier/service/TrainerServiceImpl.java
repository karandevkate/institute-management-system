package com.academic.atelier.service;

import com.academic.atelier.exception.ResourceNotFoundException;
import com.academic.atelier.model.*;
import com.academic.atelier.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class TrainerServiceImpl implements TrainerService {

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    MaterialRepository materialRepository;

    @Autowired
    TaskRepository taskRepository;

    @Autowired
    StudentTaskRepository studentTaskRepository;

    @Override
    public List<Batch> getMyBatches(String username) {
        User trainer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", "username", username));
        return batchRepository.findByTrainer(trainer);
    }

    @Override
    public List<Task> getBatchTasks(Long batchId) {
        batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", batchId));

        return taskRepository.findByBatchId(batchId);
    }

    @Override
    @Transactional
    public Material shareMaterial(Long batchId, Material material) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", batchId));
        material.setBatch(batch);
        return materialRepository.save(material);
    }

    @Override
    @Transactional
    public Task createTask(Long batchId, Task task) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", batchId));
        task.setBatch(batch);
        Task savedTask = taskRepository.save(task);

        for (User student : batch.getStudents()) {
            StudentTask studentTask = StudentTask.builder()
                    .student(student)
                    .task(savedTask)
                    .status(ETaskStatus.PENDING)
                    .build();
            studentTaskRepository.save(studentTask);
        }

        return savedTask;
    }

    @Override
    public List<StudentTask> getStudentProgress(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        return studentTaskRepository.findByTask(task);
    }
}
