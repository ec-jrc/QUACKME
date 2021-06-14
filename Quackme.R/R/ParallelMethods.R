#*********************************************************
#   PARALLEL Methods
#
#*********************************************************
library("XML")
library(stringi)

#*********************************************************
# Manage the weak checks methods to run in parallel
# current.obs       [IN]  [Data.Frame]  current observation for the station
# station.code      [IN]  [INT]         station code like integer
# current.date      [IN]  [INT]         elaboration date like integer (YYYYMMDD)
# current.path      [IN]  [STRING]      path of sources
# station.errors    [IN]  [Data.Frame]  data with error
# mos.data          [IN]  [Data.Frame]  MOS data
# RETURN the current observation changed after checks like string with XML format
#*********************************************************
Parallel.WeakChecks.Ellaboration <- function(current.obs, station.code, current.date, current.path, station.errors, mos.data )
{
      # create empty return
      # the return of the method is a matrix with 1 row and 2 columns
      # - the first column contains the data frame with the real data
      # - the second column contains the data frame with the errors details
      # - the third column contains the data frame with the flags for the [Station, Time, Property] for which was identified
      #     an error, was interpolated or was replaced
      data.list <- matrix (list(), nrow = 1, ncol = 3)
      new.errors <- as.data.frame (matrix(nrow = 0, ncol = 7), stringsAsFactors = FALSE)
      prop.flags <- as.data.frame (matrix(nrow = 0, ncol = 4), stringsAsFactors = FALSE)
      colnames (new.errors) <- c ('Station', 'DayTime', 'Property', 'Value', 'Code', 'Level', 'Message')
      colnames (prop.flags) <- c ('Station', 'DayTime', 'Property', 'Flags')
      data.list[[1, 1]] <- current.obs
      data.list[[1, 2]] <- new.errors

      # try to get eventually the flags generate in the previous run for interval 00-06
      if (!is.null(input.flags))
      {
        prop.flags <- subset(input.flags, input.flags$Station == station.code)
      }
      data.list[[1, 3]] <- prop.flags

      # flags management
      source(paste0(current.path, "Flags.Management.R"))

      # load specific modules if are not loaded yet
      if (!exists("Errors.Message.Property", mode="function"))
        source( paste0(current.path, "Errors.Management.R"))

      # load mathematics module for generate specific properties
      source( paste0(current.path, "MathMethods_WeakChecks.R"))

      if (!is.null(current.obs) & nrow(current.obs) > 0)
      {
        data.list <- tryCatch({
          print (paste0('Manage Station:', station.code, ', Date:', current.date, '\n'))

          # merge current data with errors if present
          if (!is.null(station.errors))
          {
            data.list <- Merge.Data.Errors(data.list, station.errors)
          }

          # sort the rows by date inside the date frame
          current.obs <- data.list[[1, 1]]
          current.obs <- current.obs [ order( strptime(data.list[[1, 1]][, "DayTime"], "%Y%m%d%H")), ]
          data.list[[1, 1]] <- current.obs

          ### Start CHECKS
          for (m in 1:nrow(sources.df))
          {
            source.row <- sources.df[m, ]

            print (paste('Date:', current.date, ', Station:', station.code, ' - Start Module: ', source.row$moduleName, ' - ', source.row$moduleMethod ,'\n'))
            data.list <- do.call(as.character(source.row$moduleMethod ),
                                              list(data.list, current.date, station.errors, mos.data))

            print (paste0('Date:', current.date, ', Station:', station.code, ' - End Module:', source.row$moduleName, ' - ', source.row$moduleMethod ,'\n'))
          }

          ### End CHECKS
          return (data.list)
        }
        ,error = function (err)
        {
          print (paste0('Parallel.WeakChecks.Ellaboration[Station:', current.obs[1, "Station"], '] ', err))
          return (data.list)
        })
      }
      else
      {
        print ( paste0('No observations for day:', current.date, ' and station code:', station.code))
      }

    return (data.list)
}

