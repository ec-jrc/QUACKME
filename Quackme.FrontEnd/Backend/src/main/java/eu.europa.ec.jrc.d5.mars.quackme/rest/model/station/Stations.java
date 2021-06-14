package eu.europa.ec.jrc.d5.mars.quackme.rest.model.station;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import lombok.Data;

/**
 * Class packs all stations into a list to reflect input xml stucture.
 *
 */
@XmlRootElement(name = "STATIONS")
@XmlAccessorType(XmlAccessType.FIELD)
@Data
public class Stations {

	@XmlElement(name = "STATION")
	private List<Station> stations;
}
