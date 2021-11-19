package eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import lombok.Data;

/**
 * Implementation of AbstractObservations class for heavy checks. Packs
 * ObservationImplementationForHeavyChecks to list to reflect input xml
 * structure.
 *
 */
@Data
@XmlRootElement(name = "Observations")
@XmlAccessorType(XmlAccessType.FIELD)
public class HeavyChecksObservationList implements AbstractObservations<ObservationImplementationForHeavyChecks> {
	@XmlElement(name = "Observation")
	private List<ObservationImplementationForHeavyChecks> observations;
	@SuppressWarnings("unchecked")
	@Override
	public void setObservations(List<? extends Observation> list) {
		this.observations = (List<ObservationImplementationForHeavyChecks>) list;
	}
}
