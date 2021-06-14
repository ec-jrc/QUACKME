package eu.europa.ec.jrc.d5.mars.quackme.rest.dynamodb.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlowInfo {
	
	private String id;
	
	private String creationTime;
	
	private FlowInfoStepKind lastFinishedStep;
	
	private FlowInfoStepKind currentlyProcessedStep;
	
}
