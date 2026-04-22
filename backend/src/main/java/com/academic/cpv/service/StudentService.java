package com.academic.cpv.service;

import com.academic.cpv.model.*;
import java.util.List;

public interface StudentService {
    List<StudentTask> getMyTasks(String username);
    StudentTask updateTaskStatus(Long studentTaskId, ETaskStatus status, String submissionUrl);
    List<Material> getMyMaterials(String username);
}
