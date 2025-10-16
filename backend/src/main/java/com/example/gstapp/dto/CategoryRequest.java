package com.example.gstapp.dto;

public class CategoryRequest {
    private String name;
    private String description;

    // Constructors
    public CategoryRequest() {}

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
