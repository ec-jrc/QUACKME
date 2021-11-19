package eu.europa.ec.jrc.d5.mars.quackme.rest.dynamodb.model;

import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.StepKind;

/**
 * Describes kind of step. Enum's order defines execution order.
 */
public enum FlowInfoStepKind {
  PREPARE_DATA(StepKind.NOT_DEFINED),
  MOS_INPUT(StepKind.NOT_DEFINED),
  RUN_WEAK_CHECKS_FOR_CURRENT_DATE(StepKind.RUN_WEAK_CHECKS_FOR_CURRENT_DATE), 
  RUN_AGGREGATION(StepKind.RUN_WEAK_CHECKS_FOR_CURRENT_DATE), 
  RUN_HEAVY_CHECKS(StepKind.RUN_HEAVY_CHECKS), 
  RUN_THRESHOLD_CHECKS(StepKind.RUN_THRESHOLD_CHECKS), 
  GENERATE_SFILE(StepKind.GENERATE_SFILE),
  RRR_GENERATOR(StepKind.GENERATE_SFILE),
  RUN_POST_QUACKME_CHECK(StepKind.GENERATE_SFILE),
  RUN_ADDITIONAL_QUALITY_CHECKS(StepKind.GENERATE_SFILE),
  COUNT_QUACKME_FLAGS(StepKind.GENERATE_SFILE);
  
  private final StepKind stepKind;
  
  private FlowInfoStepKind(StepKind stepKind) {
    this.stepKind = stepKind;
  }
  
  public StepKind toStepKind() {
    return stepKind;
  }
}
