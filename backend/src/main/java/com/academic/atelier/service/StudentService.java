package com.academic.atelier.service;

import com.academic.atelier.model.*;
import java.util.List;

public interface StudentService {
    List<StudentTask> getMyTasks(String username);
    StudentTask updateTaskStatus(Long studentTaskId, ETaskStatus status, String submissionUrl);
    List<Material> getMyMaterials(String username);
}
