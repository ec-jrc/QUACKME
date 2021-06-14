package eu.europa.ec.jrc.d5.mars.quackme.rest.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Stream;

import eu.europa.ec.jrc.d5.mars.quackme.rest.dynamodb.model.FlowInfoStepKind;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import eu.europa.ec.jrc.d5.mars.quackme.rest.dynamodb.model.FlowInfo;
import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.QuackmeRegion;
import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.StepKind;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.status.RegionsStatusForDate;
import lombok.NonNull;

@Service
public class QuackmeFlowService {

    @Autowired
    private ListFlowsService listFlowsService;

    @Value("${data.source.qmeFolder}")
    private String QMEFolder;

    @Value("${data.source.qmeConfig}")
    private String QMEConfig;

    public StepKind returnFlowLastStep(String flowId) {
        FlowInfo flowInfo = getFlowInfoForFlowId(flowId);
        return flowInfo.getLastFinishedStep().toStepKind();
    }

    public List<RegionsStatusForDate> getListOfRegionStatusesForDate(@NonNull String date) {
        return Arrays.asList(getRegionStatus(QuackmeRegion.EUR, date),
                getRegionStatus(QuackmeRegion.CHN, date));
    }

    private enum qmeStatus {
        WeakChecks,
        HeavyChecks,
        ThresholdChecks,
        S
    }

    private void FilesGeneratedState(FlowInfo flowInfo) {

        //list files generated
        String region = flowInfo.getId().split("_")[0];
        String date = flowInfo.getId().split("_")[1];
        String pathFiles = QMEFolder + "/" + region + "/" + date;

        String[] checks = new String[]{"S", "O.KO.ThresholdChecks.", "O.KO.HeavyChecks.", "O.KO.WeakChecks."};

        flowInfo.setCurrentlyProcessedStep(FlowInfoStepKind.PREPARE_DATA);
        flowInfo.setLastFinishedStep(FlowInfoStepKind.MOS_INPUT);

        for (String check : checks) {

            var fileCheck = Stream.of(new File(pathFiles).listFiles())
                    .filter(file ->
                            (file.getName().toUpperCase().contains((check.concat(date.replace("-", "")).concat(".xml")).toUpperCase())
                                    || (file.getName().toUpperCase().contains((check.concat(date.replace("-", "")).concat(".dat")).toUpperCase()))))
                    .map(File::getName).findFirst();

            if (!fileCheck.isEmpty()) {

                Date dt = new Date();
                SimpleDateFormat formatter = new SimpleDateFormat("HH:mm:ss");
                flowInfo.setCreationTime(formatter.format(dt));

                if (check.contains(qmeStatus.S.toString())) {
                    flowInfo.setCurrentlyProcessedStep(FlowInfoStepKind.COUNT_QUACKME_FLAGS);
                    flowInfo.setLastFinishedStep(FlowInfoStepKind.GENERATE_SFILE);
                    break;
                }

                if (check.contains(qmeStatus.ThresholdChecks.toString())) {
                    flowInfo.setCurrentlyProcessedStep(FlowInfoStepKind.GENERATE_SFILE);
                    flowInfo.setLastFinishedStep(FlowInfoStepKind.RUN_THRESHOLD_CHECKS);
                    break;
                }
                if (check.contains(qmeStatus.HeavyChecks.toString())) {
                    flowInfo.setCurrentlyProcessedStep(FlowInfoStepKind.RUN_THRESHOLD_CHECKS);
                    flowInfo.setLastFinishedStep(FlowInfoStepKind.RUN_HEAVY_CHECKS);
                    break;
                }
                if (check.contains(qmeStatus.WeakChecks.toString())) {
                    flowInfo.setCurrentlyProcessedStep(FlowInfoStepKind.RUN_HEAVY_CHECKS);
                    flowInfo.setLastFinishedStep(FlowInfoStepKind.RUN_WEAK_CHECKS_FOR_CURRENT_DATE);
                    break;
                }
            }
        }
    }

    private FlowInfo getFlowInfoForFlowId(String flowId) {
        FlowInfo flowInfo = new FlowInfo();
        flowInfo.setId(flowId);
        FilesGeneratedState(flowInfo);

        return flowInfo;
//  return dynamoDBService.getFlowInfo(flowId);
    }

    private RegionsStatusForDate getRegionStatus(QuackmeRegion region, @NonNull String date) {
        String flowId = getFlowIdForRegion(date, region);
        if (Objects.isNull(flowId)) {
            return RegionsStatusForDate.builder().region(region.name()).build();
        } else {
            FlowInfo flowInfoForFlowId = getFlowInfoForFlowId(flowId);
            return RegionsStatusForDate.builder().region(region.name()).flowId(flowId)
                    .lastFinishedStep(Optional.ofNullable(flowInfoForFlowId.getLastFinishedStep())
                            .map(Enum::name).orElse(null))
                    .currentlyProcessedStep(Optional.ofNullable(flowInfoForFlowId.getCurrentlyProcessedStep())
                            .map(Enum::name).orElse(null))
                    .build();
        }
    }

    private String getFlowIdForRegion(@NonNull String date, QuackmeRegion region) {

        String pathFiles = QMEFolder + "/" + region + "/" + date;

        if (Files.isDirectory(Paths.get(pathFiles)))
            return region + "_" + date;
        else
            return null;

//    Optional<String> flowId = listFlowsService.listLatestFlows(region).stream()
//        .filter(flow -> flow.getFlowId().contains(date)).map(m -> m.getFlowId()).findFirst();
//    return flowId.isPresent() ? flowId.get() : null;
    }
}
