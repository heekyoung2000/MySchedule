package com.myschedule.dto;

import jakarta.validation.constraints.NotNull;

public record CompletionRequest(@NotNull Boolean completed) {
}
