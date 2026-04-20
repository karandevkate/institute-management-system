package com.academic.atelier.controller;

import com.academic.atelier.model.Material;
import com.academic.atelier.model.StudentTask;
import com.academic.atelier.payload.request.UpdateTaskStatusRequest;
import com.academic.atelier.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT') or hasRole('TRAINER') or hasRole('ADMIN')")
public class StudentController {

    @Autowired
    StudentService studentService;

    @GetMapping("/my-tasks")
    public ResponseEntity<List<StudentTask>> getMyTasks() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(studentService.getMyTasks(username));
    }

    @PostMapping("/tasks/{studentTaskId}/status")
    public ResponseEntity<StudentTask> updateTaskStatus(@PathVariable Long studentTaskId, @RequestBody UpdateTaskStatusRequest request) {
        return ResponseEntity.ok(studentService.updateTaskStatus(studentTaskId, request.getStatus(), request.getSubmissionUrl()));
    }

    @GetMapping("/my-materials")
    public ResponseEntity<List<Material>> getMyMaterials() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(studentService.getMyMaterials(username));
    }
}
