package com.fitness.aiservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public GeminiService() {
        this.webClient = WebClient.builder().build();
    }

    public String getAnswer(String question) {
        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", question)
                        })
                }
        );

        String response = webClient.post()
                .uri(geminiApiUrl)
                .header("x-goog-api-key", geminiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return response;
    }
}
