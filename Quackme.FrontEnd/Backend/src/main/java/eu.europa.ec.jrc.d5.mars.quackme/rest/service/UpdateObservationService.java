package eu.europa.ec.jrc.d5.mars.quackme.rest.service;

import java.io.ByteArrayOutputStream;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import eu.europa.ec.jrc.d5.mars.quackme.rest.utils.MarsObsproLocalUtils;
import eu.europa.ec.jrc.d5.mars.quackme.rest.utils.ObservationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.CheckType;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.AbstractObservations;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.HeavyChecksObservationList;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.Observation;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.WeakChecksObservationList;
import eu.europa.ec.jrc.d5.mars.quackme.rest.utils.MarsObsproXmlUtils;
import io.micrometer.core.instrument.util.StringUtils;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
public class UpdateObservationService {
  
    private static final int DATE_CHARS = 8;

	@Autowired
	private MarsObsproXmlUtils xmlUtils;

//	@Autowired
//    private MarsObsproAwsUtils awsUtils;

	@Autowired
    private MarsObsproLocalUtils localUtils;

	@Value("${data.source.bucket}")
	private String dataSourceBucket;

	@Value("${data.source.prefix}")
	private String prefix;
	
    @Value("${data.ko.fileName}")
    private String koFileName;

    /**
     * Method updates desired s3object, adding new data and removing corresponding
     * old one
     * 
     * @param flowId 
     *            id flow to update
     * @param checkType
     *            s3object name which we want to update
     * @param observationsToUpdate
     *            list of updates
     * @return String with name of new s3Object e.g. if we update file test.xml,
     *         method will return test_v1.xml
     */
    @SuppressWarnings("unchecked")
    public Map<String, List<String>> updateS3Object(String flowId, CheckType checkType, List<Observation> observationsToUpdate) {
        log.info("Updating checkType: {} for flow id: {}", checkType, flowId);
        List<String> referenceDates = prepareUniqueReferenceDates(observationsToUpdate);
        List<String> updatedFileNames = new ArrayList<>();
        
        for (String referenceDate : referenceDates) {
            String fileName = prepareKOFileName(checkType, referenceDate);
            log.info("Updating file: {}", fileName);
          
            List<Observation> observationsForDate = getObservationsForDate(referenceDate, observationsToUpdate);
            AbstractObservations<? extends Observation> observationsList = createObservationsList(flowId, fileName);

            List<Observation> observations = (List<Observation>) observationsList.getObservations();
            if (checkType == CheckType.WEAK_CHECKS) {
                updateKOObservationsForWeakChecks(observationsForDate, observations);
            } else {
                updateKOObservationsForNotWeakChecks(observationsForDate, observations);
            }
            observationsList.setObservations(observations);

            ByteArrayOutputStream os = xmlUtils.marshallS3File(observationsList, observationsList.getClass());

            log.info(os.toString());

            String fullyQualifiedS3ObjectName = localUtils.getFullyQualifiedOutput(dataSourceBucket, flowId, fileName, checkType.toString());

            localUtils.putObjectIntoS3Bucket(dataSourceBucket, fullyQualifiedS3ObjectName, os);
        }
        
        return Collections.singletonMap("updatedFileName", updatedFileNames);
    }

    /**
     * Updates observations on `originalObservations` with  changes from `observationsUpdated` - used only for
     * Weak Checks. Observations are replaced on list.
     */
    protected void updateKOObservationsForWeakChecks(List<Observation> observationsUpdated, List<Observation> originalObservations) {
        List<Observation> observationsToRemove = createListOfObservationsToUpdate(originalObservations, observationsUpdated);

        // Remove all observations and replace with new ones
        originalObservations.removeAll(observationsToRemove);
        originalObservations.addAll(observationsUpdated);
    }

    /**
     * Updates observations on `originalObservations` with  changes from `observationsUpdated` - used only for
     * not Weak Checks. Observations (in contrast to {@link #updateKOObservationsForWeakChecks}, are merged
     * using following algorithm: for each observation on `observationsUpdated` find corresponding one on
     * `originalObservations`, than propagate `observationsUpdated` to `originalObservations`.
     */
    protected void updateKOObservationsForNotWeakChecks(List<Observation> observationsUpdated, List<Observation> originalObservations) {
        List<Observation> originalObservationsToUpdate = createListOfObservationsToUpdate(originalObservations, observationsUpdated);

        originalObservationsToUpdate.forEach(observationToUpdate  -> {
            // Find the update (patch) for current observationToUpdate
            Observation singleObservationUpdated = observationsUpdated.stream().filter(u -> observationToUpdate.isKeyEqual(u)).findFirst().get();

            // Stream all updated observations, and update the original observation
            ObservationUtils.observationPropertiesStream(singleObservationUpdated)
                    .filter(opi -> opi.getProperty() != null)
                    .forEach(opi -> this.updateField(observationToUpdate, opi.getPropertyName(), opi.getProperty()));
        });
    }

    private void updateField(Object target, String filedName, Object newValue) {
        try {
            Field field = target.getClass().getDeclaredField(filedName);
            field.setAccessible(true);
            field.set(target, newValue);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException(e);
        }
    }

    private List<String> prepareUniqueReferenceDates(List<Observation> observationsToUpdate) {
        return observationsToUpdate.stream()
          .map(obs -> {
              return obs.getDayTime().substring(0, DATE_CHARS);
          })
          .distinct()
          .collect(Collectors.toList());
    }
    
    private List<Observation> getObservationsForDate(String referenceDate, List<Observation> observations) {
        return observations.stream().filter(obs -> {
          return Objects.equals(obs.getDayTime().substring(0, DATE_CHARS), referenceDate);
        })
        .collect(Collectors.toList());
    }
    
    
    private String prepareKOFileName(CheckType checkType, String date) {
        return koFileName.replace("{CHECKTYPE}", checkType.getName()).replace("{DATE}", date);
    }

	private AbstractObservations<? extends Observation> createObservationsList(String flowId, String fileName) {
	    String prefixWithFlowId = flowId; //preparePrefixWithFlowId(flowId);
		if (fileName.contains("WeakChecks")) {
			return xmlUtils.unmarshallS3File(dataSourceBucket, prefixWithFlowId, fileName, WeakChecksObservationList.class);
		} else {
			return xmlUtils.unmarshallS3File(dataSourceBucket, prefixWithFlowId, fileName, HeavyChecksObservationList.class);
		}
	}
	
    private String preparePrefixWithFlowId(String flowId) {
        String prefixWithFlowId = prefix;
        if (StringUtils.isNotBlank(flowId)) {
            prefixWithFlowId += flowId;
            if (!prefixWithFlowId.endsWith("/")) {
                prefixWithFlowId += "/";
            }
            prefixWithFlowId += "quackmeResults/";
        }
        return prefixWithFlowId;
    }

	private List<Observation> createListOfObservationsToUpdate(List<Observation> observations,
                                                               List<Observation> observationsToUpdate) {
		List<Observation> originalObservationsToUpdate = new ArrayList<>();
		Map<String, Observation> observationMap = new HashMap<>();
		observations.stream().forEach(
				observation -> observationMap.put(observation.getStation() + observation.getDayTime(), observation));
		observationsToUpdate.stream().forEach(observationToUpdate -> {
			if (observationMap.containsKey(observationToUpdate.getStation() + observationToUpdate.getDayTime())) {
				originalObservationsToUpdate
						.add(observationMap.get(observationToUpdate.getStation() + observationToUpdate.getDayTime()));
			}
		});
		return originalObservationsToUpdate;
	}

}
