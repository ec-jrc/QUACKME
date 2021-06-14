package eu.europa.ec.jrc.d5.mars.quackme.rest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;

@SpringBootApplication
@EnableResourceServer
@EnableWebSecurity
public class QuackMeRestApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuackMeRestApplication.class, args);
	}
}