#*********************************************************
# Manage aggregation methods to run in parallel
# current.obs       [IN]  [Data.Frame]  current observation for the station
# station.code      [IN]  [INT]         station code like integer
# current.date      [IN]  [INT]         elaboration date like integer (YYYYMMDD)
# mos.station       [IN]  [Data.Frame]  MOS data for current station
# hourly.flags      [IN]  [Data.Frame]  Hourly flags for current station
# RETURN the aggregation data for current station
#*********************************************************
Parallel.Aggregation.Elaboration <- function(current.obs, station.code, current.date, mos.station, station.flags )
{
  source( paste0(currentPath, "Flags.Management.R"))

  # prepare the structure for the aggregation process
  data.list <- matrix (list(), nrow = 1, ncol = 2)

  # create a data.frame with a column for each property to generate and make it into "CORRECT" status
  #prop.flags <- as.data.frame (matrix(nrow = 1, ncol = length(agg.columns)))
  #colnames(prop.flags) <- agg.columns
  #prop.flags[1, ] <- NA
  #prop.flags[1, "Station"] <- station.code
  #prop.flags[1, "DayTime"] <- format(current.date, "%Y%m%d")
  prop.flags <- as.data.frame(matrix(nrow = 0, ncol = 4))
  colnames(prop.flags) <- c("Station", "DayTime", "Property", "Flags")

  # create a data.frame for daily values
  agg.data <- as.data.frame (matrix(nrow = 1, ncol = length(agg.columns)))
  colnames(agg.data) <- agg.columns
  agg.data[1, "Station"] <- station.code
  agg.data[1, "DayTime"] <- format(current.date, "%Y%m%d")

  # setup the data.list
  data.list[[1, 1]] <- agg.data
  data.list[[1, 2]] <- prop.flags

  s.return <- tryCatch({

    # read the aggregation configurations
    xml.agg <- NULL
    if (!is.null (agg.config)) { xml.agg <- xmlParse(agg.config)}

    # only if exists observation for the couple <station code, current date>
    if (!is.null(current.obs) & nrow(current.obs) > 0)
    {
      print (paste0('Manage Station:', station.code, ', Date:', current.date, '\n'))

      # Start Aggregations for current station
      data.list <- Station.Aggregation(data.list, current.obs, station.flags, station.code, current.date, xml.agg, mos.station)
      # End Aggregation
    }
    else
    {
      print ( paste0('No observations for day:', current.date, ' and station code:', station.code))
    }

    return (data.list)
  }
  ,error = function (err)
  {
    print (paste0('Parallel.Aggregation.Ellaboration[Station:', station.code, '] - Error : ', err, '\n'))
    return (data.list)
  }
  ,warning = function (warn)
  {
    print (paste0('Parallel.Aggregation.Ellaboration[Station:', station.code, '] - Warning: ', warn))
    return (data.list)
  }
  )

  return (s.return)
}

#*********************************************************
# Manage heavy checks methods to run in parallel
# current.obs       [IN]  [DATA.FFRAME]  current observation for the station
# station.code      [IN]  [INT]          station code like integer
# current.date      [IN]  [INT]          elaboration date like integer (YYYYMMDD)
# daily.flags       [IN]  [DATA.FRAME]   station flags
# RETURN the aggregation data for current station
#*********************************************************
Parallel.HeavyChecks.Ellaboration <- function(current.obs, station.code, current.date, current.path) #, d.flags )
{
  # load error & flags module
  source( paste0(current.path, "Errors.Management.R"))
  source( paste0(current.path, "Exceptions.Management.R"))

  # prepare the structure for the aggregation process
  data.list <- matrix (list(), nrow = 1, ncol = 2)

  new.errors <- as.data.frame (matrix(nrow = 0, ncol = 8), stringsAsFactors = FALSE)
  colnames (new.errors) <- c ('Station', 'DayTime', 'Property', 'Value', 'Code', 'Level', 'Message', 'Values')

  #if (is.null(d.flags))
  #{
    #d.flags <- as.data.frame (matrix(nrow = 0, ncol = 4), stringsAsFactors = FALSE)
    #colnames (d.flags) <- c ('Station', 'DayTime', 'Property', 'Flags')
  #}

  data.list[[1, 1]] <- current.obs
  data.list[[1, 2]] <- new.errors
  #data.list[[1, 3]] <- d.flags

  s.return <- tryCatch({
    # only if exists observation for the couple <station code, current date>
    if (!is.null(current.obs) & nrow(current.obs) > 0)
    {
      print (paste0('Manage Station:', station.code, ', Date:', current.date, '\n'))

      # Start the Heavy Checks for current station and date
      for (m in 1:nrow(sources.df))
      {
        source.row <- sources.df[m, ]

        # make the weak checks for wind speed criteria
        print (paste('Date:', current.date, ', Station:', station.code, ' - Start Module: ', source.row$moduleName, ' - ', source.row$moduleMethod ,'\n'))
        data.list <- do.call(as.character(source.row$moduleMethod ),
                             list(data.list, station.code, current.date))

        print (paste0('Date:', current.date, ', Station:', station.code, ' - End Module:', source.row$moduleName, ' - ', source.row$moduleMethod ,'\n'))
      }
    }
    else
    {
      print ( paste0('No observations for day:', current.date, ' and station code:', station.code))
    }

    return (data.list)
  }
  ,error = function (err)
  {
    print (paste0('Parallel.HeavyChecks.Ellaboration - Error : ', err))
    return (data.list)
  }
  ,warning = function (err)
  {
    print (paste0('Parallel.HeavyChecks.Ellaboration - Warning: ', err))
    return (data.list)
  }
  )

  return (s.return)
}

