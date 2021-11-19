package eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation;

import java.util.List;
import java.util.Objects;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSeeAlso;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.annotation.JsonTypeInfo.Id;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.alert.Alert;

import lombok.Data;

/**
 *
 * Abstract class grouping common fields for all observation implementations.
 *
 */

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@XmlSeeAlso({ ObservationImplementationForHeavyChecks.class, ObservationImplementationForWeakChecks.class })
@JsonTypeInfo(use=Id.NAME)
@JsonSubTypes({
	@JsonSubTypes.Type(value=ObservationImplementationForHeavyChecks.class, name = "H"),
	@JsonSubTypes.Type(value=ObservationImplementationForWeakChecks.class, name = "W"),
})
public abstract class Observation {

	@XmlElement(name = "Station")
	private int Station;

	@XmlElement(name = "DayTime")
	private String DayTime;

	@XmlElement(name = "ALERT")
	private List<Alert> alerts;

	public boolean isKeyEqual(Observation other) {
		if (this == other)
			return true;
		if (other == null)
			return false;

		return (this.getStation() == other.getStation()
				&& Objects.equals(this.getDayTime(), other.getDayTime()));
	}

}
