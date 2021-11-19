package eu.europa.ec.jrc.d5.mars.quackme.rest.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.Temporal;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import eu.europa.ec.jrc.d5.mars.quackme.rest.controller.QuackmeManagerController;
import eu.europa.ec.jrc.d5.mars.quackme.rest.controller.UploadFileRequest;
import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.QuackmeRegion;
import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.StepKind;

@Component
public class FileUploadService {

  private static final DateTimeFormatter yyyyMMdd =
      DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);

  private static final String FLOW_ID = "$flowId";
  private static final String FILE_NAME = "$fileName";
  private static final String DATE = "$date";
  
  @Value("${i.mg.file.name}")
  private String imgFileName;
  
  @Value("${i.mg.path}")
  private String pathToImgFile;

  @Value("${data.source.bucket}")
  private String dataSourceBucket;

  @Autowired
  private QuackmeManagerController controller;

  public void handleIncomingFile(UploadFileRequest fileRequest) {

  }

  private LocalDate getDateFromFileName(String fileName) {
    return LocalDate.parse(StringUtils.split(fileName, ".")[2], yyyyMMdd);
  }

  private void sendRequestToQuackmeManagerToRunWeakChecks(String flowId) {
    controller.updateFlowStep(flowId, StepKind.RUN_WEAK_CHECKS_FOR_CURRENT_DATE);
  }

  private ByteArrayOutputStream extractractStreamFromMultipartFile(String file) {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
        out.write(file.getBytes());
      return out;
    } catch (IOException e) {
      e.printStackTrace();
      throw new RuntimeException("Cannot read content of file");
    }

  }

  private String generateFlowId(QuackmeRegion region, LocalDate date) {
    ZonedDateTime creationTime = ZonedDateTime.now(ZoneId.of("UTC"));
    ZonedDateTime dateForProcessing = ZonedDateTime.of(date.getYear(), date.getMonthValue(),
        date.getDayOfMonth(), creationTime.getHour(), creationTime.getMinute(),
        creationTime.getSecond(), creationTime.getNano(), creationTime.getZone());
    Temporal temporal = dateForProcessing.plusDays(1).toInstant();
    return region + "_" + temporal.toString();
  }

  private String generatePathToFileBasedOnFileName(String flowId, String fileName) {
    return pathToImgFile.replace(FLOW_ID, flowId).replace(FILE_NAME, fileName);
  }
}
