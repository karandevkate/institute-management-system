package com.academic.cpv.repository;

import com.academic.cpv.model.StudentTask;
import com.academic.cpv.model.User;
import com.academic.cpv.model.Task;
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
