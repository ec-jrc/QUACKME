package eu.europa.ec.jrc.d5.mars.quackme.rest.manager;

public enum QuackmeRegion {
	
	EUR("europe"), CHN("china");

	private final String regionName;
	
	QuackmeRegion(String regionName) {
        this.regionName = regionName;
    }
	
    public String getRegionName() {
        return regionName;
    }
}
