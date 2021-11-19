package eu.europa.ec.jrc.d5.mars.quackme.rest.model.station;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@XmlRootElement(name = "STATION")
@XmlAccessorType(XmlAccessType.FIELD)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Station {

	@XmlElement(name = "STATION_NUMBER")
	private int stationNumber;

	@XmlElement(name = "STATION_NAME")
	private String stationName;

	@XmlElement(name = "WMO_NO")
	private long wmoNo;

	@XmlElement(name = "LATITUDE")
	private double latitude;

	@XmlElement(name = "LONGITUDE")
	private double longitude;

	@XmlElement(name = "COUNTRY")
	private String country;
	
	@XmlElement(name = "ALTITUDE")
	private int altitude;
	
	private Integer sLevel;
	private Integer wLevel;
	
}
