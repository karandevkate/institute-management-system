package com.academic.atelier.repository;

import com.academic.atelier.model.StudentTask;
import com.academic.atelier.model.User;
import com.academic.atelier.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentTaskRepository extends JpaRepository<StudentTask, Long> {
    List<StudentTask> findByStudent(User student);
    List<StudentTask> findByTask(Task task);
    Optional<StudentTask> findByStudentAndTask(User student, Task task);
}
