package eu.europa.ec.jrc.d5.mars.quackme.rest.model.alert;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlRootElement;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@XmlRootElement(name = "ALERT")
@XmlAccessorType(XmlAccessType.FIELD)
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
@NoArgsConstructor
public class Alert {

	@XmlAttribute(name = "Level")
	private String level;

	@XmlAttribute(name = "Property")
	private String property;

	@XmlAttribute(name = "Code")
	private String code;

	@XmlAttribute(name = "Message")
	private String message;

	@XmlAttribute(name = "Values")
	private String values;

	@XmlAttribute(name = "Status")
	private String status;

}
