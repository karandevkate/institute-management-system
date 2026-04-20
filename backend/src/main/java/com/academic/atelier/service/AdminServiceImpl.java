package com.academic.atelier.service;

import com.academic.atelier.exception.AppException;
import com.academic.atelier.exception.ResourceNotFoundException;
import com.academic.atelier.model.*;
import com.academic.atelier.payload.response.BatchDto;
import com.academic.atelier.payload.response.CourseDto;
import com.academic.atelier.payload.response.UserDto;
import com.academic.atelier.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminServiceImpl.class);

    @Autowired
    UserRepository userRepository;

    @Autowired
    CourseRepository courseRepository;

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    EmailService emailService;

    @Override
    public User updateVerificationStatus(Long userId, boolean status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setApproved(status);
        user.setVerified(status); // keeping verified in sync for now if used elsewhere
        if (status) {
            user.setTrialExpired(false);
            emailService.sendAccessGrantedEmail(user.getEmail());
        }
        return userRepository.save(user);
    }

    @Override
    public List<User> getAllStudents() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == ERole.ROLE_STUDENT)
                .collect(Collectors.toList());
    }

    @Override
    public List<User> getPendingStudents() {
        return userRepository.findAll().stream()
                .filter(u -> (u.getRole() == ERole.ROLE_STUDENT || u.getRole() == ERole.ROLE_TRAINER) && !u.isApproved())
                .collect(Collectors.toList());
    }

    @Override
    public User createTrainer(User trainer) {
        if (userRepository.existsByUsername(trainer.getUsername())) {
            throw new AppException("Username is already taken!");
        }
        if (userRepository.existsByEmail(trainer.getEmail())) {
            throw new AppException("Email is already in use!");
        }

        String rawPassword = trainer.getPassword();
        trainer.setPassword(passwordEncoder.encode(rawPassword));
        trainer.setRole(ERole.ROLE_TRAINER);
        trainer.setVerified(true);
        trainer.setApproved(true); // Admin created trainers are approved by default
        trainer.setTrialStartDate(java.time.LocalDateTime.now());

        // Let's just use trainer.
        User actuallySavedTrainer = userRepository.save(trainer);

        // Sending Email with credentials
        emailService.sendEmail(actuallySavedTrainer.getEmail(), "Welcome to Academic Atelier",
                "Your trainer account has been created.\nUsername: " + actuallySavedTrainer.getUsername() + 
                "\nPassword: " + rawPassword);

        return actuallySavedTrainer;
    }

    @Override
    public List<User> getAllTrainers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == ERole.ROLE_TRAINER)
                .collect(Collectors.toList());
    }

    @Override
    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    @Override
    public List<CourseDto> getAllCourses() {
        List<Course> courses = courseRepository.findAll();

        return courses.stream().map(course -> CourseDto.builder()
                .id(course.getId())
                .name(course.getName())
                .duration(course.getDuration())
                .description(course.getDescription())
                .build()).toList();
    }

    @Override
    public List<BatchDto> getAllBatches() {
        return batchRepository.findAll()
                .stream()
                .map(this::mapToBatchDto)
                .toList();
    }

    private BatchDto mapToBatchDto(Batch batch) {
        return BatchDto.builder()
                .id(batch.getId())
                .name(batch.getName())
                .startTime(batch.getStartTime())
                .endTime(batch.getEndTime())
                .course(mapToCourseDto(batch.getCourse()))
                .trainer(mapToUserDto(batch.getTrainer()))
                .students(batch.getStudents()
                        .stream()
                        .map(this::mapToUserDto)
                        .collect(Collectors.toSet()))
                .build();
    }

    private CourseDto mapToCourseDto(Course course) {
        if (course == null)
            return null;

        return CourseDto.builder()
                .id(course.getId())
                .name(course.getName())
                .duration(course.getDuration())
                .description(course.getDescription())
                .build();
    }

    private UserDto mapToUserDto(User user) {
        if (user == null)
            return null;

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    @Override
    @Transactional
    public Batch createBatch(Batch batch, Long courseId, Long trainerId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainer", "id", trainerId));

        if (trainer.getRole() != ERole.ROLE_TRAINER) {
            throw new AppException("Assigned user must have the TRAINER role.");
        }

        if (batch.getStartTime() == null || batch.getEndTime() == null) {
            throw new AppException("Batch start time and end time are required.");
        }

        if (!batch.getEndTime().isAfter(batch.getStartTime())) {
            throw new AppException("Batch end time must be after the start time.");
        }

        batch.setCourse(course);
        batch.setTrainer(trainer);
        return batchRepository.save(batch);
    }

    @Override
    @Transactional
    public Batch addStudentToBatch(Long batchId, Long studentId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch", "id", batchId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", studentId));

        if (student.getRole() != ERole.ROLE_STUDENT || !student.isVerified()) {
            throw new AppException("Only verified students can be added to a batch.");
        }

        batch.getStudents().add(student);
        return batchRepository.save(batch);
    }
}
