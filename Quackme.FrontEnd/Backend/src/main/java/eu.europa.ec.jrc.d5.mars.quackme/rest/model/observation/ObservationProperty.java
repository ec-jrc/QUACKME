package eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlValue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@XmlAccessorType(XmlAccessType.FIELD)
@NoArgsConstructor
@AllArgsConstructor
public class ObservationProperty {
	
	@XmlValue
	private String value;
	
	@XmlAttribute(name = "Status")
	private String status;
	
}
