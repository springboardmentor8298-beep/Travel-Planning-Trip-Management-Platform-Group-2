package com.tripnest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class GroupRequest {

    @NotBlank(message = "Group name is required")
    @Size(min = 2, max = 150)
    private String name;

    @Size(max = 500)
    private String description;

    public GroupRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
