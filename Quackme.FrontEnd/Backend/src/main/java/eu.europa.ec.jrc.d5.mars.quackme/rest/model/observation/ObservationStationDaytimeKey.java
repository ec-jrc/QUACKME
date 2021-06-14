package eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public final class ObservationStationDaytimeKey {

	private Integer stationId;
	private String dayTime;
}
