    package com.cloud.AWSbackenderrorcause.Ai;

    import java.util.List;
    import java.util.Map;

    import org.springframework.web.bind.annotation.*;

    @RestController
    @RequestMapping("/api/ai-test")
    public class AiTestController 
    {

        @GetMapping("/hello")
        public String hello() 
        {
            return "Controller Working";
        }

        private final LogAnalysisService logAnalysisService;

        public AiTestController(LogAnalysisService logAnalysisService) 
        {
            this.logAnalysisService = logAnalysisService;
        }

        @PostMapping("/analyze")
        public GptAnalysisResult testAnalyze(@RequestBody Map<String, Object> body) throws Exception 
        {

            String service = (String) body.get("service");

            @SuppressWarnings("unchecked")
            List<String> errorLogs = (List<String>) body.get("errorLogs");

            return logAnalysisService.analyze(service, errorLogs);
        }
    }