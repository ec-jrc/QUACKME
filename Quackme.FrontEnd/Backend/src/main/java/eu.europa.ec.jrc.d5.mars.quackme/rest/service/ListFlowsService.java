package eu.europa.ec.jrc.d5.mars.quackme.rest.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.FlowFileInfo;
import eu.europa.ec.jrc.d5.mars.quackme.rest.utils.MarsObsproLocalUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.QuackmeRegion;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.FlowInfo;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.ObservationFileInfo;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service to provide list of files available in s3 bucket
 *
 */
@Service
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
public class ListFlowsService {

    @Value("${data.source.number.visible.files}")
    private int NUMBER_OF_LATEST_FLOWS_IDS = 0;
    
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Autowired
//    private MarsObsproAwsUtils awsUtils;
    private MarsObsproLocalUtils qmeUtils;

    @Value("${data.source.bucket}")
    private String dataSourceBucket;

    @Value("${data.source.prefix}")
    private String prefix;

    /**
     * Method return list of latest ({@link NUMBER_OF_LATEST_FLOWS_IDS}) flows ids
     * 
     * @return list of latest flows ids
     */
    public List<FlowInfo> listLatestFlows(QuackmeRegion region) {
        log.info("List latest {} flow ids", NUMBER_OF_LATEST_FLOWS_IDS);
        List<FlowInfo> flowInfoList = new LinkedList<>();
        LocalDate dateToCheck = LocalDate.now();
        long iterationNumber = 0;
        
        while (flowInfoList.size() < (NUMBER_OF_LATEST_FLOWS_IDS) 
                && iterationNumber < (2 * NUMBER_OF_LATEST_FLOWS_IDS)) { 
            //additional condition in case of less than NUMBER_OF_LATEST_FLOWS_IDS flows in the s3 bucket
            List<FlowInfo> listFI = getFlowIdsForDate(region, dateToCheck.minusDays(iterationNumber));
            if(!flowInfoList.containsAll(listFI))
                flowInfoList.addAll(listFI);
            iterationNumber++;
        }
        
        if (flowInfoList.size() > NUMBER_OF_LATEST_FLOWS_IDS) {
            flowInfoList = flowInfoList.subList(0, NUMBER_OF_LATEST_FLOWS_IDS);
        }
        return flowInfoList;
    }
    
    public List<FlowInfo> listFlowsForDateRange(QuackmeRegion region, LocalDate startDate, LocalDate endDate) {
      List<FlowInfo> flowInfoList = new ArrayList<>();
      for (LocalDate currentlyProcessedDate = startDate; !currentlyProcessedDate.isAfter(endDate);
          currentlyProcessedDate = currentlyProcessedDate.plusDays(1)) {
        flowInfoList.addAll(getFlowIdsForDate(region, currentlyProcessedDate));
      }
      return flowInfoList;
    }
    
    private List<FlowInfo> getFlowIdsForDate(QuackmeRegion region, LocalDate date) {
//        String prefixWithDate = prefix + region + "_" + date.format(FORMATTER);
//        return awsUtils.getFlowIdsListFromS3Bucket(dataSourceBucket, prefixWithDate);
        return qmeUtils.getFlowIdsListFromLocal(region);
    }

    public List<ObservationFileInfo> listObservationsForFlow(String flowId) {
        log.info("List observations for flow with id: {}", flowId);
        Map<String, ObservationFileInfo> observationsMap = new HashMap<>();
//        var observationsListFromS3Bucket =
//                qmeUtils.getObservationsForFlowIdFromS3Bucket(dataSourceBucket, preparePrefixWithFlowId(flowId));


        List<FlowFileInfo> responseList = qmeUtils.getFlowIdsFilesListFromLocal(flowId);

        var observationsListFromS3Bucket = responseList;
        observationsListFromS3Bucket.stream().forEach(f -> {
            final String nameSimplified = f.getNameSimplified();
            final String[] nameComponents = nameSimplified.split("\\.", -1);
            final String referenceDate = nameComponents[nameComponents.length - 1];
            final String checkLevel = nameComponents[nameComponents.length - 2];
            
            if (observationsMap.get(checkLevel) == null) {
              observationsMap.put(checkLevel, ObservationFileInfo.builder()
                      .referenceDates(new ArrayList<>() {
                        {
                          add(referenceDate);
                        }
                      })
                      .checkLevel(checkLevel)
                      .flowId(f.getFlowId())
                      .build());
            } else {
              observationsMap.get(checkLevel).getReferenceDates().add(referenceDate);
            }
        });
        
        return new ArrayList(observationsMap.values());
    }
    
    private String preparePrefixWithFlowId(String flowId) {
        String prefixWithFlowId = prefix + flowId;
        if (!prefixWithFlowId.endsWith("/")) {
            prefixWithFlowId += "/";
        }
        prefixWithFlowId += "quackmeResults/";
        return prefixWithFlowId;
    }
}
