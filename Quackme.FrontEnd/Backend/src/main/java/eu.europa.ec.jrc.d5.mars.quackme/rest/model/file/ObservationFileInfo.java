package eu.europa.ec.jrc.d5.mars.quackme.rest.model.file;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class ObservationFileInfo {
	
	private List<String> referenceDates = new ArrayList<>(2);
	private String checkLevel;
	private String flowId;
}
 