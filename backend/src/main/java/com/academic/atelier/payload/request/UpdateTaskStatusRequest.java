package com.academic.atelier.payload.request;

import com.academic.atelier.model.ETaskStatus;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {
    private ETaskStatus status;
    private String submissionUrl;
}
