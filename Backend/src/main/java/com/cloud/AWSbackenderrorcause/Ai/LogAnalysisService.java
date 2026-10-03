package com.cloud.AWSbackenderrorcause.Ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class LogAnalysisService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.model:openai/gpt-4o-mini}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public GptAnalysisResult analyze(String service, List<String> errorLogs) {
        try {
            String logsText = String.join("\n", errorLogs);

            String prompt = """
                    You are an experienced Site Reliability Engineer analyzing cloud incident logs.
                    Write a short 1-2 sentence summary of the incident, identify the root cause,
                    build a chronological timeline, and suggest 2-3 fixes.
                    Reply ONLY in this exact JSON format, nothing else:
                    { "summary": "...", "rootCause": "...", "timeline": [{"time":"...","event":"..."}], "recommendations": ["...", "..."] }

                    Service: """ + service + """

                    Logs:
                    """ + logsText;

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of(
                                    "role", "user",
                                    "content", prompt
                            )
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // Production Vercel frontend URL
            headers.set(
                    "HTTP-Referer",
                    "https://ai-checkerrorcause-devops.vercel.app"
            );

            headers.set(
                    "X-Title",
                    "AI Root Cause Analyzer"
            );

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://openrouter.ai/api/v1/chat/completions",
                    new HttpEntity<>(requestBody, headers),
                    String.class
            );

            JsonNode root = mapper.readTree(response.getBody());

            JsonNode choices = root.path("choices");
            if (!choices.isArray() || choices.isEmpty()) {
                String providerMessage = root.path("error").path("message").asText();
                if (providerMessage.isBlank()) {
                    providerMessage = root.toString();
                }
                throw new IllegalStateException(
                        "OpenRouter response did not include choices: " + providerMessage
                );
            }

            JsonNode content = choices.path(0).path("message").path("content");
            if (content.isMissingNode() || content.isNull() || content.asText().isBlank()) {
                throw new IllegalStateException(
                        "OpenRouter returned a choice without message content: " + root
                );
            }

            String innerJsonText = content.asText();

            return mapper.readValue(
                    innerJsonText,
                    GptAnalysisResult.class
            );

        } catch (HttpStatusCodeException e) {
            throw new RuntimeException(
                    "OpenRouter returned HTTP " + e.getStatusCode().value()
                            + ": " + e.getResponseBodyAsString(),
                    e
            );
        } catch (Exception e) {
            throw new RuntimeException(
                    "AI log analysis failed: " + e.getMessage(),
                    e
            );
        }
    }
}
