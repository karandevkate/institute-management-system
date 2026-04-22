package com.academic.cpv.payload.request;

import com.academic.cpv.model.ETaskStatus;
import lombok.Data;

@Data
public class UpdateTaskStatusRequest {
    private ETaskStatus status;
    private String submissionUrl;
}
