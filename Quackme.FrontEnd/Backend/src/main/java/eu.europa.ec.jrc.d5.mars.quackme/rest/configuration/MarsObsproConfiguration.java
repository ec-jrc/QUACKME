package eu.europa.ec.jrc.d5.mars.quackme.rest.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class MarsObsproConfiguration {

  @Value("${dynamoDB.tableNamePrefix}")
  private String tablePrefix;

}
