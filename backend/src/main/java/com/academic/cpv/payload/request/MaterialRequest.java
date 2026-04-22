package com.academic.cpv.payload.request;

import com.academic.cpv.model.EMaterialType;
import lombok.Data;

@Data
public class MaterialRequest {
    private String title;
    private String url;
    private EMaterialType type;
}
