package com.academic.atelier.service;

import com.academic.atelier.model.Batch;
import com.academic.atelier.model.Course;
import com.academic.atelier.model.User;
import com.academic.atelier.payload.response.BatchDto;
import com.academic.atelier.payload.response.CourseDto;

import java.util.List;

public interface AdminService {
    // Student Management
    User updateVerificationStatus(Long studentId, boolean status);

    List<User> getAllStudents();

    List<User> getPendingStudents();

    // Trainer Management
    User createTrainer(User trainer);

    List<User> getAllTrainers();

    // Course & Batch Management
    Course createCourse(Course course);

    List<CourseDto> getAllCourses();

    List<BatchDto> getAllBatches();

    Batch createBatch(Batch batch, Long courseId, Long trainerId);

    Batch addStudentToBatch(Long batchId, Long studentId);
}
