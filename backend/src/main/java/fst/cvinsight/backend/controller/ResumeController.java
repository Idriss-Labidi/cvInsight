package fst.cvinsight.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import fst.cvinsight.backend.dto.ResumeDto;
import fst.cvinsight.backend.entity.Resume;
import fst.cvinsight.backend.exception.ResumeProcessingException;
import fst.cvinsight.backend.model.CareerRecommendationRequest;
import fst.cvinsight.backend.service.ResumeService;
import fst.cvinsight.backend.util.DocumentUtils;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@AllArgsConstructor
@RequestMapping("/resume")
public class ResumeController {

    private final DocumentUtils documentUtils;
    private final ResumeService resumeService;

    @PostMapping(value = "/extract", consumes = {"multipart/form-data"})
    public ResponseEntity<?> extractText(@RequestPart("file") MultipartFile file) {

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            File tempFile = File.createTempFile("uploaded-" + file.getName() + "-", extension);
            file.transferTo(tempFile);

            String extractedText = documentUtils.extractText(tempFile);

            tempFile.delete();
            return ResponseEntity.ok(extractedText);

        } catch (IOException e) {
            return ResponseEntity
                    .status(422) // Unprocessable Entity
                    .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(new ErrorResponse("Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/upload-and-process", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadResume(@RequestPart("file") MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            File tempFile = File.createTempFile("uploaded-" + file.getName() + "-", extension);
            file.transferTo(tempFile);

            String jsonResponse = resumeService.extractAndParseResume(tempFile);
            tempFile.delete();

            return ResponseEntity.ok(jsonResponse);
        } catch (ResumeProcessingException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "File upload error", "details", e.getMessage()));
        }
    }

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<?> uploadResume(
            @RequestPart("file") MultipartFile file,
            @RequestPart("jsonContent") JsonNode jsonContent) {
        try{
            String originalFilename = file.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            File tempFile = File.createTempFile("uploaded-" + file.getName() + "-", extension);
            file.transferTo(tempFile);

            resumeService.saveResume(tempFile,jsonContent.asText(), null);

            tempFile.delete();
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(@PathVariable UUID id) {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ResumeDto>> getAllResumesForUser() {
        return ResponseEntity.ok(resumeService.getAllCVsForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDto> getResumeById(@PathVariable UUID id) {
        return ResponseEntity.ok(resumeService.getResumeDtoById(id));
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<JsonNode> analyze(@PathVariable UUID id) {
        return ResponseEntity.ok(resumeService.analyzeResume(id));
    }

    @PostMapping("/career/recommendations")
    public ResponseEntity<JsonNode> recommendations(@RequestBody CareerRecommendationRequest request) {
        return ResponseEntity.ok(resumeService.careerRecommendations(request));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> downloadFile(@PathVariable UUID id) {
        Resume resume = resumeService.getResumeById(id);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(resume.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + resume.getFilename() + "\"")
                .body(resume.getFileData());
    }

    @PostMapping("/resumes-comparison")
    public ResponseEntity<JsonNode> comparison(@RequestBody List<UUID> resumeIds) {
        return ResponseEntity.ok(resumeService.compareResumes(resumeIds));
    }

    private record ErrorResponse(String message) {}
}
