package eu.europa.ec.jrc.d5.mars.quackme.rest.utils;

import eu.europa.ec.jrc.d5.mars.quackme.rest.manager.QuackmeRegion;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.FlowFileInfo;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.file.FlowInfo;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

import static org.apache.commons.lang3.StringUtils.substringAfter;
import static org.apache.commons.lang3.StringUtils.substringBeforeLast;

@Component
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
public class MarsObsproLocalUtils {
    private static final String GZIP_ENCODING_VALUE = "gzip";

    @Value("${data.source.prefix}")
    private String prefix;

    @Value("${data.source.qmeFolder}")
    private String QMEFolder;

    @Value("${data.source.qmeConfig}")
    private String QMEConfig;

    /**
     * Method converts content of object from s3 bucket into input stream
     * <p>
     * //     * @param bucketName  bucket where desired object is located
     * //     * @param s3ObjectKey - name of desired s3 object
     *
     * @return input stream with object content
     */
    public InputStream getFileFromS3BucketAsInputStream(String filename) {
        log.info("Reading from {}", filename);
        try {
            File file = new File(filename);
            InputStream in = new FileInputStream(file);
            return in;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * Method uploads ByteArrayOutputStream's content as s3Object into s3 bucket.
     *
     * @param bucketName  destination bucket name
     * @param filename    filename to update
     * @param os          output stream with content which we want to store
     */
    public void putObjectIntoS3Bucket(String bucketName, String filename, ByteArrayOutputStream os) {
        final byte[] data;
        try {
            ByteArrayOutputStream byteArrayOutputStream = os;
            try(OutputStream outputStream = new FileOutputStream(filename)) {
                byteArrayOutputStream.writeTo(outputStream);
            }
        } catch (IOException ioe) {
            throw new RuntimeException(ioe);
        }
    }

    public List<FlowInfo> getFlowIdsListFromLocal(QuackmeRegion region) {
        log.info("Getting list directories of flow ids from local region: {}", region);

        //list folder and order
        String pathFiles = QMEFolder + "/" + region;
        var dirs = Stream.of(new File(pathFiles).listFiles())
                .filter(file -> file.isDirectory())
                .map(File::getName)
                .collect(Collectors.toSet());

        List<String> directories = new ArrayList<String>(dirs);
        Collections.sort(directories);

        List<FlowInfo> listOfFlowIds = new LinkedList<FlowInfo>();
        for (String dir : directories) {
            listOfFlowIds.add(new FlowInfo(region + "_" + dir));
        }

        return listOfFlowIds;
    }

    public List<FlowFileInfo> getFlowIdsFilesListFromLocal(String flowId) {
        log.info("Getting list files for flowid {} from local", flowId);

        //list folder and order
        String pathFiles = QMEFolder + "/" + flowId.split("_")[0] + "/" + flowId.split("_")[1];
        var files = Stream.of(new File(pathFiles).listFiles())
                .filter(file ->
                        file.getName().toUpperCase().startsWith("O.KO.") &&
                                file.getName().toLowerCase().endsWith(".xml") &&
                                file.isFile())
                .map(File::getName)
                .collect(Collectors.toSet());

        List<FlowFileInfo> listFlowFileInfo = new ArrayList<>();

        for (String file : files) {
            listFlowFileInfo.add(
                    FlowFileInfo.builder()
                            .flowId(flowId)
                            .name(pathFiles.concat("/").concat(file)).nameSimplified(file.replace(".xml", "")).build());
        }

        return listFlowFileInfo;
    }

    private List<FlowInfo> prepareFlowIdsResponse(List<String> flowIdsInfoList) {
        List<FlowInfo> reversedList = new LinkedList<FlowInfo>();

        Collections.reverse(flowIdsInfoList);

        flowIdsInfoList.forEach(flowId -> {
            reversedList.add(FlowInfo.builder().flowId(flowId).build());
        });

        return reversedList;
    }

    private boolean isObservationFile(String keyName, String prefixWithFlowId) {
        String fileName = keyName.replace(prefixWithFlowId, "").replace("/", "");
        return fileName.startsWith("O.KO.") && fileName.endsWith(".xml");
    }

    public String getFullyQualifiedOutput(String bucketName, String prefix, String filename, String targetClass) {

        String absoluteFile = "";
        String region = "";
        String date = "";

        if (targetClass == "eu.europa.ec.jrc.d5.mars.quackme.rest.model.station.Stations") {
            absoluteFile = QMEConfig.concat("/").concat(filename);
        } else {
            region = prefix.split("_")[0];
            date = prefix.split("_")[1];
            absoluteFile = QMEFolder.concat("/").concat(region).concat("/").concat(date).concat("/").concat(filename);
        }
        return absoluteFile;
    }

    /**
     * Workaround method to extract `flowId` from S3 Object Key. S3 result data are
     * stored under following path 'resuts/flowId/Rest-of-name', so we blindly take
     * the 2nd path component.
     *
     * @param s3ObjectKey the key to parse
     * @return 2nd path component
     */
    public String extractFlowIdFromS3Key(String s3ObjectKey) {
        return s3ObjectKey.split("/")[1];
    }

    /**
     * Workaround, utility method to build info from S3 object. Generally we should
     * not, use this approach as in future there will be a lot files.
     * {@see #extractFlowIdFromS3Key}
     */
    public static FlowFileInfo flowInfoFromS3ObjectName(String s3ObjectName) {
        // TODO Move this method to Utils class
        final String[] nameComponents = s3ObjectName.split("/");
        final String flowAndRestName = substringAfter(s3ObjectName, "/");
        final String restName = substringAfter(flowAndRestName, "/");

        return FlowFileInfo.builder().flowId(nameComponents[1]).name(restName)
                .nameSimplified(substringAfter(substringBeforeLast(restName, "."), "/")).build();
    }
}
