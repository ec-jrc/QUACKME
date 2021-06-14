package eu.europa.ec.jrc.d5.mars.quackme.rest.model.status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegionsStatusForDate {

  private String region;
  private String lastFinishedStep;
  private String currentlyProcessedStep;
  private String flowId;

}
