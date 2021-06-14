package eu.europa.ec.jrc.d5.mars.quackme.rest.filter;

import java.io.IOException;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.GenericFilterBean;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestRejectedFilter extends GenericFilterBean {

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    try {
      chain.doFilter(request, response);
    } catch (RequestRejectedException e) {
      log.warn("The request was rejected because the url was not normalized.", e);
      log.warn("URL that caused problem: {}", ((HttpServletRequest)request).getRequestURL().toString());
      HttpServletResponse errorResponse = (HttpServletResponse) response;
      errorResponse.sendError(HttpServletResponse.SC_BAD_REQUEST,
          "The request was rejected because the URL was not normalized");
    }
  }
}
