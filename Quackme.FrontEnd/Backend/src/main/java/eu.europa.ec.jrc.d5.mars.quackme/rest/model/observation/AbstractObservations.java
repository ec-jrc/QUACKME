package eu.europa.ec.jrc.d5.mars.quackme.rest.model.observation;

import java.util.List;

/**
 * The common interface for classes providing list of observations
 *
 * @param <T>
 *            concrete type of observation.
 */
public interface AbstractObservations<T extends Observation> {
	List<T> getObservations();
	
	void setObservations(List<? extends Observation> list);
}
