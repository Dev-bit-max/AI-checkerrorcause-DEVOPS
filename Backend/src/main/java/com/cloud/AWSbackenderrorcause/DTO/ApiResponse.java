package com.cloud.AWSbackenderrorcause.DTO;

import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ApiResponse<T> {

    //<T> used here as it is generic placeholder without it any other variable can cause manually changing many things
    private boolean success;
    private String message;
    private T data;
    private LocalDateTime timestamp;
    // Private constructor — force usage through the static methods below
    private ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.timestamp = LocalDateTime.now();
    }

    // Use this when everything worked
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    // Use this when something failed
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
