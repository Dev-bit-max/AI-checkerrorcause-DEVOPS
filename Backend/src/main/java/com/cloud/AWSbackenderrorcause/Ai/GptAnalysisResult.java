// GptAnalysisResult.java
package com.cloud.AWSbackenderrorcause.ai;

import java.util.List;

public class GptAnalysisResult 
{
    private String rootCause;
    private List<TimelineEvent> timeline;
    private List<String> recommendations;

    public String getRootCause() 
    { 
        return rootCause; 
    }
    public void setRootCause(String rootCause) 
    { 
        this.rootCause = rootCause; 
    }
    public List<TimelineEvent> getTimeline() 
    { 
        return timeline; 
    }
    public void setTimeline(List<TimelineEvent> timeline) 
    { 
        this.timeline = timeline; 
    }
    public List<String> getRecommendations() 
    {
        return recommendations; 
    }
    public void setRecommendations(List<String> recommendations) 
    {
        this.recommendations = recommendations; 
    }
}