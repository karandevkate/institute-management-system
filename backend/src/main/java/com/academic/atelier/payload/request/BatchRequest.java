package com.academic.atelier.payload.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BatchRequest {
    private String name;
    private Long courseId;
    private Long trainerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
