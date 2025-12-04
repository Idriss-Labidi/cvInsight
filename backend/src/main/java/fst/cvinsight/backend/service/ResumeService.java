package fst.cvinsight.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import fst.cvinsight.backend.dto.ResumeDto;
import fst.cvinsight.backend.entity.Resume;
import fst.cvinsight.backend.entity.UserInfo;
import fst.cvinsight.backend.exception.ResumeAnalysisException;
import fst.cvinsight.backend.exception.ResumeExtractionException;
import fst.cvinsight.backend.exception.ResumeProcessingException;
import fst.cvinsight.backend.exception.ResumeStorageException;
import fst.cvinsight.backend.mapper.ResumeMapper;
import fst.cvinsight.backend.model.CareerRecommendationRequest;
import fst.cvinsight.backend.model.ResumeOrigin;
import fst.cvinsight.backend.repo.ResumeRepository;
import fst.cvinsight.backend.util.DocumentUtils;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.template.st.StTemplateRenderer;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ChatClient chatClient;
    private final DocumentUtils documentUtils;
    private final ResumeRepository resumeRepository;
    private final UserInfoService userInfoService;
    private final ObjectMapper objectMapper;
    private final ResumeMapper resumeMapper;

    public String extractAndParseResume(File file) throws IOException {
        String resumeContent;
        try{
            resumeContent = documentUtils.extractText(file);
        } catch (IOException e) {
            throw new ResumeExtractionException(e);
        }

        String result;
        try {
            String prompt = buildExtractionPrompt(resumeContent);
            result =  chatClient.prompt(prompt)
                    .call()
                    .content();
        } catch (Exception e) {
            throw new ResumeAnalysisException(e);
        }

        saveResume(file, result, ResumeOrigin.USER_UPLOADED);

        return result;
    }

    public void saveResume(File file, String jsonContent, ResumeOrigin origin) throws ResumeStorageException {
        try {
            Resume resume = new Resume();

            JsonNode parsed = objectMapper.readTree(jsonContent);

            resume.setFilename(file.getName());
            resume.setContentType(Files.probeContentType(file.toPath()));
            resume.setSize(file.length());
            resume.setUploadedBy(userInfoService.getCurrentUser());
            resume.setFileData(Files.readAllBytes(file.toPath()));
            resume.setJsonContent(parsed);

            resume.setOrigin(origin != null ? origin : ResumeOrigin.SYSTEM_GENERATED);

            resumeRepository.save(resume);

        } catch (JsonProcessingException e) {
            throw new ResumeAnalysisException(e);
        } catch (IOException e) {
            throw new ResumeStorageException(e);
        }
    }

    private String buildExtractionPrompt(String resumeContent) {
        PromptTemplate promptTemplate = PromptTemplate.builder()
                .renderer(StTemplateRenderer.builder().startDelimiterToken('<').endDelimiterToken('>').build())
                .template("""
                    You are an expert CV analyzer and information extractor.
                    Your task is to read the provided resume text and produce a clean, valid JSON object
                    that captures all relevant information about the candidate.
        
                    Guidelines:
                    - Focus on **completeness**: include education, experience, internships, projects,
                      certifications, skills, spoken languages, and social or community involvement.
                    - Use **null** for missing data (do not skip fields).
                    - Dates should be in ISO format: YYYY-MM if available.
                    - For Array fields, use an empty array if there are no items.
                    - Ensure the output is **strictly valid JSON**, no explanations or comments.
        
                    Resume text:
                    ---
                    <cvContent>
                    ---
        
                    Return JSON in the following structure:
                    {
                      "about": {
                        "name": "",
                        "email": "",
                        "phone": "",
                        "address": "",
                        "linkedin": "",
                        "github": "",
                        "role": "",
                        "portfolio": "",
                        "summary": "",
                        "otherProfiles": []
                      },
                      "education": [
                        {
                          "degree": "",
                          "school": "Institution name",
                          "startYr": "2022",
                          "endYr": "2025",
                          "grade": ""
                        }
                      ],
                      "work": [
                        {
                          "position": "",
                          "company": "",
                          "startDate": "",
                          "endDate": "",
                          "description": "",
                          "type": "Full-Time|Internship|Part-Time|Freelance"
                        }
                      ],
                      "projects": [
                        {
                          "name": "",
                          "description": "",
                          "github": "",
                          "technologies": [],
                          "url": ""
                        }
                      ],
                      "skills": ["", "", ""],
                      "languages": [
                        {"name": "", "level": ""}
                      ],
                      "certifications": [
                        {"title": "", "issuer": "", "year": ""}
                      ],
                      "socialActivities": [
                        {"role": "", "organization": "", "description": ""}
                      ]
                    }
        
                    Output only JSON, without any surrounding text.
                    """)
                .build();

        return promptTemplate.render(Map.of("cvContent", resumeContent));
    }

    public ResumeDto getResumeDtoById(UUID id) {
        UUID userId = userInfoService.getCurrentUser().getId();
        Resume cv = resumeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CV not found"));
        if (!cv.getUploadedBy().getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access this CV");
        }
        return resumeMapper.toDto(cv);
    }

    public Resume getResumeById(UUID id) {
        UUID userId = userInfoService.getCurrentUser().getId();
        Resume cv = resumeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CV not found"));
        if (!cv.getUploadedBy().getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access this CV");
        }
        return cv;
    }

    public void deleteResume(UUID id) {
        UUID userId = userInfoService.getCurrentUser().getId();
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CV not found"));
        if (!resume.getUploadedBy().getId().equals(userId)) {
            throw new AccessDeniedException("You are not allowed to access this CV");
        }
        resumeRepository.delete(resume);
    }

    public List<ResumeDto> getAllCVsForCurrentUser() {
        UserInfo user = userInfoService.getCurrentUser();
        return resumeMapper.toDtoList(resumeRepository.findAllByUploadedBy(user));
    }

    public JsonNode analyzeResume(UUID resumeId) {
        Resume resume = getResumeById(resumeId);

        String resumeJson = resume.getJsonContent().toString();

        String prompt = """
            You are an expert resume reviewer with 20+ years of experience in HR, technical hiring, and career development.
        
            Your task:
            - Analyze the following resume JSON and extract weaknesses, improvements, mistakes, and missing sections.
            - Provide clear, actionable, and practical feedback.
            - Evaluate the overall quality and assign a numerical score from 0 to 100.
        
            ----------------------------
            Guidelines (IMPORTANT):
            ----------------------------
            1. **Do NOT generate or invent experience, skills, or data that are not present.**
            2. Base ALL analysis strictly on the provided resume JSON.
            3. If a section is empty or missing, list it under `missingSections`.
            4. Weaknesses must be directly supported by the resume contents (e.g., vague descriptions, missing dates).
            5. Improvements must be actionable steps (e.g., "Add metrics", "Expand project descriptions").
            6. Mistakes should include formatting issues, typos, inconsistencies, or missing date ranges if applicable.
            7. Score evaluation rules:
               - 0–39: Very weak resume
               - 40–59: Needs significant improvement
               - 60–79: Decent but missing important elements
               - 80–89: Strong resume with minor issues
               - 90–100: Excellent resume
            8. **Return strictly valid JSON**.
            9. **Do NOT include explanations outside of the JSON**.
            10. Do NOT include the prompt, reasoning, or any extra commentary.
            11. No markdown, no backticks — only raw JSON.
        
            ----------------------------
            Resume JSON:
            %s
            ----------------------------
        
            The output MUST follow exactly this JSON schema:
            {
              "weaknesses": ["", ""],
              "improvements": ["", ""],
              "missingSections": ["", ""],
              "mistakes": ["", ""],
              "score": 0,
              "overallFeedback": ""
            }
        
            Output ONLY the JSON object.
        """.formatted(resumeJson);


        try {
            String response = chatClient.prompt(prompt).call().content();
            JsonNode result =  objectMapper.readTree(response);
            JsonNode scoreNode = result.get("score");
            if (scoreNode != null) {
                resume.setScore(scoreNode.asDouble());
                resumeRepository.save(resume);
            }
            return result;
        } catch (JsonProcessingException ex) {
            throw new ResumeProcessingException(ex.getMessage(),ex);
        } catch (Exception e) {
            throw new ResumeAnalysisException(e);
        }
    }

    public JsonNode careerRecommendations(CareerRecommendationRequest request) {
        List<Resume> resumes = resumeRepository.findAllById(request.getResumeIds());

        ArrayNode resumeArray = objectMapper.createArrayNode();
        for (Resume r : resumes) {
            resumeArray.add(r.getJsonContent());
        }

        JsonNode filterNode = objectMapper.valueToTree(request.getFilters());

        String prompt = """
            You are a professional career advisor. Your task is to analyze the user's selected resumes
            and generate structured, filter-aware career recommendations.
    
            ### INPUT
            1. **Selected resumes (JSON array)**:
            %s
        
            2. **User filters (JSON object)**:
            %s
    
            ### YOUR TASK
            Based on all resumes and taking the filters strictly into account:
            - Generate personalized recommendations (courses, certifications, job roles, learning paths).
            - For each recommendation, ensure it respects the filters:
              - type filter → only include matching recommendation types
              - level filter → match user’s preferred levels
              - priceRange or "free" → ensure price filtering is respected
              - duration → match preferred duration categories
              - providers → match only providers included
              - searchQuery → match text in title or description
        
            ### STRICT OUTPUT RULES
            1. **Output ONLY valid JSON.**
            2. **Output MUST be a JSON ARRAY of recommendation objects.**
            3. **Every field MUST exist per item.**
            4. **No comments, no explanations, no markdown, no trailing text.**
            5. **Strings must not contain line breaks.**
            6. **If no results match the filters, return an **empty JSON array []**
    
            ### REQUIRED JSON ARRAY SCHEMA
            Each recommendation MUST follow the exact structure:
    
            {
              "type": "COURSE" | "CERTIFICATION" | "TRAINING" | "OPPORTUNITY",
              "title": "string",
              "provider": "string",
              "description": "string",
              "matchScore": 0,
              "level": "BEGINNER | INTERMEDIATE | ADVANCED",
              "duration": "string",
              "price": 0,
              "url": "string",
              "skills": ["skill1", "skill2"],
              "whyRecommended": "string",
              "category": "string or null"
            }
    
            ### FINAL INSTRUCTION
            Respond with **ONLY the JSON ARRAY** of recommendation objects** Without any surrounding text.
        """.formatted(
                resumeArray.toPrettyString(),
                filterNode.toPrettyString()
        );

        try {
            String response = chatClient
                    .prompt(prompt)
                    .options(ChatOptions.builder().temperature(0.25).build())
                    .call()
                    .content();
            return objectMapper.readTree(response);
        } catch (Exception e) {
            throw new ResumeAnalysisException(e);
        }
    }

    public JsonNode compareResumes(List<UUID> resumeIds) {
        List<Resume> resumes = resumeRepository.findAllById(resumeIds);

        ArrayNode resumeArray = objectMapper.createArrayNode();
        for (Resume r : resumes) {
            resumeArray.add(r.getJsonContent());
        }

        String prompt = """
            You are a professional career analyst. Your task is to compare the provided resumes
            and generate a structured JSON comparison.
    
            ### INPUT
            **Resumes (JSON array)**:
            %s
    
            ### YOUR TASK
            Analyze all resumes and produce a deep, structured comparison. Focus on:
            - Strengths of each resume
            - Weaknesses or missing elements
            - Skills comparison (common skills vs unique skills)
            - Experience comparison (depth, relevance, diversity)
            - Education comparison
            - Overall strengths comparison
            - Suitability for different roles
            - A final verdict summarizing which resume is stronger for which goals
    
            ### STRICT OUTPUT RULES
            1. Output **ONLY valid JSON**.
            2. Output MUST be a **JSON OBJECT ONLY**.
            3. Don't start or end with extra sentences or words, **ONLY THE JSON**
            4. Follow the exact schema below.
            5. No explanations, no markdown, no extra text.
            6. Strings must not contain line breaks.
            7. If the comparison cannot be made (e.g., not enough resumes), return an empty JSON object `{}`.
    
            ### REQUIRED OUTPUT JSON SCHEMA
            {
              "resumeSummaries": [
                {
                  "resumeId": "string",
                  "keyStrengths": ["string"],
                  "keyWeaknesses": ["string"],
                  "uniqueSkills": ["string"],
                  "notableExperiences": ["string"]
                }
              ],
              "comparison": {
                "commonSkills": ["string"],
                "uniqueSkillsByResume": {
                  "resumeId": ["string"]
                },
                "experienceComparison": {
                  "strongerExperienceResumeId": "string or null",
                  "summary": "string"
                },
                "educationComparison": {
                  "strongerEducationResumeId": "string or null",
                  "summary": "string"
                },
                "roleSuitability": [
                  {
                    "role": "string",
                    "bestResumeId": "string",
                    "reason": "string"
                  }
                ]
              },
              "finalVerdict": "string"
            }
    
            ### FINAL INSTRUCTION
            Respond with **ONLY** the JSON object, **STRICTLY** nothing else.
        """.formatted(
                    resumeArray.toPrettyString()
            );

        try {
            String response = chatClient
                    .prompt(prompt)
                    .options(ChatOptions.builder().temperature(0.25).build())
                    .call()
                    .content();
            System.out.println(response);
            return objectMapper.readTree(response);
        } catch (Exception e) {
            throw new ResumeAnalysisException(e);
        }

    }
}
