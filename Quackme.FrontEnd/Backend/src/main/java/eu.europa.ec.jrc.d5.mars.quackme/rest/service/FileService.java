package eu.europa.ec.jrc.d5.mars.quackme.rest.service;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.alert.Alert;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.CheckType;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.AbstractObservations;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.HeavyChecksObservationList;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.Observation;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.ObservationProperty;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.ObservationStationDaytimeKey;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.WeakChecksObservationList;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.station.Station;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.station.StationWithObservation;
import eu.europa.ec.jrc.d5.mars.quackme.rest.utils.MarsObsproXmlUtils;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.extern.slf4j.Slf4j;

@Service
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class FileService {

	@Autowired
	private MarsObsproXmlUtils xmlUtils;

	@Value("${data.source.bucket}")
	private String dataSourceBucket;

	@Value("${data.config.prefix}")
	private String configPrefix;

	@Value("${data.source.prefix}")
	private String prefix;

	@Value("${stations.europe.xml.file.name}")
	private String europeStationsFile;
	
	@Value("${stations.china.xml.file.name}")
	private String chinaStationsFile;
	
    @Value("${data.ko.fileName}")
    private String koFileName;

	public List<StationWithObservation> getCheckFile(@NonNull String flowId, CheckType checkType, List<String> referenceDates) {
		String stationsFile = getStationsFileBasedOnRegionInId(flowId);
		List<Station> stationList = xmlUtils.getListOfStations(dataSourceBucket, configPrefix, stationsFile);
		List<StationWithObservation> returnList = new ArrayList<>();
		final var searchPrefix = prefix + flowId + "/";
		AbstractObservations<?> koFileObservation;
		List<String> fileNames = prepareFileNames(checkType, referenceDates);
		
		for (String fileName : fileNames) {
    		if (Objects.equals(checkType, CheckType.WEAK_CHECKS)) {
    			koFileObservation = xmlUtils.unmarshallS3File(dataSourceBucket, searchPrefix, fileName, WeakChecksObservationList.class);
    			AbstractObservations<?> okFileObservation = xmlUtils.unmarshallObservationsFromS3(
    			    dataSourceBucket, searchPrefix, fileName.replace("KO", "OK"), WeakChecksObservationList.class);
    			returnList.addAll(mergeStationWithKOandOKFileForWeakChecks(stationList, koFileObservation, okFileObservation));
    		} else {
    			koFileObservation = xmlUtils.unmarshallS3File(dataSourceBucket, searchPrefix, fileName, HeavyChecksObservationList.class);
    			returnList.addAll(mergeStationsWithKOFileForHeavyChecks(stationList, koFileObservation));
    		}
	    }
		
		return returnList;
	}
	
	private List<String> prepareFileNames(CheckType checkType, List<String> referenceDates) {
	  List<String> fileNames = new ArrayList<String>(2);
	  
	  referenceDates.forEach(date -> {
	    fileNames.add(prepareKOFileName(checkType, date));
	  });
	  
	  return fileNames;
	}
	
	private String prepareKOFileName(CheckType checkType, String date) {
	  return koFileName.replace("{CHECKTYPE}", checkType.getName()).replace("{DATE}", date);
	}
	
	@SuppressWarnings("unchecked")
	private List<StationWithObservation> mergeStationWithKOandOKFileForWeakChecks(List<Station> stationList,
			AbstractObservations<?> koFileObservations, AbstractObservations<?> okFileObservations) {
		var koObservationList = (List<Observation>) koFileObservations.getObservations();
		
		if(koObservationList != null) {
			List<StationWithObservation> stationsWithAlerts = new ArrayList<>(koFileObservations.getObservations().size());
			Map<Integer, Station> stationMap =  convertStationsListIntoStationsMap(stationList);
		
			Map<ObservationStationDaytimeKey, Observation> okObservationMap = convertObservationListIntoMap(okFileObservations);
		
			koObservationList.forEach(ko-> {
				Observation observation = okObservationMap.get(new ObservationStationDaytimeKey(ko.getStation(), ko.getDayTime()));
				observation.setAlerts(ko.getAlerts());
				for (Alert alert : ko.getAlerts()) {
					try {
						Field field = ko.getClass().getDeclaredField(alert.getProperty().toLowerCase());
						field.setAccessible(true);
						ObservationProperty value = (ObservationProperty) field.get(ko);
						field.set(observation, new ObservationProperty(value.getValue(), value.getStatus()));
						field.setAccessible(false);
					} catch (NoSuchFieldException | SecurityException | IllegalArgumentException | IllegalAccessException e) {
						log.info("Problem with setting up field from KO file, reflection failed.");
						throw new RuntimeException(e);
					}
				}
				Station station = stationMap.get(ko.getStation());
				stationsWithAlerts.add(new StationWithObservation(station, observation));
			});
			return stationsWithAlerts;
		} 
		return new ArrayList<>();
	}
	
	private String getStationsFileBasedOnRegionInId(String flowId) {
		if(flowId.startsWith("CHN")) {
			return chinaStationsFile;
		} else if(flowId.startsWith("EUR")) {
			return europeStationsFile;
		} else {
			throw new RuntimeException();
		}
	}

	private List<StationWithObservation> mergeStationsWithKOFileForHeavyChecks(List<Station> stationList,
			AbstractObservations<?> unmarshalledS3File) {
		List<StationWithObservation> stationsWithAlerts = new ArrayList<>();
		var observationList = unmarshalledS3File.getObservations();
		
		if (observationList != null) {
    		List<Observation> filteredObservationList = observationList.stream()
    				.filter(observation -> observation.getAlerts() != null).collect(Collectors.toList());
    		Map<Integer, Station> map = convertStationsListIntoStationsMap(stationList);
    
    		for (Observation obs : filteredObservationList) {
    			if (map.containsKey(obs.getStation())) {
    				stationsWithAlerts.add(new StationWithObservation(map.get(obs.getStation()), obs));
    			}
    		}
		}
		
		return stationsWithAlerts;
	}
	
	private Map<ObservationStationDaytimeKey, Observation> convertObservationListIntoMap(AbstractObservations<?> observationList) {
		Map<ObservationStationDaytimeKey, Observation> okObservationMap = new HashMap<ObservationStationDaytimeKey, Observation>();
		observationList.getObservations().stream().forEach(obs -> {
			okObservationMap.put(new ObservationStationDaytimeKey(obs.getStation(),obs.getDayTime()), obs);
		});
		return okObservationMap;
	}

	private Map<Integer, Station> convertStationsListIntoStationsMap(List<Station> stationList) {
		return stationList.stream().collect(Collectors.toMap(Station::getStationNumber, o -> o));
	}
}