#*********************************************************
# Manage threshold checks methods to run in parallel
# current.obs       [IN]  [Data.Frame]  daily station observations
# station.code      [IN]  [INT]         station code like integer
# current.date      [IN]  [TIME]        elaboration date
# current.path      [IN]  [STRING]      current working path
# agg.properties    [IN]  [VECTOR]      vector with names of properties to manage
# daily.flags       [IN]  [DATA.FRAME]  daily flags for station
# RETURN the aggregation data for current station
#*********************************************************
Parallel.ThresholdChecks.Ellaboration <- function(current.obs, station.code, current.date, current.path, agg.properties) #, d.flags )
{
  # load error & flags module
  source( paste0(current.path, "Errors.Management.R"))

  # prepare the structure for the aggregation process
  new.errors <- as.data.frame (matrix(nrow = 0, ncol = 9), stringsAsFactors = FALSE)
  colnames (new.errors) <- c ('Station', 'DayTime', 'Property', 'Value', 'Code', 'Area', 'Level', 'Message', 'Values')

  #if (is.null(d.flags))
  #{
  #  d.flags <- as.data.frame (matrix(nrow = 0, ncol = 4), stringsAsFactors = FALSE)
  #  colnames (d.flags) <- c ('Station', 'DayTime', 'Property', 'Flags')
  #}

  # status of properties for current station
  #prop.status <- as.data.frame(matrix(nrow = 1, ncol = length(properties.names)), stringsAsFactors = FALSE)
  #colnames(prop.status) <- properties.names
  #prop.status[1, ] <- "C"

  data.list <- list(current.obs, new.errors)#, d.flags, prop.status)

  s.return <- tryCatch({
    # only if exists observation for the couple <station code, current date>
    if (!is.null(current.obs) & nrow(current.obs) > 0)
    {
      print (paste0('Manage Station:', station.code, ', Date:', current.date, '\n'))

      # Start the Threshold Checks for current station and date
      for (m in 1:nrow(sources.df))
      {
        source.row <- sources.df[m, ]

        print (paste('Date:', current.date, ', Station:', station.code, ' - Start Module: ', source.row$moduleName, ' - ', source.row$moduleMethod ,'\n'))
        data.list <- do.call(as.character(source.row$moduleMethod ), list(data.list, station.code, current.date))
        print (paste0('Date:', current.date, ', Station:', station.code, ' - End Module:', source.row$moduleName, ' - ', source.row$moduleMethod ,'\n'))
      }

      # remove wrong values
      #prop.status <- data.list[[4]]
      #station.data <- data.list[[1]]
      #props <- colnames(prop.status)[which(prop.status == "W", arr.ind=T)[, "col"]]
      #if (length(props) > 0)
      #{
        #station.data[1, props] <- NA
      #}

      #new.errors <- data.list[[2]]
      #d.flags    <- data.list[[3]]
    }
    else
    {
      print ( paste0('No observations for day:', current.date, ' and station:', station.code))
    }

    return (data.list)#, d.flags))
  }
  ,error = function (err)
  {
    print (paste0('Parallel.ThresholdChecks.Ellaboration[Station:', station.code, ', Date:', current.date, '] - Error : ', err))
    return (list(current.obs, new.errors)) #, d.flags))
  }
  ,warning = function (warn)
  {
    print (paste0('Parallel.ThresholdChecks.Ellaboration[Station:', station.code, ', Date:', current.date, '] - Warning: ', warn))
    return (list(current.obs, new.errors)) #, d.flags))
  }
  )

  return (s.return)
}
