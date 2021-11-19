package eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 
 * Implementation of Observation abstract class for weak checks.
 *
 */
@XmlRootElement(name = "Observation")
@XmlAccessorType(XmlAccessType.FIELD)
@Data
@EqualsAndHashCode(callSuper=true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ObservationImplementationForWeakChecks extends Observation {

	@XmlElement(name = "TT")
	@JsonProperty(value = "TT")
	private ObservationProperty tt;

	@XmlElement(name = "TD")
	@JsonProperty(value = "TD")
	private ObservationProperty td;

	@XmlElement(name = "TX1")
	@JsonProperty(value = "TX1")
	private ObservationProperty tx1;

	@XmlElement(name = "TN1")
	@JsonProperty(value = "TN1")
	private ObservationProperty tn1;

	@XmlElement(name = "TX6")
	@JsonProperty(value = "TX6")
	private ObservationProperty tx6;

	@XmlElement(name = "TN6")
	@JsonProperty(value = "TN06")
	private ObservationProperty tn6;

	@XmlElement(name = "TX12")
	@JsonProperty(value = "TX12")
	private ObservationProperty tx12;

	@XmlElement(name = "TN12")
	@JsonProperty(value = "TN12")
	private ObservationProperty tn12;

	@XmlElement(name = "PREC")
	@JsonProperty(value = "PREC")
	private ObservationProperty prec;

	@XmlElement(name = "PR24")
	@JsonProperty(value = "PR24")
	private ObservationProperty pr24;

	@XmlElement(name = "PR06")
	@JsonProperty(value = "PR06")
	private ObservationProperty pr06; 

	@XmlElement(name = "RR")
	@JsonProperty(value = "RR")
	private ObservationProperty rr;
	
	@XmlElement(name = "TR")
	@JsonProperty(value = "TR")
	private ObservationProperty tr;
	
	@XmlElement(name = "SNOW")
	@JsonProperty(value = "SNOW")
	private ObservationProperty snow;

	@XmlElement(name = "DIR")
	@JsonProperty(value = "DIR")
	private ObservationProperty dir;

	@XmlElement(name = "FF")
	@JsonProperty(value = "FF")
	private ObservationProperty ff;

	@XmlElement(name = "N")
	@JsonProperty(value = "N")
	private ObservationProperty n;
	
	@XmlElement(name = "L")
	@JsonProperty(value = "L")
	private ObservationProperty l;

	@XmlElement(name = "RD")
	@JsonProperty(value = "RD")
	private ObservationProperty rd;

	@XmlElement(name = "RD24")
	@JsonProperty(value = "RD24")
	private ObservationProperty rd24;

	@XmlElement(name = "AP")
	@JsonProperty(value = "AP")
	private ObservationProperty ap;
	
	@XmlElement(name = "QFF")
	@JsonProperty(value = "QFF")
	private ObservationProperty qff;

	@XmlElement(name = "SH")
	@JsonProperty(value = "SH")
	private ObservationProperty sh;

	@XmlElement(name = "SH24")
	@JsonProperty(value = "SH24")
	private ObservationProperty sh24;

	@XmlElement(name = "VIS")
	@JsonProperty(value = "VIS")
	private ObservationProperty vis;

	@XmlElement(name = "RH")
	@JsonProperty(value = "RH")
	private ObservationProperty rh;

	@XmlElement(name = "D_E")
	@JsonProperty(value = "D_E")
	private ObservationProperty d_e;

	@XmlElement(name = "D_RH")
	@JsonProperty(value = "D_RH")
	private ObservationProperty d_rh;

	@XmlElement(name = "D_VPD")
	@JsonProperty(value = "D_VPD")
	private ObservationProperty d_vpd;

	@XmlElement(name = "D_SLOPE")
	@JsonProperty(value = "D_SLOPE")
	private ObservationProperty d_slope;

	@XmlElement(name = "SOIL")
	@JsonProperty(value = "SOIL")
	private ObservationProperty soil;

}
