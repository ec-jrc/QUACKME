#*********************************************************
#  Manage the aggregation formula for a single
#               meteo station
#*********************************************************

#*********************************************************
# The aggregation will be made for a single station
# Parameters :
#  - data.list       [INPUT] [LIST]       - list of data frame for aggregated data and flags
#  - station.data    [INPUT] [DATA.FRAME]	- hourly observation data for a single day
#  - station.flags   [INPUT] [DATA.FRAME] - hourly flags
#  - station.number  [INPUT] [INT] 	      - station number
#  - current.date    [INPUT] [DATE]       - elaboration date
#  - xml.agg         [INPUT] [XML]        - aggregation configuration
#  - mos.station     [INPUT] [DATA.FRAME] - MOS data for current station
#                    [RETURN] [STRING]    - string in XML format with daily aggregated data
#*********************************************************
Station.Aggregation <- function (data.list, station.data, station.flags, station.number, current.date, xml.agg, mos.station)
{
  #load the formula's module
  source(paste0(currentPath, "Aggregation/Aggregation.Formulas.R"))

  result <- tryCatch( {
    # retrieve property configurations
    prop.nodes <- getNodeSet(xml.agg, "//Property")

    # scan all property nodes to manage
    for(pn in prop.nodes)
    {
      prop.name <- xmlValue(getNodeSet(pn, "Name")[[1]])
      prop.fv <- getNodeSet(pn, "FormulaValue")[[1]]

      # call the formula
      fv.return <- Aggregation.RunFormula(prop.fv, station.data, station.flags, current.date, prop.name, data.list, mos.station)

      # check if the calculated value is NA
      if( is.na(fv.return[1]) )
      {
        # check if exist a formula to apply when the calculated value is NA
        fv.na <- getNodeSet(pn, ".//NAFormula/FormulaValue")
        if (length(fv.na) > 0)
        {
          fv.return <- Aggregation.RunFormula(fv.na[[1]], station.data, station.flags, current.date, prop.name, data.list, mos.station)
        }
      }

      # save value to data frame
      data.list[[1]][1, prop.name] <- fv.return[1]

      # add the flag only if the flag was reported
      if (!is.na(fv.return[2])){
        #data.list[[2]][1, prop.name] <- fv.return[2]
        data.list[[2]][ 1 + nrow(data.list[[2]]), ] <- c(station.data[1, "Station"], format(current.date, "%Y%m%d"), prop.name, fv.return[2])
      }
    }

    return (data.list)
  }
  ,error = function (err)
  {
    print (paste0('Station.Aggregation[Station:', station.number, '] - Error : ', err))
    return (data.list)
  }
  )

  return (result)
}

