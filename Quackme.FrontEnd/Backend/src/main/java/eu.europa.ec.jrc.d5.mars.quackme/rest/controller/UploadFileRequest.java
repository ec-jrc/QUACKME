package eu.europa.ec.jrc.d5.mars.quackme.rest.controller;

import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.QuackmeRegion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadFileRequest {
  
  private QuackmeRegion region;
  
  private String fileContent;
  
  private String fileName;

}
