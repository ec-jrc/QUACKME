package eu.europa.ec.jrc.d5.mars.quackme.rest.controller;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.regex.Pattern;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
//import org.springframework.web.multipart.MultipartFile;
import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.QuackmeRegion;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.CheckType;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.FlowInfo;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.ObservationFileInfo;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.Observation;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.station.StationWithObservation;
import eu.europa.ec.jrc.d5.mars.quackme.rest.service.FileService;
import eu.europa.ec.jrc.d5.mars.quackme.rest.service.FileUploadService;
import eu.europa.ec.jrc.d5.mars.quackme.rest.service.ListFlowsService;
import eu.europa.ec.jrc.d5.mars.quackme.rest.service.UpdateObservationService;
import eu.europa.ec.jrc.d5.mars.quackme.rest.utils.ObservationUtils;
import lombok.NonNull;

/**
 *
 * Main rest controller to root traffic between endpoints.
 *
 */
@RestController
public class MarsObsproRestController {
  
  private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);
  private static final Pattern PATTERN = Pattern.compile("I.MG.{8}[0-9].csv");

	@Autowired
	private UpdateObservationService updateObservationService;

	@Autowired
	private FileService fileService;
	
	@Autowired
	private ListFlowsService listFlowsService;
	
	@Autowired
	private FileUploadService uploadService;

	@GetMapping(value = "/test1")
	public String getMessage() {
		return "Test response";
	}

	/**
     * Endpoint will print the latest x flow ids
     * 
     * @return List of the latest x flow
     */
    @GetMapping(value = "/flows", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
    public List<FlowInfo> getLatestFlowIds(@RequestParam(required = true) QuackmeRegion region) {
        return listFlowsService.listLatestFlows(region);
    }
    
    @GetMapping(value = "/flows/{region}/{startDate}/{endDate}", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
    public List<FlowInfo> getFlowIdsForDateRange(@PathVariable(required = true) String region, 
        @PathVariable(required = true) String startDate, @PathVariable(required = true) String endDate) {
      LocalDate dateFrom = LocalDate.parse(startDate, FORMATTER);
      LocalDate dateTo = LocalDate.parse(endDate, FORMATTER);
      return listFlowsService.listFlowsForDateRange(QuackmeRegion.valueOf(region), dateFrom, dateTo);
    }
    
    /**
     * Endpoint return all files available in S3 bucket for specific flow id.
     * 
     * @return List of the latest x flow
     */
    @GetMapping(value = "/flows/{flowId}", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
    public List<ObservationFileInfo> getObservationsForFlow(@PathVariable String flowId) {
        return listFlowsService.listObservationsForFlow(flowId);
    }
    
    /**
     * Endpoint to update observation file in S3 bucket (for specific flow id).
     * @param flowId flow id
//     * @param fileName file name
     * @param body content to update
     * @return
     */
    @PutMapping(value = "/flows/{flowId}/files/{checkType}", consumes = MimeTypeUtils.APPLICATION_JSON_VALUE, 
            produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
    public Map<String, List<String>> updateStationForFlow(@PathVariable String flowId, @PathVariable String checkType,
            @RequestBody List<Observation> body) {
      body.stream()
        .flatMap(ObservationUtils::observationPropertiesStream)
	  	.map(opi -> opi.getProperty())
	  	.filter(Objects::nonNull)
        .filter(op -> StringUtils.equalsIgnoreCase(op.getValue(), "NA") && StringUtils.equalsIgnoreCase(op.getStatus(), "M"))
        .forEach(o -> {
          o.setStatus("F");
        });
        return updateObservationService.updateS3Object(flowId, CheckType.fromValue(checkType), body);
    }

  /**
	 * Endpoint to return combined list of stations and observations for given S3
	 * object key and version of object
	 * 
	 * @param checkType
	 *            file name that we want version of
	 * @param referenceDates
	 *            dates of files
	 * @return List of StationWithObservation type created to combine station and
	 *         observation information in one json
	 */
	@GetMapping(value = "/flows/{flowId}/files/{checkType}/{referenceDates}", produces = MimeTypeUtils.APPLICATION_JSON_VALUE)
	public List<StationWithObservation> getFileData(@PathVariable String flowId, @PathVariable String checkType, 
	      @PathVariable List<String> referenceDates) {
		return fileService.getCheckFile(flowId, CheckType.fromValue(checkType), referenceDates);
	}
	
	@PostMapping(value = "/file")
	public void uploadFile(@RequestBody UploadFileRequest fileRequest) {
	  if(!validateFileName(fileRequest.getFileName())) {
	    throw new RuntimeException("File not valid.");
	  } 
	  uploadService.handleIncomingFile(fileRequest);
	}

  private boolean validateFileName(@NonNull String file) {
    return PATTERN.matcher(file).matches();
  }
}
