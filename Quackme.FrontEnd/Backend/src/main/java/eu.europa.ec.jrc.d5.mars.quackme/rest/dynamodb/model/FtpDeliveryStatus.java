package eu.europa.ec.jrc.d5.mars.quackme.rest.dynamodb.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

//TODO Copy-paste from manager create shared library
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FtpDeliveryStatus {
  private String id;
  private boolean isSfileDeliveredToFtp;
  private boolean isRRRfileDeliveredToFtp;
  private boolean isSfileRedeliveredToFtp;

  public String getId() {
    return id;
  }
  
  public void setId(String id) {
    this.id = id;
  }

  public boolean isSfileDeliveredToFtp() {
    return isSfileDeliveredToFtp;
  }
  
  public void setSfileDeliveredToFtp(boolean isSfileDeliveredToFtp) {
    this.isSfileDeliveredToFtp = isSfileDeliveredToFtp;
  }

  public boolean isRRRfileDeliveredToFtp() {
    return isRRRfileDeliveredToFtp;
  }

  public void setRRRfileDeliveredToFtp(boolean isRRRfileDeliveredToFtp) {
    this.isRRRfileDeliveredToFtp = isRRRfileDeliveredToFtp;
  }
  
  public boolean isSfileRedeliveredToFtp() {
    return isSfileRedeliveredToFtp;
  }
  
  public void setSfileRedeliveredToFtp(boolean isSfileRedeliveredToFtp) {
    this.isSfileRedeliveredToFtp = isSfileRedeliveredToFtp;
  }

}
