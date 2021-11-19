package eu.europa.ec.jrc.d5.mars.quackme.rest.controller;

import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.apache.tomcat.util.threads.ThreadPoolExecutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.StepKind;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.status.RegionsStatusForDate;
import eu.europa.ec.jrc.d5.mars.quackme.rest.service.QuackmeFlowService;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller to support operation on Flows. Main operations are like getting status, and moving flow to other
 * step.
 */
@Slf4j
@RestController
@RequestMapping(path = "/flows")
public class QuackmeManagerController {
  
  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final ThreadPoolExecutor threadPoolExecutor =
      new ThreadPoolExecutor(10, 10, 10, TimeUnit.SECONDS, new LinkedBlockingQueue<>(10));
  
    @Value("${qmManager.endpoint}")
    private String quackMeManagerEndpoint;
    
    @Autowired
    private QuackmeFlowService quackmeFlowService;

    /**
     * Builds template preconfigured to access QuackMe Manager.
     */
    protected RestTemplate buildBaseTemplate() {
        return new RestTemplateBuilder()
                .rootUri(quackMeManagerEndpoint)
                .build();
    }
    
    /**
     * Convenient method to move flow to next step encoded in request path.
     * (Easy to use from command line).
     */
    @RequestMapping(method = RequestMethod.POST, path = "/{flowId}/{stepToExecute}")
    public void updateFlowStep(@PathVariable @NonNull String flowId, @PathVariable @NonNull StepKind stepToExecute) {
      ResponseEntity<Void> voidResponseEntity = buildBaseTemplate().postForEntity("/manager/flows/{id}/{step}", null, Void.class,
                flowId, stepToExecute);
        if (!voidResponseEntity.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Unexpected response " + voidResponseEntity.getStatusCode());
        }
    }

  @GetMapping(path = "/status")
  public ResponseEntity<String> checkIfApplicationCanRunJob() {
    try {
      return threadPoolExecutor.submit(() -> {
        ResponseEntity<String> responseEntity = buildBaseTemplate().getForEntity("/manager/flows/status", String.class);
        if (!responseEntity.getStatusCode().is2xxSuccessful()) {
          throw new RuntimeException("Unexpected response " + responseEntity.getStatusCode());
        }
        return new ResponseEntity<>(responseEntity.getBody(), HttpStatus.OK);
      }).get(1, TimeUnit.SECONDS);
    } catch (InterruptedException | TimeoutException e) {
      log.warn("Didn't receive response about status in 1 second timeframe.", e);
    } catch (ExecutionException e) {
      log.error("Downstream service not available.", e);
    }
    return new ResponseEntity<>("Downstream service error.", HttpStatus.SERVICE_UNAVAILABLE);
//        CAN_RUN_JOB,  CANNOT_RUN_JOB
    //return new ResponseEntity<>("CAN_RUN_JOB", HttpStatus.OK);
  }
  
    @GetMapping(path = "/status/{flowId}")
    public ResponseEntity checkFlowStatus(@PathVariable @NonNull String flowId) {
        try {
          StepKind finishedStep = quackmeFlowService.returnFlowLastStep(flowId);
          return new ResponseEntity<StepKind>(finishedStep, HttpStatus.OK);
        } catch (NullPointerException exc) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Flow id not found");
        }
    }
    
    @GetMapping(path = "/status/date/{date}")
    public ResponseEntity<?> getStatusForDate(@PathVariable @NonNull String date) {
      try {
        FORMATTER.parse(date);
        List<RegionsStatusForDate> listOfRegionStatusesForDate = quackmeFlowService.getListOfRegionStatusesForDate(date);

        return new ResponseEntity<List<RegionsStatusForDate>>(listOfRegionStatusesForDate, HttpStatus.OK);
      } catch (DateTimeParseException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Provided date format is incorrect. Please provide date in yyyy-MM-dd format.");
      }
    }
}
