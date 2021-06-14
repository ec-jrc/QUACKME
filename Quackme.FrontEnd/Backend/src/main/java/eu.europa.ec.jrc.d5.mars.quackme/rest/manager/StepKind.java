package eu.europa.ec.jrc.d5.mars.quackme.rest.manager;

/**
 * Describes kind of step. Enum's order defines execution order.
 */
public enum StepKind {
  NOT_DEFINED,
  RUN_WEAK_CHECKS_FOR_CURRENT_DATE, 
  RUN_AGGREGATION, 
  RUN_HEAVY_CHECKS, 
  RUN_THRESHOLD_CHECKS, 
  GENERATE_SFILE
}