#*********************************************************
# The aggregation will be made for a single station
# Parameters :
#  - xml.formula     [INPUT] [XML]        - xml structure of the formula
#  - station.data    [INPUT] [DATA.FRAME]	- hourly observation data for a single day
#  - current.date    [INPUT] [DATE]       - elaboration date
#  - prop.name       [INPUT] [STRING]     - aggregation property name
#  - day.data        [INPUT] [LIST]       - station day data (observation and flags)
#  - mos.station     [INPUT] [DATA.FRAME] - MOS data for the station
#                    [RETURN] [VECTOR]    - string in XML format with daily aggregated data
#*********************************************************
Aggregation.RunFormula <- function(xml.formula, station.data, hourly.flags, current.date, prop.name, day.data, mos.station)
{
  result <- tryCatch({

    fv.value <- NA
    fv.flags <- NA
    formulaName <- ""

    # check if the formula value if fixed or not
    fv.type <- xmlGetAttr(xml.formula, "Type")

      # FIXED Formula
    if (fv.type == "Fixed")
    {
      formulaName <- "Fixed"

      # search the row for station and date time
      fv.time <- as.integer(xmlGetAttr(xml.formula, "Time"))
      fv.day  <- as.integer(xmlGetAttr(xml.formula, "Day"))
      fv.refProperty <- xmlGetAttr(xml.formula, "ReferenceProperty")
      fv.daytime <- current.date + (fv.day * 24 * 3600) + (fv.time * 3600)

      if (length( idx <- which( strptime(station.data$DayTime, "%Y%m%d%H") == fv.daytime) ) )
      {
        fv.value <- station.data[idx[1], fv.refProperty]
      }

      # check if exists flags for that property at specific time
      if (!is.null(hourly.flags) & nrow(hourly.flags) > 0)
      {
        tmp.flags <- subset(hourly.flags, hourly.flags$Property == fv.refProperty &
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") == fv.daytime)
        if (nrow(tmp.flags) > 0 ) {
          fv.flags <- AggregateFormulaFlags(tmp.flags[, "Flags"])
        }
      }
    }
    else
    {
      # GENERIC Formula
      fv.name <- getNodeSet(xml.formula, "Formula")[[1]]
      formulaName <- xmlValue(fv.name)

      # retrieve the formula attributes
      fv.start <- getNodeSet(xml.formula, "Start")     #Interval start time and day
      fv.end <- getNodeSet(xml.formula, "End")         #Interval end time and day

      # initialize the data.frame
      fv.df <- station.data
      fl.df <- hourly.flags

      # counter for the expected values, where is necessary
      expected.values <- 0

      # retrieve data only for specific interval
      if (!is.null(fv.start) & length(fv.start) > 0)
      {
        start.daytime <- current.date +
          as.integer(xmlGetAttr(fv.start[[1]], "Day")) * 24 * 3600 +
          as.integer(xmlGetAttr(fv.start[[1]], "Time")) * 3600

        fv.df <- subset( fv.df , strptime(fv.df$DayTime, "%Y%m%d%H") >= start.daytime)
        fl.df <- subset( fl.df , strptime(fl.df$DayTime, "%Y%m%d%H") >= start.daytime)
      }

      if (!is.null(fv.end) & length(fv.end) > 0)
      {
        end.daytime <- current.date +
          as.integer(xmlGetAttr(fv.end[[1]], "Day")) * 24 * 3600 +
          as.integer(xmlGetAttr(fv.end[[1]], "Time")) * 3600

        fv.df <- subset( fv.df , strptime(fv.df$DayTime, "%Y%m%d%H") <= end.daytime)
        fl.df <- subset( fl.df , strptime(fl.df$DayTime, "%Y%m%d%H") <= end.daytime)
      }

      # try to identify all SPECIFIC tags
      if (length(fv.start) <= 0  & length(fv.end) <= 0)
      {
        fv.specific <- getNodeSet(xml.formula, "Specific")
        if (!is.null(fv.specific) & length(fv.specific) > 0)
        {
          # get all dates for which retrieve data
          fv.dates <- NULL
          flags.v  <- NULL

          for(n in 1:length(fv.specific))
          {
            sp.times <- unlist(strsplit( xmlGetAttr( fv.specific[[n]], "Time"), "[,]"))
            sp.day   <- as.integer( xmlGetAttr( fv.specific[[n]], "Day"))

            # add the length of specific times to the expected values
            expected.values <- expected.values + length(sp.times)

            for (t in 1:length(sp.times))
            {
              new.date <- current.date + as.integer(sp.times[t]) * 3600 + sp.day * 24 * 3600
              if (is.null(fv.dates))
              {
                fv.dates <- fv.df[strptime(fv.df$DayTime, "%Y%m%d%H") == new.date, ]
                flags.v  <- fl.df[strptime(fl.df$DayTime, "%Y%m%d%H") == new.date, ]
              }
              else {
                fv.dates <- rbind( fv.dates, subset(fv.df, strptime(fv.df$DayTime, "%Y%m%d%H") == new.date))
                flags.v  <- rbind( flags.v, subset(fl.df, strptime(fl.df$DayTime, "%Y%m%d%H") == new.date))
              }
            }
          }

          # replace current data.frame with data.frame of specific dates
          fv.df <- fv.dates
          fl.df <- flags.v
        }
      }

      # retrieve parameter and name of formula to run
      fv.parameter <- xmlGetAttr(xml.formula, "Parameter")

      # flag to indicate where the formula must be apply
      calculate.value <- TRUE

      # create the parameters list
      lp <- list()
      lpCounter <- 1

      if (fv.parameter == 'M')
      {
        # parameter is not array but include the entire data.frame
        if (!is.null(fv.name))
        {
          # add to the list of parameters the entire data table
          lp[[1]] <- fv.df
        }
      }
      else if (fv.parameter == 'V')
      {
        # parameter is column vector

        # get reference property
        fv.refProperty <- xmlGetAttr(xml.formula, "ReferenceProperty")
        if ( !(is.null(fv.refProperty) | fv.refProperty == ''))
        {
          # extract only the column rows and add it to the parameter's list
          fv.col   <- fv.df[, fv.refProperty]
          fl.df <- subset(fl.df, fl.df$Property == fv.refProperty)

          lp[[1]] <- fv.col
        }
      }

      # add flags like constant parameter to the formula method
      lpCounter <- 2
      lp[[2]] <- fl.df

      # apply the formula
      if (calculate.value == TRUE)
      {
        # check for additionally parameters
        params.nodes <- getNodeSet(xml.formula, "Parameter")
        if (!is.null(params.nodes))
        {
          for(pn in params.nodes)
          {
            if (xmlValue(pn) == 'Current.Date')
            {
              lpCounter <- lpCounter + 1
              lp[[lpCounter]] <- current.date
            }

            if (xmlValue(pn) == 'Day.Agg')
            {
              lpCounter <- lpCounter + 1
              lp[[lpCounter]] <- day.data
            }

            if (xmlValue(pn) == 'MOS')
            {
              lpCounter <- lpCounter + 1
              lp[[lpCounter]] <- (if (is.null(mos.station)) NA else mos.station)
            }

            if (xmlValue(pn) == 'Expected.Values')
            {
              lpCounter <- lpCounter + 1
              lp[[lpCounter]] <- expected.values
            }
          }
        }

        # apply the calculation formula and save the value on the node
        fv.results <- do.call(as.character( xmlValue(fv.name) ), lp)
        fv.value <- as.numeric(fv.results[1])
        fv.flags <- fv.results[2]
      }
    }

    # check if necessary to round the value
    rdAttr <- xmlGetAttr(xml.formula, "RoundDigits")
    if (!is.null(rdAttr) & !is.na(fv.value))
    {
      fv.value <- round(fv.value, digits = as.integer(rdAttr))
    }

    return (c(fv.value, fv.flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.RunFormula[', formulaName, ',' , current.date, '] - Error : ', err, '\n'))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.RunFormula[', formulaName, ',' , current.date, '] - Warning: ', warn))
    return (c(NA, NA))
  }
  )

  return (result)
}

#*********************************************************
# Make the temporal interpolation for a specific property relative
# to 24 H of current date
#
# Parameters :
#  - station.obs   [INPUT] [DATA.FRAME]	  - station observation
#  - current.date  [INPUT] [DATETIME]	    - ellaboration date
#  - property      [INPUT] [STRING]       - name of column to interpolate
#  - digits        [INPUT] [INT]          - number of digits to round the value
#  [RETURN] [VECTOR]  - Vector with interpolated data
#*********************************************************
Aggregation.Column.Interpolation.ByInterval <- function(station.obs, current.date, property, digits, start.inter, end.inter, obs.number)
{
  missing.values <- NULL

  result <- tryCatch( {

    # check if the observations are hourly or 3-hour
    is.HourlyObservation <- CheckHourlyObservations(station.obs[, "DayTime"])
    hour.step <- if (is.HourlyObservation) 1 else 3

    # if the number of valid observation into the column are less than 80% the interpolation are not done
    obs.valid.index <- which( !is.na(station.obs[, property]) )
    obs.na.index <- which (is.na(station.obs[, property]))

    #print (paste0('Station no.:', as.character(station.obs[1, "Station"]),
    #              ',Property:', property,
    #              ',Valid index:', as.character( length(obs.valid.index)),
    #              ',NA index:', as.character( length(obs.na.index)),
    #              ',Observations:', as.character(nrow(station.obs))))

    if ( length(obs.na.index > 0) | length(obs.valid.index) < obs.number)
    {
      # not necessary the interpolation
      if ( length(obs.valid.index) != obs.number &
           round(length(obs.valid.index) / obs.number, digits = 1) < 0.8)
      {
        print (paste0('Station no.:', as.character(station.obs[1, "Station"]),
                      ' not enough values to interpolate property ', property,
                      ' for date ', format(current.date, "%Y%m%d")))

        return (NULL)
      }
      # create indexes array and property values array
      missing.index <- c()
      missing.daytime <- c()
      valid.index <- c()
      obs.prop <- c()

      pos.index <- 1
      mis.index <- 0
      val.index <- 0

      # extract valid data for previous day
      pos.daytime <- current.date - 24*3600   # 00 of the previous day
      end.day <- pos.daytime + 23*3600   # 23 of previous day
      while (pos.daytime <= end.day)
      {
        row.d <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == pos.daytime)
        if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
        {
          val.index <- val.index + 1
          valid.index[val.index] <- pos.index
          obs.prop[val.index] <- row.d[1, property]
        }
        else if (pos.daytime >= start.inter & pos.daytime <= end.inter)
        {
          mis.index <- mis.index + 1
          missing.index[mis.index] <- pos.index
          missing.daytime[mis.index] <- format(pos.daytime, "%Y%m%d%H")
        }

        # increment position and daytime
        pos.index <- pos.index + 1
        pos.daytime <- pos.daytime + hour.step * 3600
      }

      #print (paste0('passed prev day', pos.index))

      # extract valid data for current date
      pos.daytime <- current.date
      end.day <- pos.daytime + 23*3600
      while (pos.daytime <= end.day)
      {
        row.d <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == pos.daytime)
        if ( (nrow(row.d) > 0 & !is.na(row.d[1, property])))
        {
          val.index <- val.index + 1
          valid.index[val.index] <- pos.index
          obs.prop[val.index] <- row.d[1, property]
        }
        else if (pos.daytime >= start.inter & pos.daytime <= end.inter)
        {
          # missing observation row or property value is NA
          mis.index <- mis.index + 1
          missing.index[mis.index] <- pos.index
          missing.daytime[mis.index] <- format(pos.daytime, "%Y%m%d%H")
        }

        # increment position and daytime
        pos.index <- pos.index + 1
        pos.daytime <- pos.daytime + hour.step * 3600
      }

      #print ('passed current day')

      # extract valid data for next day
      pos.daytime <- current.date + 24*3600 # 00 of next day
      end.day <- pos.daytime + 23*3600
      max.obs.day <- max ( strptime(station.obs[, "DayTime"], "%Y%m%d%H"))
      if (max.obs.day < end.day & end.inter < end.day & end.inter >= max.obs.day)
      {
        end.day <- end.inter
      }
      while (pos.daytime <= end.day)
      {
        row.d <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") == pos.daytime)
        if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
        {
          val.index <- val.index + 1
          valid.index[val.index] <- pos.index
          obs.prop[val.index] <- row.d[1, property]
        }
        else if (pos.daytime >= start.inter & pos.daytime <= end.inter)
        {
          mis.index <- mis.index + 1
          missing.index[mis.index] <- pos.index
          missing.daytime[mis.index] <- format(pos.daytime, "%Y%m%d%H")
        }

        # increment position and daytime
        pos.index <- pos.index + 1
        pos.daytime <- pos.daytime + hour.step * 3600
      }

      #print (paste0('Total number of values:', as.character(length(obs.prop)), ', Total valid indexes;', as.character(length(valid.index))))

      if (!is.null(missing.index))
      {
        cd.loess <- loess(obs.prop ~ valid.index, span = 0.9, degree = 2)
        cd.predict <- predict(cd.loess, newdata = missing.index)

        # create the missing values data frame
        missing.values <- as.data.frame(matrix(ncol=3, nrow = length(missing.index)))
        colnames(missing.values) <- c("Index", "DayTime", "Value")
        for (m in 1:length(missing.index))
        {
          missing.values[m, ] <- c(missing.index[m], missing.daytime[m], round(cd.predict[m], digits = digits))
        }
      }
    }

    return (missing.values)
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.Column.Interpolation.ByInterval[Station:', station.obs[1, "Station"], 'Property:', property, '] - Error : ', err))
    return (missing.values)
  }
  , warning = function (warn)
  {
    print (paste0('Aggregation.Column.Interpolation.ByInterval[Station:', station.obs[1, "Station"], 'Property:', property, '] - Warning : ', warn))
    return (missing.values)
  }
  )

  return (result)
}

