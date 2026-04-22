package com.academic.cpv.controller;

import com.academic.cpv.model.Batch;
import com.academic.cpv.model.Course;
import com.academic.cpv.model.User;
import com.academic.cpv.payload.request.BatchRequest;
import com.academic.cpv.payload.request.SignupRequest;
import com.academic.cpv.payload.response.MessageResponse;
import com.academic.cpv.payload.response.CourseDto;
import com.academic.cpv.payload.response.BatchDto;
import com.academic.cpv.service.AdminService;
import com.academic.cpv.util.DtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    AdminService adminService;

    // --- Student Management ---

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/pending-students")
    public ResponseEntity<List<User>> getPendingStudents() {
        return ResponseEntity.ok(adminService.getPendingStudents());
    }

    @PostMapping("/verify-student/{id}")
    public ResponseEntity<?> verifyStudent(@PathVariable Long id) {
        adminService.updateVerificationStatus(id, true);
        return ResponseEntity.ok(new MessageResponse("Student verified successfully!"));
    }

    @PostMapping("/revoke-student/{id}")
    public ResponseEntity<?> revokeStudent(@PathVariable Long id) {
        adminService.updateVerificationStatus(id, false);
        return ResponseEntity.ok(new MessageResponse("Student access revoked."));
    }

    // --- Trainer Management ---

    @PostMapping("/trainers")
    public ResponseEntity<User> createTrainer(@RequestBody SignupRequest request) {
        User trainer = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword())
                .build();
        return ResponseEntity.ok(adminService.createTrainer(trainer));
    }

    @GetMapping("/trainers")
    public ResponseEntity<List<User>> getAllTrainers() {
        return ResponseEntity.ok(adminService.getAllTrainers());
    }

    // --- Course & Batch Management ---

    @PostMapping("/courses")
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(adminService.createCourse(course));
    }

    @GetMapping("/courses")
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        return ResponseEntity.ok(adminService.getAllCourses());
    }

    @GetMapping("/batches")
    public ResponseEntity<List<BatchDto>> getAllBatches() {
        return ResponseEntity.ok(adminService.getAllBatches());
    }

    @PostMapping("/batches")
    public ResponseEntity<Batch> createBatch(@RequestBody BatchRequest batchRequest) {
        Batch batch = Batch.builder()
                .name(batchRequest.getName())
                .startTime(batchRequest.getStartTime())
                .endTime(batchRequest.getEndTime())
                .build();
        return ResponseEntity
                .ok(adminService.createBatch(batch, batchRequest.getCourseId(), batchRequest.getTrainerId()));
    }

    @PostMapping("/batches/{batchId}/students/{studentId}")
    public ResponseEntity<Batch> addStudentToBatch(@PathVariable Long batchId, @PathVariable Long studentId) {
        return ResponseEntity.ok(adminService.addStudentToBatch(batchId, studentId));
    }
}
