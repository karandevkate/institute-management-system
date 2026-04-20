package com.academic.atelier.service;

import com.academic.atelier.exception.AppException;
import com.academic.atelier.exception.ResourceNotFoundException;
import com.academic.atelier.model.*;
import com.academic.atelier.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentTaskRepository studentTaskRepository;

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    MaterialRepository materialRepository;

    private User getVerifiedStudent(String username) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        if (student.getRole() == ERole.ROLE_STUDENT && !student.isVerified()) {
            throw new AppException("Your account is pending verification by an administrator.");
        }
        return student;
    }

    @Override
    public List<StudentTask> getMyTasks(String username) {
        User student = getVerifiedStudent(username);
        return studentTaskRepository.findByStudent(student);
    }

    @Override
    public StudentTask updateTaskStatus(Long studentTaskId, ETaskStatus status, String submissionUrl) {
        StudentTask studentTask = studentTaskRepository.findById(studentTaskId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentTask", "id", studentTaskId));
        
        studentTask.setStatus(status);
        if (submissionUrl != null && !submissionUrl.isEmpty()) {
            studentTask.setSubmissionUrl(submissionUrl);
            studentTask.setSubmissionDate(LocalDateTime.now());
        }
        return studentTaskRepository.save(studentTask);
    }

    @Override
    public List<Material> getMyMaterials(String username) {
        User student = getVerifiedStudent(username);
        
        List<Batch> myBatches = batchRepository.findAll().stream()
                .filter(b -> b.getStudents().contains(student))
                .collect(Collectors.toList());

        return myBatches.stream()
                .flatMap(b -> materialRepository.findByBatch(b).stream())
                .collect(Collectors.toList());
    }
}
