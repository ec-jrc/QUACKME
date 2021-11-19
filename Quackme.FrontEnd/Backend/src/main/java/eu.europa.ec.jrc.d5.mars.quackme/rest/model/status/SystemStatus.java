package eu.europa.ec.jrc.d5.mars.quackme.rest.model.status;

import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.StepKind;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemStatus {
  String canApplicationRunJob;
  StepKind lastFinishedStepForInProgressFlow;
}
