package eu.europa.ec.jrc.d5.mars.quackme.rest.model.file;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class FlowInfo {
    /** The id of flow this file is associated with. */
    private String flowId;
}
