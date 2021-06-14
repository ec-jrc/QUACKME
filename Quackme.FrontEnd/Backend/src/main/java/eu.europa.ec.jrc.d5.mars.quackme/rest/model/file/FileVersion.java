package eu.europa.ec.jrc.d5.mars.quackme.rest.model.file;

import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileVersion {
	
	private String versionId;
	private Date lastModified;
	private String key;
	/** Id of flow this version is associated with. */
	private String flowId;
}
