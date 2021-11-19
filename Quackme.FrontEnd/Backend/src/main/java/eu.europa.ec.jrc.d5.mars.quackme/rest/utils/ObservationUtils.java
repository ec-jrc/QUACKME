package eu.europa.ec.jrc.d5.mars.quackme.rest.utils;

import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.Observation;
import eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation.ObservationProperty;
import lombok.Builder;
import lombok.Data;

import java.util.Arrays;
import java.util.stream.Stream;

public class ObservationUtils {

    /**
     * Produces list of {@link  ObservationProperty} used in `o`
     */
    public static Stream<ObservationPropertyInfo> observationPropertiesStream(Observation o) {
        return Arrays.stream(o.getClass().getDeclaredFields())
                .map( f -> {
                    f.setAccessible(true);
                    try {
                        return ObservationPropertyInfo.builder()
                                .property((ObservationProperty) f.get(o))
                                .propertyName(f.getName())
                                .build();
                    } catch (IllegalArgumentException | IllegalAccessException e) {
                        throw new RuntimeException(e);
                    }
                });
    }

    @Data
    @Builder
    public static class ObservationPropertyInfo {
        final String propertyName;
        final ObservationProperty property;
    }
}
