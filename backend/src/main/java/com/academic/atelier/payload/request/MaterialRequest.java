package com.academic.atelier.payload.request;

import com.academic.atelier.model.EMaterialType;
import lombok.Data;

@Data
public class MaterialRequest {
    private String title;
    private String url;
    private EMaterialType type;
}
