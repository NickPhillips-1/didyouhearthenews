package com.newsrater.controller;

import com.newsrater.dto.CreateStoryRequest;
import com.newsrater.dto.StoryDto;
import com.newsrater.dto.StorySummaryDto;
import com.newsrater.service.StoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/stories")
@Tag(name = "Stories", description = "List stories and compare coverage across article URLs")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PostMapping
    @Operation(
            summary = "Compare a story",
            description = "Paste article URLs about the same event. Each source is fetched, labeled from the outlet catalog, and returned with Left, Center, and Right coverage."
    )
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = CreateStoryRequest.class),
                    examples = @ExampleObject(
                            name = "Same event, several sources",
                            value = """
                                    {
                                      "title": "City housing plan",
                                      "urls": [
                                        "https://example.com/article-one",
                                        "https://example.com/article-two"
                                      ]
                                    }
                                    """
                    )
            )
    )
    @ApiResponse(responseCode = "201", description = "Story created from the supplied URLs")
    @ApiResponse(responseCode = "400", description = "Missing URLs or a URL that could not be used", content = @Content)
    public ResponseEntity<StoryDto> create(@Valid @RequestBody CreateStoryRequest request) {
        try {
            StoryDto story = storyService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(story);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @GetMapping
    public List<StorySummaryDto> list() {
        return storyService.list();
    }

    @GetMapping("/{id}")
    public StoryDto get(@PathVariable Long id) {
        return storyService.get(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));
    }
}
