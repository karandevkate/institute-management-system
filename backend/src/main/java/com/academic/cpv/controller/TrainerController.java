package com.academic.cpv.controller;

import com.academic.cpv.model.*;
import com.academic.cpv.payload.request.MaterialRequest;
import com.academic.cpv.payload.request.TaskRequest;
import com.academic.cpv.service.TrainerService;
import com.academic.cpv.payload.response.BatchDto;
import com.academic.cpv.util.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trainer")
@PreAuthorize("hasRole('TRAINER') or hasRole('ADMIN')")
public class TrainerController {

    @Autowired
    TrainerService trainerService;

    @GetMapping("/my-batches")
    public ResponseEntity<List<BatchDto>> getMyBatches() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(trainerService.getMyBatches(username).stream()
                .map(DtoMapper::toBatchDto)
                .collect(Collectors.toList()));
    }

    @GetMapping("/batches/{batchId}/tasks")
    public ResponseEntity<List<Task>> getBatchTasks(@PathVariable Long batchId) {
        return ResponseEntity.ok(trainerService.getBatchTasks(batchId));
    }

    @PostMapping("/batches/{batchId}/materials")
    public ResponseEntity<Material> shareMaterial(@PathVariable Long batchId, @RequestBody MaterialRequest materialRequest) {
        Material material = Material.builder()
                .title(materialRequest.getTitle())
                .url(materialRequest.getUrl())
                .type(materialRequest.getType())
                .build();
        return ResponseEntity.ok(trainerService.shareMaterial(batchId, material));
    }

    @PostMapping("/batches/{batchId}/tasks")
    public ResponseEntity<Task> createTask(@PathVariable Long batchId, @RequestBody TaskRequest taskRequest) {
        Task task = Task.builder()
                .title(taskRequest.getTitle())
                .description(taskRequest.getDescription())
                .deadline(taskRequest.getDeadline())
                .build();
        return ResponseEntity.ok(trainerService.createTask(batchId, task));
    }

    @GetMapping("/tasks/{taskId}/progress")
    public ResponseEntity<List<StudentTask>> getStudentProgress(@PathVariable Long taskId) {
        return ResponseEntity.ok(trainerService.getStudentProgress(taskId));
    }
}
