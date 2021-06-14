package eu.europa.ec.jrc.d5.mars.quackme.rest.model.file;

import java.util.Arrays;

public enum CheckType {
    WEAK_CHECKS("WeakChecks"),
    HEAVY_CHECKS("HeavyChecks"),
    THRESHOLD_CHECKS("ThresholdChecks");
  
    private String name;
    
    CheckType(final String name) {
        this.name = name;
    }
    
    public String getName() {
        return name;
    }
    
    public static CheckType fromValue(String name) {
        for (CheckType check : values()) {
            if (check.getName().equalsIgnoreCase(name)) {
              return check;
            }
        }
        
        throw new IllegalArgumentException(
            "Unknown enum type " + name + ", Allowed values are " + Arrays.toString(values()));
    }
}
