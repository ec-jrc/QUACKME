package eu.europa.ec.jrc.d5.mars.quackme.rest.model.station;

import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.Observation;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StationWithObservation {
	
	private Station station;
	private Observation observation;

}
