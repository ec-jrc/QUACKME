package eu.europa.ec.jrc.d5.mars.quackme.rest.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;

@Configuration
public class ResourceServerConfiguration extends ResourceServerConfigurerAdapter {

	@Override
	public void configure(HttpSecurity http) throws Exception {
			http.cors().and()
				.authorizeRequests()
				.antMatchers("/actuator/**")
				.permitAll()
					//.antMatchers("/test")
					.antMatchers("/**")
					.permitAll()
				.anyRequest()
				.authenticated();
	}
}
