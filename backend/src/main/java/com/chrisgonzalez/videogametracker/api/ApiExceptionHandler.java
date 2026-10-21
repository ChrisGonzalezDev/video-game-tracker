package com.chrisgonzalez.videogametracker.api;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiError> handleInvalidRequest(InvalidRequestException exception) {
        return ResponseEntity.badRequest().body(new ApiError(
                "INVALID_REQUEST",
                "Request contains invalid values.",
                List.of(new ApiError.ApiErrorDetail(exception.field(), exception.getMessage()))));
    }

    @ExceptionHandler(GameNotFoundException.class)
    public ResponseEntity<ApiError> handleGameNotFound(GameNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiError(
                "GAME_NOT_FOUND",
                exception.getMessage(),
                List.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpectedException(Exception exception) {
        LOGGER.error("Unexpected error while processing API request", exception);
        return ResponseEntity.internalServerError().body(new ApiError(
                "INTERNAL_SERVER_ERROR",
                "An unexpected error occurred.",
                List.of()));
    }
}
