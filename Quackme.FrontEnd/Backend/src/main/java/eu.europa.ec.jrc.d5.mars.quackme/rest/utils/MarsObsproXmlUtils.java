package eu.europa.ec.jrc.d5.mars.quackme.rest.utils;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.AbstractObservations;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.station.Station;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.station.Stations;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
public class MarsObsproXmlUtils {

	@Autowired
	private MarsObsproLocalUtils localUtils;

	private static final Map<Class<?>, JAXBContext> CACHED_CONTEXTS = new ConcurrentHashMap<>();

	/**
	 * Method unmarshalls s3 object and creates
	 * 
	 * @param bucketName
	 *            - name of bucket to take file from
	 * @param s3ObjectKey
	 *            - s3 object to unmarshall
	 * @param targetClass
	 *            - a class to conduct unmarshalling for
	 * @return object of target class pointed as parameter
	 */
	@SuppressWarnings("unchecked")
	public <T> T unmarshallS3File(String bucketName, String prefix, String s3ObjectKey, Class<T> targetClass) {
		try {
			JAXBContext jaxbContext = CACHED_CONTEXTS.get(targetClass);
			if (jaxbContext == null) {
				jaxbContext = JAXBContext.newInstance(targetClass);
				CACHED_CONTEXTS.put(targetClass, jaxbContext);
			}
			Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
			String fullyQualifiedFileName = localUtils.getFullyQualifiedOutput(bucketName, prefix, s3ObjectKey, targetClass.getName());
			return (T) jaxbUnmarshaller.unmarshal(localUtils.getFileFromS3BucketAsInputStream(fullyQualifiedFileName));
		} catch (JAXBException e) {
			throw new RuntimeException(e);
		}
	}

	/**
	 * Method marshalls object to xml and returns content as ByteArrayOutputStream
	 * 
	 * @param objectToMarshall
	 *            object which we want to marshall
	 * @param targetClass
	 *            class of object to marshall
	 * @return ByteArrayOutputStream to make it easier to put to s3 bucket
	 */
	public <T> ByteArrayOutputStream marshallS3File(Object objectToMarshall, Class<T> targetClass) {
		try {
			JAXBContext jaxbContext = CACHED_CONTEXTS.get(targetClass);
			if (jaxbContext == null) {
				jaxbContext = JAXBContext.newInstance(targetClass);
				CACHED_CONTEXTS.put(targetClass, jaxbContext);
			}
			Marshaller jaxbMarshaller = createMarshaller(jaxbContext);
			ByteArrayOutputStream baos = new ByteArrayOutputStream();
			jaxbMarshaller.marshal(objectToMarshall, baos);
			return removeEmptyLine(baos);
		} catch (JAXBException e) {
			throw new RuntimeException(e);
		}
	}
	
	private ByteArrayOutputStream removeEmptyLine(ByteArrayOutputStream baos) {
	    byte[] byteArray = Arrays.copyOfRange(baos.toByteArray(), 1, baos.size());
	    ByteArrayOutputStream cuttedBaos = new ByteArrayOutputStream(byteArray.length);
	    cuttedBaos.write(byteArray, 0, byteArray.length);
	    
	    return cuttedBaos;
	}
	
	private Marshaller createMarshaller(JAXBContext jaxbContext) throws JAXBException {
	    Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
        jaxbMarshaller.setProperty(Marshaller.JAXB_ENCODING, "UTF-8");
        jaxbMarshaller.setProperty(Marshaller.JAXB_FRAGMENT, Boolean.TRUE);
        jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
        
        return jaxbMarshaller;
	}

	public <T extends AbstractObservations<?>> T unmarshallObservationsFromS3(String bucketName, String prefix, String s3ObjectKey,
			Class<T> targetClass) {
		return unmarshallS3File(bucketName, prefix, s3ObjectKey, targetClass);
	}
	
	@Cacheable("stations")
	public List<Station> getListOfStations(String bucketName, String prefix, String fileName) {
		log.info("Retrieving cache for key {} {} {}", bucketName, prefix, fileName);
		List<Station> station = unmarshallS3File(bucketName, prefix, fileName, Stations.class).getStations();
		return station;
	}
}
