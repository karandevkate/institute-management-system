package com.academic.atelier.payload.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskRequest {
    private String title;
    private String description;
    private LocalDateTime deadline;
}
