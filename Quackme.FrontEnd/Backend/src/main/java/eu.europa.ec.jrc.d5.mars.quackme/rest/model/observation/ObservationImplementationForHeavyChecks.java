package eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

/**
 * 
 * Implementation of Observation abstract class for heavy checks.
 *
 */
@XmlRootElement(name = "Observation")
@XmlAccessorType(XmlAccessType.FIELD)
@Data
@EqualsAndHashCode(callSuper=true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ObservationImplementationForHeavyChecks extends Observation {

	@XmlElement(name = "N")
	@JsonProperty(value = "N")
	private ObservationProperty n;
	
	@XmlElement(name = "L")
	@JsonProperty(value = "L")
	private ObservationProperty l;

	@XmlElement(name = "TN")
	@JsonProperty(value = "TN")
	private ObservationProperty tn;

	@XmlElement(name = "TX")
	@JsonProperty(value = "TX")
	private ObservationProperty tx;

	@XmlElement(name = "FF")
	@JsonProperty(value = "FF")
	private ObservationProperty ff;

	@XmlElement(name = "MVP")
	@JsonProperty(value = "MVP")
	private ObservationProperty mvp;

	@XmlElement(name = "TT06")
	@JsonProperty(value = "TT06")
	private ObservationProperty tt06;

	@XmlElement(name = "TT09")
	@JsonProperty(value = "TT09")
	private ObservationProperty tt09;

	@XmlElement(name = "TT12")
	@JsonProperty(value = "TT12")
	private ObservationProperty tt12;

	@XmlElement(name = "TT15")
	@JsonProperty(value = "TT15")
	private ObservationProperty tt15;

	@XmlElement(name = "TT18")
	@JsonProperty(value = "TT18")
	private ObservationProperty tt18;

	@XmlElement(name = "RH06")
	@JsonProperty(value = "RH06")
	private ObservationProperty rh06;

	@XmlElement(name = "RH09")
	@JsonProperty(value = "RH09")
	private ObservationProperty rh09;

	@XmlElement(name = "RH12")
	@JsonProperty(value = "RH12")
	private ObservationProperty rh12;

	@XmlElement(name = "RH15")
	@JsonProperty(value = "RH15")
	private ObservationProperty rh15;

	@XmlElement(name = "RH18")
	@JsonProperty(value = "RH18")
	private ObservationProperty rh18;

	@XmlElement(name = "VPD")
	@JsonProperty(value = "VPD")
	private ObservationProperty vpd;

	@XmlElement(name = "SNOW")
	@JsonProperty(value = "SNOW")
	private ObservationProperty snow;

	@XmlElement(name = "VIS")
	@JsonProperty(value = "VIS")
	private ObservationProperty vis;

	@XmlElement(name = "SLOPE")
	@JsonProperty(value = "SLOPE")
	private ObservationProperty slope;

	@XmlElement(name = "MRAD")
	@JsonProperty(value = "MRAD")
	private ObservationProperty mrad;

	@XmlElement(name = "MSUN")
	@JsonProperty(value = "MSUN")
	private ObservationProperty msun;

	@XmlElement(name = "RRR")
	@JsonProperty(value = "RRR")
	private ObservationProperty rrr;

	@XmlElement(name = "SOIL")
	@JsonProperty(value = "SOIL")
	private ObservationProperty soil;

	@XmlElement(name = "ANGRAD")
	@JsonProperty(value = "ANGRAD")
	private ObservationProperty angrad;

	@XmlElement(name = "APRAD")
	@JsonProperty(value = "APRAD")
	private ObservationProperty aprad;

	@XmlElement(name = "SVKRAD")
	@JsonProperty(value = "SVKRAD")
	private ObservationProperty svkrad;

	@XmlElement(name = "HGVRAD")
	@JsonProperty(value = "HGVRAD")
	private ObservationProperty hgvrad;
	
	@XmlElement(name = "CRAD")
	@JsonProperty(value = "CRAD")
	private ObservationProperty crad;

	@XmlElement(name = "E0")
	@JsonProperty(value = "E0")
	private ObservationProperty e0;

	@XmlElement(name = "ES0")
	@JsonProperty(value = "ES0")
	private ObservationProperty es0;

	@XmlElement(name = "ET0")
	@JsonProperty(value = "ET0")
	private ObservationProperty et0;
	
	@XmlElement(name = "NDT")
	@JsonProperty(value = "NDT")
	private ObservationProperty ndt;
	
    @XmlElement(name = "TND")
    @JsonProperty(value = "TND")
    private ObservationProperty tnd;

}
