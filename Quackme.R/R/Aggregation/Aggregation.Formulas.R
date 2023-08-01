#*********************************************************
#  Implement the various aggregation formula
#*********************************************************
library(suncalc)

#*********************************************************
# Calculate the mean with 2 digits precision only if at least
# 80% values are valid
# Parameters :
#  - station.data    [INPUT] [VECTOR]	    - hourly observation data for
#                                             a single day and single property
#  - hourly.flags    [INPUT] [DATA.FRAME] - data frame with hourly flags
#  - expected.values [INPUT] [INT]        - counter of expected values
#                    [RETURN] [NUMERIC]   - the calculated value
#*********************************************************
Aggregation.Mean.80 <- function (v.data, hourly.flags, expected.values)
{
  result <- tryCatch({

    agg.value <- NA
    agg.flags <- NA

    if (!is.null(v.data) & length(v.data) > 0)
    {
      # try with values from station.data
      station.values <- which (!is.na(v.data))
      valid.values <- ifelse (expected.values == 0, length(v.data), expected.values)
      if ( round( (length(station.values) / valid.values), digits = 1) >= 0.8)
      {
        agg.value <- mean(v.data, na.rm = TRUE)
        if (!is.null(hourly.flags) & nrow(hourly.flags) > 0 )
        {
          agg.flags <- AggregateFormulaFlags(hourly.flags[, "Flags"])
        }
      }
    }

    return (c(agg.value, agg.flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.Mean.80 - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.Mean.80 - Warning: ', warn))
    return (c(NA, NA))
  })

  return (result);
}

#*********************************************************
# Calculate the sum
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - hourly observation data for
#                                             a single day and single property
#                    [RETURN] [NUMERIC]     - the calculated value
#*********************************************************
Aggregation.Sum <- function (station.data)
{
  agg.value <- NA
  if (!is.null(station.data))
  {
    agg.value <- sum( station.data, na.rm = TRUE)
  }

  # round the value with 2 decimals, if not NA
  if (!is.na(agg.value))
  {
    agg.value <- round(agg.value, digits=2);
  }

  return (agg.value);
}

#*********************************************************
# Calculate the minimum value
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - hourly observation data for
#                                             a single day and single property
#                    [RETURN] [NUMERIC]     - the calculated value
#*********************************************************
Aggregation.Min <- function (station.data)
{
  agg.value <- NA
  if (!is.null(station.data))
  {
    agg.value <- min( station.data, na.rm = TRUE)
  }

  # round the value with 2 decimals, if not NA
  if (!is.na(agg.value))
  {
    agg.value <- round(agg.value, digits=2);
  }

  return (agg.value);
}

#*********************************************************
# Calculate the maximum value
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - hourly observation data for
#                                             a single day and single property
#                    [RETURN] [NUMERIC]     - the calculated value
#*********************************************************
Aggregation.Max <- function (station.data)
{
  agg.value <-NA
  if (!is.null(station.data))
  {
    agg.value <- max( station.data, na.rm = TRUE)
  }

  # round the value with 2 decimals, if not NA
  if (!is.na(agg.value))
  {
    agg.value <- round(agg.value, digits=2);
  }

  return (agg.value);
}

#*********************************************************
# Calculate the VISIBILITY value
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - hourly observation
#                    [RETURN] [NUMERIC]     - the calculated value
#*********************************************************
Aggregation.Visibility <- function (station.data)
{
  result <- tryCatch({
    s.vis <- 0.0
    s.counter <- 0
    if (length(station.data) > 0)
    {
      for (obs in 1:length(station.data))
      {
        c.vis <- as.numeric(as.character(station.data[obs]))
        if ( is.na(c.vis)) next

        s.counter <- s.counter + 1
        if (c.vis <= 50)
        {
          s.vis <- s.vis + c.vis * 0.1
        }
        else if (c.vis <= 80)
        {
          s.vis <- s.vis + (c.vis - 50) * 1.0
        }
        else if (c.vis <= 88)
        {
          s.vis <- s.vis + (c.vis - 74) * 5.0
        }
        else if (c.vis == 89)
        {
          s.vis <- s.vis + 100.0
        }
      }
    }

    t.vis <- NA
    if (s.counter > 2)
    {
      t.vis <- round ( s.vis / s.counter, digits=2) * 10
    }

    return (t.vis)
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.Visibility - Error : ', err))
    return (NA)
  }
  ,warning = function (err)
  {
    print (paste0('Aggregation.Visibility - Warning: ', err))
    return (NA)
  })

  return (result)
}

#*********************************************************
# Calculate the SnowDepth value
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - hourly observation
#  - current.date    [INPUT] [DATETIME]	    - ellaboration date
#                    [RETURN] [NUMERIC]     - the calculated value
#*********************************************************
Aggregation.SnowDepth <- function (station.data, current.date)
{
  # get 06 and 18 daytime
  dt06 <- current.date + 6 * 3600
  dt18 <- current.date + 18 * 3600

  # get snow depth values for 06 and 18 current day
  sd06 <- NA
  sd18 <- NA
  station06 <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt06, ]
  station18 <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt18, ]

  if (length(station06) > 0 )
  {
    sd06 <- as.numeric(station06[1, "SNOW"])
  }
  if (length(station18) > 0)
  {
    sd18 <- as.numeric(station18[1, "SNOW"])
  }

  sd <- NA

  if (!is.na (sd06) & !is.na(sd18))
  {
    sd <- sd06
    if (sd18 > sd06)
    {
      sd <- sd18
    }
  }
  else if (is.na (sd06))
  {
    sd <- sd18
  }
  else if (is.na (sd18))
  {
    sd <- sd06
  }

  return (sd)
}

#*********************************************************
# Calculate the Radiation. The result must have the UOM = MJ/m2
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]   - the entire station data frame with hourly observation
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags for all properties
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#                    [RETURN][VECTOR]       - vector with calculated radiation and corresponding flag
#*********************************************************
Aggregation.RAD <- function(station.data, hourly.flags, current.date)
{
  result <- tryCatch(
    {
      checkFlags <- !is.null(hourly.flags) & (nrow(hourly.flags) > 0)
      dtc <- current.date + 30 * 3600     ## start from 00 of next day
      dt.sunset <- current.date + 18 * 3600  ## until the 18 of current day

      # identify the station data
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      st.dailySun <- Aggregation.DaySunlightTimes(station.coord, current.date)

      dt.sunset <- NA
      if (length(st.dailySun) > 0 & !is.na(st.dailySun$sunset))
      {
        dt.sunset <- strptime(format(st.dailySun$sunset, "%Y%m%d%H"), "%Y%m%d%H")
      }
      else
      {
        print ('Aggregation.RAD - DaySunlinghtTimes - KO')
        print (station.coord)
      }

      RAD   <- NA
      FLAGS <- NA
      if (!is.na(dt.sunset))
      {
        while (dtc >= dt.sunset)
        {
          RD24.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dtc, ]
          #if (length(RD24.DF) > 0 )
          if (nrow(RD24.DF) > 0)
          {
            suppressWarnings( if (!is.na(RD24.DF$RD24))
            {
              # the RD24 is measured in J/cm2/day that will be transformed into MJ/m2/day
              RAD <- as.numeric(RD24.DF$RD24) / 100
              if (checkFlags)
              {
                df.flags <- subset( hourly.flags, hourly.flags$Station == station.data[1, "Station"] &
                                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") == dtc &
                                                  hourly.flags$Porperty == "RD24")
                if (nrow(df.flags) > 0)
                {
                  FLAGS <- df.flags[1, "Flags"]
                }
              }
              break
            })
          }

          # go back for 1 hour
          dtc <- dtc - 3600
        }
      }

      # calculate the radiation using the hourly radiation
      if (is.na(RAD))
      {
        dt.sunrise <- current.date + 6 * 3600
        dt.sunset <- current.date + 21 * 3600
        if ( length(st.dailySun) > 0)
        {
          dt.sunrise <- strptime(format(st.dailySun$sunrise, "%Y%m%d%H"), "%Y%m%d%H")
          dt.sunset <- strptime(format(st.dailySun$sunset, "%Y%m%d%H"), "%Y%m%d%H")
        }

        hours.interval <- abs(as.integer(difftime(dt.sunset, dt.sunrise, units = "hours")))
        rd.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt.sunrise &
                                      strptime(station.data$DayTime, "%Y%m%d%H") <= (dt.sunset + 3600))
        isHourlyObservations <- CheckHourlyObservations(rd.df[, "DayTime"])

        # the total value must be converted from J/cm2 to MJ/m2
        if (isHourlyObservations)
        {
          # check for NA values
          validValues <- which(!is.na(rd.df$RD))
          if (length(validValues) > 0 & round( length(validValues)/hours.interval, digits = 1 ) >= 0.8 )
          {
            RAD <- round ( sum(rd.df$RD, na.rm = TRUE) / 100.0, 2)

            # get the flag
            if (checkFlags)
            {
              df.flags <- subset( hourly.flags, hourly.flags$STation == station.data[1, "Station"] &
                                                strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt.sunrise &
                                                strptime(station.data$DayTime, "%Y%m%d%H") <= (dt.sunset + 3600) &
                                                hourly.flags$Property == "RD")
              FLAGS <- AggregateFormulaFlags(df.flags[, "Flags"])
            }
          }
        }
      }

      return (c(RAD, FLAGS))
    }
    ,error = function (err)
    {
      print (paste0('Aggregation.RAD - Error : ', err))
      return (c(NA, NA))
    }
    ,warning = function (warn)
    {
      print (paste0('Aggregation.RAD - Warning: ', warn))
      return (c(NA, NA))
    })

  return (result)
}


#*********************************************************
# Calculate the sunshine duration
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags for all properties
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#                    [RETURN][VECTOR]       - vector with calculated sunshine and corresponding flag
#*********************************************************
Aggregation.SUN <- function(station.data, hourly.flags, current.date)
{
  result <- tryCatch(
    {
      dtc <- current.date + 30 * 3600     ## start from 06 of next day
      dt.sunset <- current.date + 18 * 3600  ## until the 18 of current day
      checkFlags <- !is.null(hourly.flags) & (nrow(hourly.flags) > 0)

      # identify the station data
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      st.dailySun <- Aggregation.DaySunlightTimes(station.coord, current.date)
      dt.sunset <- NA
      if (length(st.dailySun) > 0 & !is.na(st.dailySun$sunset) )
      {
        dt.sunset <- strptime(format(st.dailySun$sunset, "%Y%m%d%H"), "%Y%m%d%H")
      }

      SUN   <- NA
      FLAGS <- NA
      if (!is.na(dt.sunset))
      {
        while (dtc >= dt.sunset)
        {
          SH24.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dtc, ]
          if (nrow(SH24.DF) > 0 )
          {
            if (!is.na(SH24.DF[1, "SH24"]))
            {
              SUN <- as.numeric(SH24.DF[1, "SH24"])
              if (checkFlags)
              {
                df.flags <- subset( hourly.flags, hourly.flags$Porperty == "SH24" &
                                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") == dtc)
                if (nrow(df.flags) > 0)
                {
                  FLAGS <- df.flags[1, "Flags"]
                }
              }
              break
            }
          }

          # go back for 1 hour
          dtc <- dtc - 3600
        }
      }

      # try to use the sunshine hourly observation between sunrise and sunset if all hourly observation are present
      if (is.na(SUN))
      {

        dt.sunrise <- current.date + 6 * 3600
        dt.sunset <- current.date + 21 * 3600
        if ( length(st.dailySun) > 0)
        {
          if (!is.na(st.dailySun$sunrise))
          {
            dt.sunrise <- strptime(format(st.dailySun$sunrise, "%Y%m%d%H"), "%Y%m%d%H")
          }

          if (!is.na(st.dailySun$sunset))
          {
            dt.sunset <- strptime(format(st.dailySun$sunset, "%Y%m%d%H"), "%Y%m%d%H")
          }
        }

        sun.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt.sunrise &
                                       strptime(station.data$DayTime, "%Y%m%d%H") <= (dt.sunset + 3600))

        if (length(sun.df))
        {
          isHourlyObservations <- CheckHourlyObservations(sun.df[, "DayTime"])
          if (isHourlyObservations)
          {
            NAidx <- which(is.na(sun.df$SH))
            if (length(NAidx) < nrow(sun.df))
            {
              SUN <- sum(as.numeric(sun.df$SH)) / 60
              if (checkFlags)
              {
                df.flags <- subset( hourly.flags, hourly.flags$Property == "SH" &
                                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt.sunrise &
                                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") <= (dt.sunset + 3600))
                FLAGS <- AggregateFormulaFlags(df.flags[, "Flags"])
              }
            }
          }
        }
        #print (paste0('After Hourly:', SUN))
      }

      # calculate the sunshine using the hourly radiation (KJ/mq/h)
      # switch off the calculation of the sunshine from the hourly radiation
      if (FALSE)
      {
        if (is.na(SUN))
        {
          dt.sunrise <- current.date + 6 * 3600
          dt.sunset <- current.date + 21 * 3600
          if ( length(st.dailySun) > 0)
          {
            if (!is.na(st.dailySun$sunrise))
            {
              dt.sunrise <- strptime(format(st.dailySun$sunrise, "%Y%m%d%H"), "%Y%m%d%H")
            }

            if (!is.na(st.dailySun$sunset))
            {
              dt.sunset <- strptime(format(st.dailySun$sunset, "%Y%m%d%H"), "%Y%m%d%H")
            }
          }

          hours.interval <- abs(as.integer(difftime(dt.sunset, dt.sunrise, units = "hours")))
          sh.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt.sunrise &
                                        strptime(station.data$DayTime, "%Y%m%d%H") <= (dt.sunset + 3600))
          isHourlyObservations <- CheckHourlyObservations(sh.df[, "DayTime"])
          if (isHourlyObservations)
          {
            validValues <- which(!is.na(sh.df$RD))
            if (length(validValues) > 0 & round(length(validValues)/hours.interval, digits = 1) >= 0.8)
            {
              # the original hourly observation is measured in J/cm2/h
              # the hourly threshold is 120 W/m2 => 43.2 J/cm2/h
              rd.df <- sh.df[(!is.na(sh.df$RD) & as.numeric(sh.df$RD) >= 43.2), "RD"]
              if (length(rd.df) > 0)
              {
                SUN <- length(rd.df)
                if (checkFlags)
                {
                  df.flags <- subset( hourly.flags, hourly.flags$Property == "RD" &
                                                    strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt.sunrise &
                                                    strptime(hourly.flags$DayTime, "%Y%m%d%H") <= (dt.sunset + 3600))
                  FLAGS <- AggregateFormulaFlags(df.flags[, "Flags"])
                }
              }
            }
          }
        }
      }

      return (c(SUN, FLAGS))
    }
    ,error = function (err)
    {
      print (paste0('Aggregation.SUN - Error[Station:', station.data[1, "Station"], '] : ', err))
      return (c(NA, NA))
    }
    ,warning = function (warn)
    {
      print (paste0('Aggregation.SUN - Warning[Station:', station.data[1, "Station"], ': ', warn))
      return (c(NA, NA))
    })

  return (result)
}


#*********************************************************
# Calculate precipitation
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags for all properties
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#                    [RETURN] [VECTOR]      - Precipitation value and related flag
#*********************************************************
Aggregation.RRR <- function(station.data, hourly.flags, current.date)
{
  result <- tryCatch(
  {
    RRR <- NA
    Flags <- NA
    CheckFlags <- !is.null(hourly.flags) & nrow(hourly.flags) > 0

    # try to identify the 24 hours observation ot 06 of next day
    dt06nd <- current.date + 30 * 3600     # start from 06 of successive day
    dt00nd <- current.date + 24 * 3600     # 00 of next day
    dt06cd <- current.date + 6 * 3600      # 06 of current day
    station06nd <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt06nd, ]
    if (nrow(station06nd) > 0)
    {
      if (!is.na(station06nd[1, "PR24"]))
      {
        RRR <- as.numeric(station06nd[1, "PR24"])
        if (CheckFlags)
        {
          fl.24 <- subset(hourly.flags, hourly.flags$Property == "PR24" &
                                        strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06nd )
          if (nrow(fl.24) > 0)  { Flags <- AggregateFormulaFlags(fl.24[, "Flags"]) }
        }
      }
    }

    # calculate the precipitation using the 6 hours observations for the interval 06 cd - 06 nd
    if (is.na (RRR))
    {
      dt18cd <- current.date + 18 * 3600
      dt12cd <- current.date + 12 * 3600

      RR00.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt00nd, ]
      RR18.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt18cd, ]
      RR12.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt12cd, ]
      if (nrow(RR00.DF) > 0 & nrow(RR18.DF) > 0 & nrow(RR12.DF) > 0 & nrow(station06nd) > 0)
      {
        if (!is.na(RR00.DF[1, "PR06"]) &
              !is.na(RR18.DF[1, "PR06"]) &
                !is.na(RR12.DF[1, "PR06"]) &
                 !is.na(station06nd[1, "PR06"]))
        {
          RRR <- as.numeric(RR12.DF[1, "PR06"]) + as.numeric(RR18.DF[1, "PR06"]) +
                 as.numeric(RR00.DF[1, "PR06"])+ as.numeric(station06nd[1, "PR06"])
          if (CheckFlags)
          {
            fl.06 <- subset(hourly.flags, hourly.flags$Property == "PR06" &
                                         (strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06nd |
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00nd |
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18cd |
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt12cd ))
            if (nrow(fl.06) > 0 ) { Flags <- AggregateFormulaFlags(fl.06[, "Flags"]) }
          }
        }
      }
    }

    # calculate the precipitation like sum of the hourly observations for the interval 06 cd -06 nd
    if (is.na(RRR))
    {
      dt07cd <- current.date + 7 * 3600
      RR1H.DF <- subset( station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt07cd &
                                       strptime(station.data$DayTime, "%Y%m%d%H") <= dt06nd )

      isHourlyObservations <- CheckHourlyObservations(RR1H.DF[, "DayTime"])
      if (isHourlyObservations)
      {
        RR1H.COL <- RR1H.DF[, "PREC"]
        if (length(RR1H.COL[!is.na(RR1H.COL)]) == 24)
        {
          RRR <- sum(RR1H.DF$PREC, na.rm = TRUE)
          if (CheckFlags)
          {
            fl.01 <- subset(hourly.flags, hourly.flags$Property == "PREC" &
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt07cd &
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt06nd)
            if (nrow(fl.01) > 0 ) { Flags <- AggregateFormulaFlags(fl.01[, "Flags"]) }
          }
        }
      }
    }

    # check the PR24 at 00 next day
    if (is.na(RRR))
    {
      station00nd <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt00nd, ]
      if (nrow(station00nd) > 0)
      {
        if (!is.na(station00nd[1, "PR24"]))
        {
          RRR <- as.numeric(station00nd[1, "PR24"])
          if (CheckFlags)
          {
            fl.24 <- subset(hourly.flags, hourly.flags$Property == "PR24" &
                              strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00nd )
            if (nrow(fl.24) > 0)  { Flags <- AggregateFormulaFlags(fl.24[ "Flags"]) }
          }
        }
      }
    }

    # calculate the precipitation using the 6 hours observations for the interval 00 cd - 00 nd
    if (is.na (RRR))
    {
      dt18cd <- current.date + 18 * 3600
      dt12cd <- current.date + 12 * 3600

      RR00nd.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt00nd, ]
      RR18.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt18cd, ]
      RR12.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt12cd, ]
      RR06.DF <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt06cd, ]
      if (nrow(RR06.DF) >0 & nrow(RR12.DF) > 0 & nrow(RR18.DF) > 0 & nrow(RR00nd.DF) > 0)
      {
        if (!is.na(RR06.DF[1, "PR06"]) &
            !is.na(RR18.DF[1, "PR06"]) &
            !is.na(RR12.DF[1, "PR06"]) &
            !is.na(RR00nd.DF[1, "PR06"]))
        {
          RRR <- as.numeric(RR06.DF[1, "PR06"]) + as.numeric(RR12.DF[1, "PR06"]) +
                 as.numeric(RR18.DF[1, "PR06"]) + as.numeric(RR00nd.DF[1, "PR06"])
          if (CheckFlags)
          {
            fl.06 <- subset(hourly.flags, hourly.flags$Property == "PR06" &
                                 (strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00nd |
                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18cd |
                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt12cd |
                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06cd))
            if (nrow(fl.06) > 0 ) { Flags <- AggregateFormulaFlags(fl.06[, "Flags"]) }
          }
        }
      }
    }

    # calculate the precipitation like sum of the hourly observations for the interval 00 cd -00 nd
    if (is.na(RRR))
    {
      RR1H.DF <- subset( station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= (current.date + 1*3600) &
                           strptime(station.data$DayTime, "%Y%m%d%H") <= dt00nd )

      isHourlyObservations <- CheckHourlyObservations(RR1H.DF[, "DayTime"])
      if (isHourlyObservations)
      {
        RR1H.COL <- RR1H.DF[, "PREC"]
        if (length(RR1H.COL[!is.na(RR1H.COL)]) == 24)
        {
          RRR <- sum(RR1H.DF$PREC, na.rm = TRUE)
          if (CheckFlags)
          {
            fl.01 <- subset(hourly.flags, hourly.flags$Property == "PREC" &
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") == (current.date + 1*3600) &
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt00nd)
            if (nrow(fl.01) > 0 ) { Flags <- AggregateFormulaFlags(fl.01[, "Flags"]) }
          }
        }
      }
    }

    # if all algorithms fail try to use RR & TR
    if (is.na(RRR))
    {
      dt06nd <- current.date + 30 * 3600
      dt06cd <- current.date + 06 * 3600
      dt <- dt06nd
      no.checks <- 0
      rr.flags  <- c()
      while (dt > dt06cd)
      {
        row.dt <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt, ]
        #print (dt)
        #print (row.dt)
        no.checks <- no.checks + 1
        if (length(row.dt) > 0)
        {
          if (!is.na(row.dt[1, "TR"]) & !is.na(row.dt[1, "RR"])) break
        }

        dt <- dt - 3 * 3600
      }

      # determine the hour interval to extract data for the algorithm
      hour.interval <- 24
      if (no.checks > 2 & no.checks <= 4)
      {
        hour.interval <- 18
      }
      else if (no.checks > 4 & no.checks <= 6)
      {
        hour.interval <- 12
      }
      else if (no.checks > 6)
      {
        hour.interval <- 0
      }

      #print (paste0('RRR Hour interval;', hour.interval))

      if (hour.interval > 0)
      {
        # get the end of the interval search but not before 06 of current date
        dt.end <- dt - hour.interval * 3600
        if (dt.end < dt06cd )
        {
          dt.end <- dt06cd
        }

        tr <- 12
        while (dt > dt.end)
        {
          # search the interval between the first datetime where RR&TR are values for hour.interval back
          # if the row has TR&RR valued use it and change the RR to the new value, otherwise, if the record missing
          # or the field are not valued get 1/2 tr value (not less than 3)
          row.dt <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt, ]
          #print (row.dt)
          if (length(row.dt) > 0 && !is.na(row.dt[1, "TR"]))
          {
            if (!is.na(row.dt[1, "RR"]))
            {
              if (is.na(RRR))
              {
                RRR <- as.numeric(as.character(row.dt[1, "RR"]))
              }
              else
              {
                RRR <- RRR + as.numeric(as.character(row.dt[1, "RR"]))
              }

              if (!is.null(hourly.flags) & nrow(hourly.flags) > 0)
              {
                fl.rr <- subset(hourly.flags, hourly.flags$Property == "RR" & strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt)
                if (nrow(fl.rr) > 0) { rr.flags <- c(rr.flags, fl.rr[, "Flags"])}
              }
            }

            tr <- as.numeric(as.character(row.dt[1, "TR"]))
          }
          else
          {
            if (tr > 3)
            {
              tr <- tr / 2
            }
          }
          dt <- dt - tr * 3600

          #print (paste0('RRR:', RRR, ', TR:', tr, ', DT:', dt))
        }

        if (!is.na(RRR) & length(rr.flags) > 0)
        {
          Flags <- AggregateFormulaFlags(rr.flags)
        }
      }
    }

    return (c(RRR, Flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.RRR - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.RRR - Warning: ', warn))
    return (c(NA, NA))
  } )

  return (result)
}

#*********************************************************
# Determine if the observation are hourly or not
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the array of time observation
#                    [RETURN] [BOOL]        - TRUE if hourly observation, FALSE else
#*********************************************************
CheckHourlyObservations <- function(station.data)
{
  result <- tryCatch({

    if (length(station.data) < 2 )
    {
      return (FALSE)
    }

    isHourly <- FALSE
    obs <- 1
    for (obs in 1:(length(station.data) - 1))
    {
        actualDayTime <- strptime( station.data [obs],   "%Y%m%d%H")
        nextDayTime   <- strptime( station.data [obs+1], "%Y%m%d%H")

        dd <- as.numeric ( difftime ( nextDayTime, actualDayTime, units = "mins"))
        if (dd %% 180 != 0 & as.integer( format(actualDayTime, '%H')) %% 3 != 0)
        {
          isHourly <- TRUE
          break;
        }
    }

    return (isHourly)
  }
  ,error = function (err)
  {
    print (paste0('CheckHourlyObservations - Error : ', err))
    return (FALSE)
  }
  ,warning = function (warn)
  {
    print (paste0('CheckHourlyObservations - Warning: ', warn))
    return (FALSE)
  })


  return (result)
}

#*********************************************************
# Get the minimum temperature EUROPE
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags data frame
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - mos.station     [INPUT] [DATA.FRAME]   - MOS data for current station
#                    [RETURN] [NUMERIC]     - the value of minimum temperature
#*********************************************************
Aggregation.TN <- function(station.data, hourly.flags, current.date, mos.station)
{
  tn <- NA
  flags <- NA
  checkFlags <- !is.null(hourly.flags) & (nrow(hourly.flags) > 0)
  result <- tryCatch(
  {
    dt06cd <- current.date + 6 * 3600
    dt18pd <- current.date - 06 * 3600

    # check TN12 at 06 UTC current day
    station06cd  <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt06cd)
    if (nrow(station06cd) > 0)
    {
      if (!is.na(station06cd[1, "TN12"]))
      {
        tn <- as.numeric(station06cd[1, "TN12"])
        if (checkFlags)
        {
          flags.df.06 <- subset(hourly.flags, strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06cd &
                                              hourly.flags$Property == "TN12")
          if (nrow(flags.df.06) > 0)
          {
            flags <- flags.df.06[1, "Flags"]
          }
        }
      }
    }

    # check TN12 at 03 UTC current day
    if (is.na(tn))
    {
      dt03cd <- current.date + 3 * 3600
      station03cd  <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt03cd)
      if (nrow(station03cd) > 0)
      {
        if (!is.na(station03cd[1, "TN12"]))
        {
          tn <- as.numeric(station03cd[1, "TN12"])
          if (checkFlags)
          {
            flags.df.03 <- subset(hourly.flags, strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt03cd &
                                    hourly.flags$Property == "TN12")
            if (nrow(flags.df.03) > 0)
            {
              flags <- flags.df.03[1, "Flags"]
            }
          }
        }
      }
    }

    # use the 6h observations
    if (is.na(tn))
    {
      dt12pd <- current.date - 12 * 3600
      dt06pd <- current.date - 18 * 3600
      dt00cd <- current.date + 0*3600

      station12pd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt12pd)
      station18pd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt18pd)
      station06pd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt06pd)
      station00cd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt00cd)

      tn06 <- NA
      if (nrow(station12pd) > 0 )
      {
        if (!is.na(station12pd[1, "TN6"]))
        {
          tn06 <- c(tn06, as.numeric(as.character(station12pd[1, "TN6"])))
        }
      }

      if (nrow(station18pd) > 0 )
      {
        if (!is.na(station18pd[1, "TN6"]))
        {
          tn06 <- c(tn06, as.numeric(as.character(station18pd[1, "TN6"])))
        }
      }

      if (nrow(station06pd) > 0 )
      {
        if (!is.na(station06pd[1, "TN6"]))
        {
          tn06 <- c(tn06, as.numeric(as.character(station06pd[1, "TN6"])))
        }
      }

      if (nrow(station06cd) > 0 )
      {
        if (!is.na(station06cd[1, "TN6"]))
        {
          tn06 <- c(tn06, as.numeric(as.character(station06cd[1, "TN6"])))
        }
      }

      if (nrow(station00cd) > 0 )
      {
        if (!is.na(station00cd[1, "TN6"]))
        {
          tn06 <- c(tn06, as.numeric(as.character(station00cd[1, "TN6"])))
        }
      }

      if (length(tn06) > 0 & length(which(!is.na(tn06))) > 0)
      {
        tn <- min(tn06, na.rm = TRUE)
        if (checkFlags)
        {
          flags.tn6 <- subset(hourly.flags, hourly.flags$Property == "TN6" &
                                          (strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06pd |
                                           strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt12pd |
                                           strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18pd |
                                           strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00cd |
                                           strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06cd))
          flags <- AggregateFormulaFlags(flags.tn6[, "Flags"])
        }
      }
    }

    # try to identify the minimum from the TN1 hourly observations between 18 previous day and 06 current day
    if (is.na(tn) )
    {
      tn.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt18pd &
                                    strptime(station.data$DayTime, "%Y%m%d%H") <= dt06cd)

      # only for hourly observation
      if ( CheckHourlyObservations(tn.df[, "DayTime"]) )
      {
        valid.values = length( which(!is.na(tn.df[, "TN1"])) )
        if ( round((valid.values /13), digits = 1) >= 0.8)
        {
          tn <- min (tn.df[, "TN1"], na.rm = TRUE)
          if (hourly.flags)
          {
            flags.tn1 <- subset(hourly.flags, hourly.flags$Property == "TN1" &
                                              strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt18pd &
                                              strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt06cd)
            flags <- AggregateFormulaFlags(flags.tn1[, "Flags"])
          }
        }
      }
    }

    # try to identify the min from the entire list of hourly observations of air temperature between
    # 18 previous day and 06 current day
    if (is.na(tn))
    {
      tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt18pd &
                                    strptime(station.data$DayTime, "%Y%m%d%H") <= dt06cd)

      if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
      {
          valid.values <- length( which(!is.na(tt.df[, "TT"])) )
          if ( round(( valid.values/13), digits = 1) >= 0.8)
          {
            tn <- min( tt.df[, "TT"], na.rm = TRUE)
            if (checkFlags)
            {
              flags.tt <- subset(hourly.flags, hourly.flags$Property == "TT" &
                                             strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt18pd &
                                             strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt06cd)
              flags <- AggregateFormulaFlags(flags.tt[, "Flags"])
            }
          }
      }
    }

    # MOS Checks
    if (!is.na(tn) & nrow(mos.station) > 0)
    {
      # get the highest TT Value in the interval 06 cd - 18 cd
      tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt18pd &
                                    strptime(station.data$DayTime, "%Y%m%d%H") <= dt06cd)

      # only for hourly observation
      if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
      {
        valid.values <- length(which(!is.na(tt.df[, "TT"])))
        lowest.tt <- c()
        if ( round((valid.values / 13), digits = 1) >= 0.8)
        {
          lowest.tt <- which( tt.df$TT < tn)
        }

        mos.tn <- NA
        mos.idx <- which( strptime(mos.station$DayTime, "%Y%m%d%H") == dt06cd )
        if (length(mos.idx) > 0)
        {
          mos.tn <- if (!is.na(mos.station[mos.idx[1], "TN"])) as.numeric(mos.station[mos.idx[1], "TN"]) else NA
        }

        if (length(lowest.tt) == 1 & !is.na(mos.tn))
        {
          if ( tt.df[lowest.tt[1],"TT"] < mos.tn)
          {
            print(paste0("Station no. ", station.data[1, "Station"]," - TN temperature [", tn, "] replaced by MOS value [", mos.tn, "] for inconsistent TT value [", tt.df[lowest.tt[1], "TT"], "] !" ))
            tn <- mos.tn
            flags <- "R"
          }
        }
      }
    }

    return (c(tn, flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.TN - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.TN - Warning: ', warn))
    return (c(tn, flags))
  } )

  return (result)
}

#*********************************************************
# Get the absolute minimum temperature (D)
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]   - station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags for all properties
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#                    [RETURN][VECTOR]       - vector with calculated radiation and corresponding flag
#*********************************************************
Aggregation.TND <- function(station.data, hourly.flags, current.date)
{
  tn <- NA
  flags <- NA

  result <- tryCatch(
    {
      checkFlags <- !is.null(hourly.flags) & (nrow(hourly.flags) > 0)
      dt12cd <- current.date + 12 * 3600
      dt00nd <- current.date + 24 * 3600
      dt06cd <- current.date + 06 * 3600

      # use 12H observations
      tn12 <- NA
      flags12 <- c()
      station12cd <- subset(station.data,strptime(station.data$DayTime, "%Y%m%d%H") == dt12cd)
      if (nrow(station12cd) > 0)
      {
        if (!is.na(station12cd[1, "TN12"]))
        {
          tn12 <- c(tn12, as.numeric(station12cd[1, "TN12"]))
          if (checkFlags)
          {
            dv.flags12 <- subset(hourly.flags, strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt12cd &
                                               hourly.flags$Property == "TN12")
            if (nrow(dv.flags12) > 0)
            {
              flags12 <- c(flags12, dv.flags12[1, "Flags"])
            }
          }
        }
      }

      station00nd  <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt00nd)
      if (nrow(station00nd) > 0)
      {
        if (!is.na(station00nd[1, "TN12"]))
        {
          tn12 <- c(tn12, as.numeric(station00nd[1, "TN12"]))
          if (checkFlags)
          {
            dv.flags12 <- subset(hourly.flags, hourly.flags$Station == station.data[1, "Station"] &
                                 strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00nd &
                                 hourly.flags$Property == "TN12")
            if (nrow(dv.flags12) > 0)
            {
              flags12 <- c(flags12, dv.flags12[1, "Flags"])
            }
          }
        }
      }

      if (length(tn12) > 0 & length(which(!is.na(tn12))))
      {
        tn <- min (tn12, na.rm = TRUE)
        flags <- AggregateFormulaFlags(flags12)
      }

      # use the 6h observations
      if (is.na(tn))
      {
        dt18cd <- current.date + 18 * 3600

        station06cd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt06cd)
        station18cd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt18cd)

        tn06 <- NA
        if (nrow(station06cd) > 0 )
        {
          if (!is.na(station06cd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station06cd[1, "TN6"])))
          }
        }
        if (nrow(station12cd) > 0 )
        {
          if (!is.na(station12cd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station12cd[1, "TN6"])))
          }
        }
        if (nrow(station18cd) > 0 )
        {
          if (!is.na(station18cd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station18cd[1, "TN6"])))
          }
        }
        if (nrow(station00nd) > 0 )
        {
          if (!is.na(station00nd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station00nd[1, "TN6"])))
          }
        }

        if (length(tn06) > 0 & length(which(!is.na(tn06))))
        {
          tn <- min(tn06, na.rm = TRUE)
          if (checkFlags)
          {
            dv.flags06.4 <- subset(hourly.flags, hourly.flags$Property == "TN6" &
                                                (strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00nd |
                                                 strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18cd |
                                                 strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt12cd |
                                                 strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06cd))
            if (nrow(dv.flags06.4) > 0)
            {
              flags <- AggregateFormulaFlags(dv.flags06.4[, "Flags"])
            }
          }
        }
      }

      dt01cd <- current.date + 1 * 3600
      # try to identify the minimum from the TN1 hourly observations between 01 current day and 00 next day
      if (is.na(tn) )
      {
        tn.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt01cd &
                                      strptime(station.data$DayTime, "%Y%m%d%H") <= dt00nd)

        # only for hourly observation
        if ( CheckHourlyObservations(tn.df[, "DayTime"]) )
        {
          valid.values = length( which(!is.na(tn.df[, "TN1"])) )
          if ( round((valid.values / nrow(tn.df)), digits = 1) >= 0.8)
          {
            tn <- min (tn.df[, "TN1"], na.rm = TRUE)
            if (checkFlags)
            {
              dv.flags.tn1 <- subset(hourly.flags, hourly.flags$Property == "TN1" &
                                                 strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt01cd &
                                                 strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt00cd)
              if (nrow(dv.flags.tn1) > 0)
              {
                flags <- AggregateFormulaFlags(dv.flags.tn1[, "Flags"])
              }
            }
          }
        }
      }

      # try to identify the min from the entire list of hourly observations of air temperature between
      # 01 current day and 00 next day
      if (is.na(tn))
      {
        tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt01cd &
                                      strptime(station.data$DayTime, "%Y%m%d%H") <= dt00nd)

        if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
        {
          valid.values <- length( which(!is.na(tt.df[, "TT"])) )
          if ( round((valid.values / nrow(tt.df)), digits=1) >= 0.8)
          {
            tn <- min( tt.df[, "TT"], na.rm = TRUE)
            if (checkFlags)
            {
              dv.flags.tt <- subset(hourly.flags, hourly.flags$Station == station.data[1, "Station"] &
                                     strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt01cd &
                                     strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt00nd &
                                     hourly.flags$Property == "TN1")
              if (nrow(dv.flags.tt) > 0)
              {
                flags <- AggregateFormulaFlags(dv.flags.tt[, "Flags"])
              }
            }
          }
        }
      }

      return (c(tn, flags))
    }
    ,error = function (err)
    {
      print (paste0('Aggregation.TND - Error : ', err))
      return (c(NA, NA))
    }
    ,warning = function (warn)
    {
      print (paste0('Aggregation.TND - Warning: ', warn))
      return (c(tn, flags))
    } )

  return (result)
}

#*********************************************************
# Get the maximum temperature
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#                    [RETURN] [NUMERIC]     - Maximum temperature
#*********************************************************
Aggregation.TX <- function(station.data, hourly.flags, current.date, mos.station)
{
  tx <- NA
  flags <- NA
  checkFlags <- !is.null(hourly.flags) & nrow(hourly.flags) > 0
  result <- tryCatch( {

    dt12 <- current.date + 12 * 3600
    dt18 <- current.date + 18 * 3600
    dt06s <- current.date + 30 * 3600
    dt00s <- current.date + 24 * 3600

    tx12_18 <- NA
    tx12_06s <- NA

    station18 <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt18, ]
    station06s <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt06s, ]
    station12 <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt12, ]
    station00s <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt00s, ]

    if (length (station18) > 0 )
    {
      tx12_18 <- as.numeric(station18[1, "TX12"])
      if (!is.na(tx12_18))
      {
        tx <- tx12_18
        if (checkFlags)
        {
          flags.tx18 <- subset(hourly.flags, hourly.flags$Property == "TX12" & strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18)
          if (nrow(flags.tx18) > 0)
          {
            flags <- flags.tx18[1, "Flags"]
          }
        }
      }
    }

    # check TX12 at 15 UTC current day
    if (is.na(tx))
    {
      dt15cd <- current.date + 15 * 3600
      station15cd <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt15cd, ]
      if (length(station15cd) > 0)
      {
        if (!is.na(station15cd[1, "TX12"]))
        {
          tx <- as.numeric(station15cd[1, "TX12"])
          if (checkFlags)
          {
            flags.tx18 <- subset(hourly.flags, hourly.flags$Property == "TX12" & strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18)
            if (nrow(flags.tx18) > 0)
            {
              flags <- flags.tx18[1, "Flags"]
            }
          }
        }
      }
    }

    # use the 6 hour observations
    if (is.na(tx) | tx == 0)
    {
      txs <- c()

      dt18 <- current.date + 18 * 3600
      station18 <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt18, ]

      if (length(station12) > 0 & !is.na(station12[1, "TX6"]))
      {
        txs <- c(txs, as.numeric(station12[1, "TX6"]))
      }

      if (length(station18) > 0 & is.na(station18[1, "TX6"]))
      {
        txs <- c(txs, as.numeric(station18[1, "TX6"]))
      }

      if (length(station00s) > 0 & is.na(station00s[1, "TX6"]))
      {
        txs <- c(txs, as.numeric(station00s[1, "TX6"]))
      }

      if (length(txs) > 0 )
      {
        tx <- max(txs)
        if (checkFlags)
        {
          flags.tx6 <- subset(hourly.flags, hourly.flags$Property == "TX6" &
                                           (strptime(hourly.flags$DayTime, "%y%m%d%H") == dt18 |
                                            strptime(hourly.flags$DayTime, "%y%m%d%H") == dt12 |
                                            strptime(hourly.flags$DayTime, "%y%m%d%H") == dt00s))
          if (nrow(flags.tx6))
          {
            flags <- AggregateFormulaFlags(flags.tx6[, "Flags"])
          }
        }
      }
    }

    # use 24 hourly observations
    if (is.na(tx) | tx == 0)
    {
      dt06cd <- current.date + 06 * 3600
      dt18cd <- current.date + 18 * 3600
      tx.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt06cd &
                                    strptime(station.data$DayTime, "%Y%m%d%H") <= dt18cd)

      # only for hourly observation
      if ( CheckHourlyObservations(tx.df[, "DayTime"]) )
      {
        # check if the TN1 column was interpolated
        valid.values = length( which(!is.na(tx.df[, "TX1"])) )
        if ( round((valid.values / 13), digits = 1) >= 0.8)
        {
          tx <- max (tx.df[, "TX1"], na.rm = TRUE)
          if (checkFlags)
          {
            flags.tx1 <- subset(hourly.flags, hourly.flags$Property == "TX1" &
                                            strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt06cd &
                                            strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt18cd)
            if (nrow(flags.tx1) > 0)
            {
              flags <- AggregateFormulaFlags(flags.tx1[, "Flags"])
            }
          }
        }
      }
    }

    # try to identify the max from the entire list of hourly observations of air temperature between
    # 06 and 18 of current day
    if (is.na(tx) | tx == 0)
    {
      dt06cd <- current.date + 6 * 3600
      dt18cd <- current.date + 18 * 3600
      tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt06cd &
                        strptime(station.data$DayTime, "%Y%m%d%H") <= dt18cd)

      # only for hourly observation
      if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
      {
        valid.values <- length(which(!is.na(tt.df[, "TT"])))
        if ( round((valid.values / 13), digits = 1) >= 0.8)
        {
          tx <- max( tt.df[, "TT"], na.rm = TRUE)
          if (checkFlags)
          {
            flags.tt <- subset(hourly.flags, hourly.flags$Property == "TT" &
                                strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt06cd &
                                strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt18cd)
            if (!is.null(flags.tt) & nrow(flags.tt) > 0)
            {
              flags <- AggregateFormulaFlags(flags.tt[, "Flags"])
            }
          }
        }
      }
    }

    # MOS Checks
    if (!is.na(tx) & nrow(mos.station) > 0)
    {
      # get the highest TT Value in the interval 06 cd - 18 cd
      dt06cd <- current.date + 6 * 3600
      dt18cd <- current.date + 18 * 3600
      tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt06cd &
                                    strptime(station.data$DayTime, "%Y%m%d%H") <= dt18cd)

      # only for hourly observation
      if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
      {
        valid.values <- length(which(!is.na(tt.df[, "TT"])))
        higher.tt <- c()
        if ( round((valid.values / 13), digits = 1) >= 0.8)
        {
          higher.tt <- which( tt.df$TT > tx)
        }

        mos.tx <- NA
        mos.idx <- which( strptime(mos.station$DayTime, "%Y%m%d%H") == dt18cd )
        if (length(mos.idx) > 0)
        {
          mos.tx <- if (!is.na(mos.station[mos.idx[1], "TX"])) as.numeric(mos.station[mos.idx[1], "TX"]) else NA
        }

        if (length(higher.tt) == 1 & !is.na(mos.tx))
        {
          if (tt.df[higher.tt[1], "TT"] < mos.tx)
          {
            print(paste0("Station no. ", station.data[1, "Station"], " - TX temperature [", tx, "] replaced by MOS value [", mos.tx, "] for inconsistent TT value [", tt.df[higher.tt[1], "TT"], "] !" ))
            tx <- mos.tx
            flags <- "R"
          }
        }
      }
    }

    return (c(tx, flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.TX - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.TX - Warning: ', warn))
    return (C(tx, flags))
  })

  return (result)
}

#*********************************************************
# Calculate the ANGOT Radiation (KJ/m2/day)
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#                    [RETURN] [NUMERIC]     - Angot radiation value
#*********************************************************
Aggregation.AngotRadiation <- function(station.data, hourly.flags, current.date)
{
  result <- tryCatch( {
    ANGRAD <- NA

    # identify the station data
    station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
    if (nrow(station.coord) > 0 & !is.na(station.coord[1, "Latitude"]))
    {
      # calculate astronomical day length, sin LD, cos LD
      astro.df <- Aggregation.DayLength(station.coord, current.date)
      dayLength <- astro.df[1, "DayLength"]
      sinLD <- astro.df[1, "SinLD"]
      cosLD <- astro.df[1, "CosLD"]
      solarConstant <- astro.df [1, "SolarConstant"]

      # calculate  ANGOT Radiation
      dAob <- sinLD / cosLD
      fDSinB <- 0.0
      if (abs(dAob) < 1.0)
      {
        dFrac <- cosLD * sqrt(1.0 - dAob * dAob) / pi;
        fDSinB <- 3600.0 * (sinLD * dayLength + 24.0 * dFrac);
        ANGRAD <- solarConstant * fDSinB / 1000.0
      }
      else if (dAob > 1.0)
      {
        fDSinB  <- 3600 * (sinLD * 24.0);
        ANGRAD  <- solarConstant * fDSinB / 1000.0
      }
    }
    else
    {
      print (paste0('Aggregation.AngotRadiation => Missing coordinates for station number ', station.data[1, "Station"]))
    }

    return (c(ANGRAD, NA))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.AngotRadiation - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.AngotRadiation - Warning: ', warn))
    return (c(NA, NA))
  })

  return (result)
}

#*********************************************************
# Calculate the Angstrom-Prescott Radiation (KJ/m2/day)
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - day.list        [INPUT] [MATRIX]       - matrix with 2 lists (daily aggregated data, daily flags)
#                    [RETURN] [NUMERIC]     - Angstrom Prescott radiation value
#*********************************************************
Aggregation.AngstromPrescottRadiation <- function(station.data, hourly.flags, current.date, data.list)
{
  result <- tryCatch({
    # variables initialization
    Measured.Sunshine <- NA
    Angstrom.Radiation <- NA
    Angot.Radiation <- NA
    Flags <- NA

    day.obs   <- data.list[[1]]
    day.flags <- data.list[[2]]

    # retrieve Measured Sunshine & ANGOT Radiation
    Measured.Sunshine <- as.numeric(day.obs[1, "MSUN"])
    Angot.Radiation   <- as.numeric(day.obs[1, "ANGRAD"])

    # calculate Angstrom-Prescott Radiation
    if (!is.na(Measured.Sunshine) &!is.na(Angot.Radiation))
    {
      # identify the station data
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      if (length(station.coord) > 0 & !is.na(station.coord[1, "Latitude"]))
      {
        # calculate the astronomical day length, sin LD, cos LD
        astro.df <- Aggregation.DayLength(station.coord, current.date)
        DayLength <- astro.df[1, "DayLength"]

        if (!is.na(DayLength))
        {
          Const.AngstromA <- as.numeric(as.character(station.coord[1, "AngstromA"]))
          Const.AngstromB <- as.numeric(as.character(station.coord[1, "AngstromB"]))

          Angstrom.Radiation <- Angot.Radiation * (Const.AngstromA + Const.AngstromB * (Measured.Sunshine / DayLength))

          # manage flags
          df.flags <- day.flags[day.flags$Property == "MSUN" | day.flags$Property == "ANGRAD", ]
          if (nrow(df.flags) > 0)
          {
            Flags <- paste(unique(df.flags[, "Flags"]), collapse = ",")
          }
        }
      }
      else
      {
        print (paste0('Aggregation.AngstromPrescottRadiation => Missing coordinates for station number ', station.data[1, "Station"]))
      }
    }

    #print (paste0('ANGSTROM:', Angstrom.Radiation, ', ANGOT:', Angot.Radiation, ',MSUN:', Measured.Sunshine))

    return (c(Angstrom.Radiation, Flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.AngstromPrescottRadiation - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.AngstromPrescottRadiation - Warning: ', warn))
    return (c(NA, NA))
  })

  return (result)
}

#*********************************************************
# Calculate the Supit-Van Kappel Radiation (KJ/m2/day)
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - day.list        [INPUT] [LIST]         - list with data.frame of the day for current station
#                    [RETURN] [NUMERIC]     - Supit-Van Kappel radiation value
#*********************************************************
Aggregation.SupitVanKappelRadiation <- function(station.data, hourly.flags, current.date, day.list)
{
  result <- tryCatch({
    # variables initialization
    Supit.Radiation <- NA
    Angot.Radiation <- NA
    TMAX <- NA
    TMIN <- NA
    Cloud.Cover <- NA
    Flags <- NA

    day.obs   <- day.list[[1]]
    day.flags <- day.list[[2]]

    # retrieve the calculated daily properties need to calculate Supit-Van Kappel radiation
    Angot.Radiation <- as.numeric(day.obs[1, "ANGRAD"])
    TMAX <- as.numeric(day.obs[1, "TX"])
    TMIN <- as.numeric(day.obs[1, "TN"])
    Cloud.Cover <- as.numeric(day.obs[1, "NDT"])

    if (!is.na(Angot.Radiation) & !is.na(TMAX) & !is.na(TMIN) & !is.na(Cloud.Cover))
    {
      # identify the station data
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      if (length(station.coord) > 0)
      {
        Const.SupitA <- as.numeric(as.character(station.coord[1, "SupitA"]))
        Const.SupitB <- as.numeric(as.character(station.coord[1, "SupitB"])) / Const.SupitA
        const.SupitC <- as.numeric(as.character(station.coord[1, "SupitC"])) * 1000.0

        Supit.Radiation <- suppressWarnings(Const.SupitA * Angot.Radiation *
                  ( sqrt( abs(TMAX - TMIN) ) + Const.SupitB * sqrt(1.0 - Cloud.Cover/8.0)) +
                  const.SupitC)

        if (!is.na(Supit.Radiation))
        {
          df.flags <- subset(day.flags, day.flags$Property == "ANGRAD" |
                                        day.flags$Property == "TN" |
                                        day.flags$Property == "TX" |
                                        day.flags$Property == "NDT")

          if (nrow(df.flags) > 0)
          {
             Flags <- paste(unique(df.flags[, "Flags"]), collapse = ",")
          }
          if (Supit.Radiation < 0) { Supit.Radiation <- 0.0 }
        }

      }
      else
      {
        print (paste0('Aggregation.SupitVanKappelRadiation => Missing coordinates for station number ', station.data[1, "Station"]))
      }
    }

    #print (paste0 ('SVKRAD:', Supit.Radiation, ',ANGRAD:', Angot.Radiation, ', TMAX:', TMAX, ', TMIN:', TMIN, ', CC:', Cloud.Cover))

    return (c(Supit.Radiation, Flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.SupitVanKappelRadiation - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.SupitVanKappelRadiation - Warning: ', station.data[1, "Station"], ' -  ' , warn))
    return (c(NA, NA))
  })

  return (result)
}

#*********************************************************
# Calculate the Hargreaves Radiation (KJ/m2/day)
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - day.list        [INPUT] [LIST]         - list with data.frame of the day for current station
#                    [RETURN] [NUMERIC]     - Hargreaves radiation value
#*********************************************************
Aggregation.HargreavesRadiation <- function(station.data, hourly.flags, current.date, day.list)
{
  result <- tryCatch({
    # variables initialization
    TMAX <- NA
    TMIN <- NA
    Angot.Radiation <- NA
    Hargreaves.Radiation <- NA
    Flags <- NA

    day.obs   <- day.list[[1]]
    day.flags <- day.list[[2]]

    # retrieve calculated values
    TMAX <- as.numeric(day.obs[[1, "TX"]])
    TMIN <- as.numeric(day.obs[[1, "TN"]])
    Angot.Radiation <- as.numeric(day.obs[[1, "ANGRAD"]])

    # calculate Hargreaves Radiation
    if (!is.na(TMAX) & !is.na(TMIN) & !is.na(Angot.Radiation))
    {
      # identify the station data
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      if ( length(station.coord) > 0)
      {
        Const.HargreavesA <- as.numeric(as.character(station.coord[1, "HargreavesA"]))
        Const.HargreavesB <- as.numeric(as.character(station.coord[1, "HargreavesB"])) * 1000.0
        Hargreaves.Radiation <- Angot.Radiation * Const.HargreavesA * sqrt(abs(TMAX - TMIN)) + Const.HargreavesB
        if (!is.na(Hargreaves.Radiation) & Hargreaves.Radiation < 0.0) { Hargreaves.Radiation <- 0.0 }

        df.flags <- subset(day.flags, day.flags$Property == "ANGRAD" |
                               day.flags$Property == "TN" |
                               day.flags$Property == "TX" )
        if (nrow(df.flags) > 0)
        {
          Flags <- paste(unique(df.flags[, "Flags"]), collapse = ",")
        }

      }
      else
      {
        print (paste0('Aggregation.HargreavesRadiation => Missing coordinates for station number ', station.data[1, "Station"]))
      }
    }

    #print (paste0('HARGREAVES:', HGVRAD, ', TMAX:', TMAX, ',TMIN:', TMIN))

    return (c(Hargreaves.Radiation, Flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.HargreavesRadiation - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.HargreavesRadiation - Warning: ', warn))
    return (c(NA, NA))
  })

  return (result)
}


#*********************************************************
# Calculate the global radiation for a station and for a specific date
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - day.list        [INPUT] [LIST]         - list with data.frame of the day for current station
#                    [RETURN] [NUMERIC]     - Global radiation value
#*********************************************************
Aggregation.GlobalRadiation <- function(station.data, hourly.flags, current.date, day.list)
{
  result <- tryCatch (
    {
      # local variables
      Measured.Radiation <- NA
      Global.Radiation <- NA
      Flags <- NA

      day.obs   <- day.list[[1]]
      day.flags <- day.list[[2]]

      #retrieve the Measured Radiation
      Measured.Radiation <- as.numeric(day.obs[1, "MRAD"])

      # retrieve the station coordinates
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])

      # If Measured.Radiation is a valid value then return it
      if (!is.na(Measured.Radiation))
      {
        Global.Radiation <- round(Measured.Radiation, digits = 1) * 1000.00
        gr.fl <- day.flags[day.flags$Property == "MRAD", ]
        if (nrow(gr.fl) > 0) { Flags <- gr.fl[1, "MRAD"] }
      }
      else
      {
        # retrieve th Angot.Radiation
        Angot.Radiation <- as.numeric(day.obs[1, "ANGRAD"])

        # check if Angot Radiation is 0 (extreme cases)
        if (!is.na(Angot.Radiation) & Angot.Radiation <= 0.0)
        {
          Global.Radiation <- 0.0
          gr.fl <- subset(day.flags, day.flags$Property == "ANGRAD")
          if (nrow(gr.fl) > 0) { Flags <- gr.fl[1, "ANGRAD"] }
        }
        else
        {
          # retrieve Measured.Sunshine
          Measured.Sunshine <- as.numeric(day.obs[1, "MSUN"])
          #print (paste0('Measure.Sunshine:', Measured.Sunshine))

          # for valid Measured sunshine use the Angstrom Radiation values
          if (!is.na(Measured.Sunshine))
          {
            # retrieve the Angstrom Radiation
            AngstromPrescott.Radiation <- as.numeric(day.obs[1, "APRAD"])
            if (!is.na(AngstromPrescott.Radiation))
            {
              Global.Radiation <- AngstromPrescott.Radiation
              gr.fl <- subset(day.flags, day.flags$Property == "APRAD")
              if (nrow(gr.fl) > 0) { Flags <- gr.fl[1, "APRAD"] }
              #print (paste0('Global.Radiation for Measured.Sunshine:', Global.Radiation))
            }
          }
          else
          {
            # retrieve the MAXIMUM and MINIMUM Temperature
            TMAX <- as.numeric(day.obs[1, "TX"])
            TMIN <- as.numeric(day.obs[1, "TN"])
            #print (paste0('TMAX:', TMAX, ', TMIN;', TMIN))

            if (!is.na(TMAX) & !is.na(TMIN))
            {
              # retrieve Mean Cloud Cover Day Time
              Cloud.Cover <- round(as.numeric(day.obs[1, "NDT"]), digits = 1)

              AngstromA = as.numeric(as.character(station.coord[1, "AngstromA"]))
              AngstromB = as.numeric(as.character(station.coord[1, "AngstromB"]))

              if (!is.na(Cloud.Cover))
              {
                # retrieve SupitVanKappel Radiation
                Suppit.Radiation <- as.numeric(day.obs[1, "SVKRAD"])
                if (!is.na(Suppit.Radiation))
                {
                  Global.Radiation = min(max(0.0, Suppit.Radiation), Angot.Radiation * (AngstromA + AngstromB))
                  gr.fl <- subset(day.flags, day.flags$Property == "SVKRAD")
                  if (nrow(gr.fl) > 0) { Flags <- gr.fl[1, "SVKRAD"] }
                }
              }
              else
              {
                # retrieve Hargreaves Radiation
                Hargreaves.Radiation <- as.numeric(day.obs[1, "HGVRAD"])
                if (!is.na(Hargreaves.Radiation))
                {
                  Global.Radiation = min(max(0.0, Hargreaves.Radiation), Angot.Radiation * (AngstromA + AngstromB))
                  gr.fl <- subset(day.flags, day.flags$Property == "HGVRAD")
                  if (nrow(gr.fl) > 0) { Flags <- gr.fl[1, "HGVRAD"] }
                }
              }
            }
          }
        }
      }

      #print (paste0('Global.Radiation:', Global.Radiation))
      return  (c(Global.Radiation, Flags))
    }
    ,error = function (err)
    {
      print (paste0('Aggregation.GlobalRadiation[Station=', station.data[1, "Station"], '] - Error : ', err))
      return (c(NA, NA))
    }
    ,warning = function (warn)
    {
      print (paste0('Aggregation.GlobalRadiation - Warning: ', warn))
      return (c(NA, NA))
    })

  return (result)
}

#*********************************************************
# Calculate the Penman potential evaporation from a free water surface
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - day.list        [INPUT] [LIST]         - list with data.frame of the day for current station
#                    [RETURN] [NUMERIC]     - Penman potential evaporation value
#*********************************************************
Aggregation.E0 <- function(station.data, hourly.flags, current.date, day.list)
{
    result <- tryCatch({
      # variables initialization
      E0      <- NA
      Flags   <- NA
      day.obs   <- day.list[[1]]
      day.flags <- day.list[[2]]

      # retrieve all daily properties already calculate
      TMAX    <- as.numeric(day.obs[1, "TX"])
      TMIN    <- as.numeric(day.obs[1, "TN"])
      MVP     <- as.numeric(day.obs[1, "MVP"])
      MSUN    <- as.numeric(day.obs[1, "MSUN"])
      FF      <- as.numeric(day.obs[1, "FF"])
      ANGRAD  <- as.numeric(day.obs[1, "ANGRAD"])
      CRAD    <- as.numeric(day.obs[1, "CRAD"])

      if (!is.na(TMAX) & !is.na(TMIN) & !is.na(MVP) & !is.na(FF))
      {
        # constants definitions
        C.Goudriaan       <- 238.102
        C.BruntE          <- 0.1
        C.BruntF          <- 0.9
        C.BU              <- 0.54
        C.Boltzmann       <- 4.9e-3
        C.Gamma           <- 0.67
        C.ReflCoeffWater  <- 0.05       #reflection coeff of water
        C.LatentHeat      <- 2.45e6     #Latent heat of vaporization of water
        C.Ten2Two         <- log(2.0/0.033)/log(10.0/0.033)

        RelativeSunshineDuration <- 0.0

        # retrieve station coordinates
        station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
        if ( length(station.coord) <= 0)
        {
          print (paste0('Missing coordinates for station number ', station.data[1, "Station"]))
          return (NA)
        }

        # calculate the astronomical day length, sin LD, cos LD
        astro.df <- Aggregation.DayLength(station.coord, current.date)
        DayLength <- astro.df[1, "DayLength"]

        if (abs(as.numeric(as.character(station.coord[1, "Latitude"]))) < 45.0)
        {
          C.BruntE <- 0.3
          C.BruntF <- 0.7
        }

        if (DayLength > 0.0)
        {
          if (!is.na(MSUN) & MSUN > 0)
          {
            RelativeSunshineDuration <- MSUN / DayLength
          }
          else if (!is.na(ANGRAD) & !is.na(CRAD))
          {
            RelativeSunshineDuration <- ((CRAD/ANGRAD) - as.numeric(as.character(station.coord[1, "AngstromA"]))) /
                                            as.numeric(as.character(station.coord[1, "AngstromB"]));
          }
        }

        # calculate average temperature
        TMean <- (TMAX + TMIN) / 2
        TMeanGoudriaan <- as.numeric(TMean + C.Goudriaan)
        #print (paste0('RSHDUR:', RelativeSunshineDuration, ', TMean:', TMean, ', TMeanG:', TMeanGoudriaan))

        # calculate saturation vapour pressure and vapour pressure
        SaturationVapourPressure <- as.numeric(6.10588 * exp(17.32491 * TMean / TMeanGoudriaan))
        VapourPressure <- min(MVP, SaturationVapourPressure)

        # calculate DELTA
        Delta <- (C.Goudriaan * 17.32491 * SaturationVapourPressure) / (TMeanGoudriaan * TMeanGoudriaan)

        # calculate RNL
        Rnl <- C.Boltzmann *
               ((TMean + 273.0) ** 4) *
               (0.56 - 0.08 * sqrt(VapourPressure)) *
               (C.BruntE + C.BruntF * RelativeSunshineDuration)

        # calculate RNW, RNS, RNC (Absorbed radiation)
        Rnw <- ((1.0 - C.ReflCoeffWater) * (CRAD*1000.0) - Rnl) / C.LatentHeat

        # calculate evaporative demand of the atmosphere (isothermal evaporation)
        Ea  <- 0.26 * (SaturationVapourPressure - VapourPressure) * (0.5 + C.BU * FF * C.Ten2Two)

        #print ( paste0('Delta:', Delta, ', Rnl:',Rnl, ', Rnw:', Rnw, ', Ea:', Ea))

        # calculate the final result
        E0  <- (Delta * Rnw +  C.Gamma * Ea) / (Delta + C.Gamma)
        if (!is.na(E0) & E0 < 0.0)
        {
          E0 <- 0.0
        }

        dv.fl <- subset(day.flags, day.flags$Property == "TN" |
                          day.flags$Property == "TX" |
                          day.flags$Property == "FF" |
                          day.flags$Property == "MVP" |
                          day.flags$Property == "MSUN" |
                          day.flags$Property == "CRAD" |
                          day.flags$Property == "ANGRAD")
        if (nrow(dv.fl) > 0) { Flags <- paste(unique(dv.fl[, "Flags"]), collapse = ",") }
      }

      #print (paste0('E0:', E0, ', TMAX:', TMAX, ',TMIN:', TMIN))

      return (c(E0, Flags))
    }
    ,error = function (err)
    {
      print (paste0('Aggregation.E0 - Error : ', err))
      return (c(NA, NA))
    }
    ,warning = function (warn)
    {
      print (paste0('Aggregation.E0 - Warning: ', warn))
      return (c(NA, NA))
    })

    return (result)
}

#*********************************************************
# Calculate the Penman potential evaporation from a moist bare soil surface
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - day.list        [INPUT] [LIST]         - list with data.frame of the day for current station
#                    [RETURN] [NUMERIC]     - Penman potential evaporation value
#*********************************************************
Aggregation.ES0 <- function(station.data, hourly.flags, current.date, day.list)
{
  result <- tryCatch({
    # variables initialization
    ES0     <- NA
    Flags   <- NA
    day.obs   <- day.list[[1]]
    day.flags <- day.list[[2]]

    # retrieve all daily properties already calculate
    TMAX    <- as.numeric(day.obs[1, "TX"])
    TMIN    <- as.numeric(day.obs[1, "TN"])
    MVP     <- as.numeric(day.obs[1, "MVP"])
    MSUN    <- as.numeric(day.obs[1, "MSUN"])
    FF      <- as.numeric(day.obs[1, "FF"])
    ANGRAD  <- as.numeric(day.obs[1, "ANGRAD"])
    CRAD    <- as.numeric(day.obs[1, "CRAD"])

    if (!is.na(TMAX) & !is.na(TMIN) & !is.na(MVP) & !is.na(FF))
    {
      # constants definitions
      C.Goudriaan       <- 238.102
      C.BruntE          <- 0.1
      C.BruntF          <- 0.9
      C.BU              <- 0.54
      C.Boltzmann       <- 4.9e-3
      C.Gamma           <- 0.67
      C.ReflCoeffSoil   <- 0.15       #soil reflection coefficient
      C.LatentHeat      <- 2.45e6     #Latent heat of vaporization of water
      C.Ten2Two         <- log(2.0/0.033)/log(10.0/0.033);

      RelativeSunshineDuration <- 0.0

      # retrieve station coordinates
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      if ( length(station.coord) <= 0)
      {
        print (paste0('Missing coordinates for station number ', station.data[1, "Station"]))
        return (c(NA, NA))
      }

      # calculate the astronomical day length, sin LD, cos LD
      astro.df <- Aggregation.DayLength(station.coord, current.date)
      DayLength <- astro.df[1, "DayLength"]

      if (abs(as.numeric(as.character(station.coord[1, "Latitude"]))) < 45.0)
      {
        C.BruntE <- 0.3
        C.BruntF <- 0.7
      }

      if (DayLength > 0.0)
      {
        if (!is.na(MSUN) & MSUN > 0)
        {
          RelativeSunshineDuration <- MSUN / DayLength
        }
        else if (!is.na(CRAD) & !is.na(ANGRAD))
        {
          RelativeSunshineDuration = ( ( CRAD/ANGRAD) - as.numeric(as.character(station.coord[1, "AngstromA"])) ) /
            as.numeric(as.character(station.coord[1, "AngstromB"]));
        }
      }

      # calculate average temperature
      TMean <- (TMAX + TMIN) / 2
      TMeanGoudriaan <- TMean + C.Goudriaan

      # calculate saturation vapour pressure and vapour pressure
      SaturationVapourPressure <- 6.10588 * exp(17.32491 * TMean / TMeanGoudriaan)
      VapourPressure <- min(MVP, SaturationVapourPressure)

      # calculate DELTA
      Delta <- (C.Goudriaan * 17.32491 * SaturationVapourPressure) / (TMeanGoudriaan * TMeanGoudriaan)

      # calculate RNL
      Rnl <- C.Boltzmann * ((TMean + 273.0)^4) *
          (0.56 - 0.08 * sqrt(VapourPressure)) *
          (C.BruntE + C.BruntF * RelativeSunshineDuration);

      # calculate RNW, RNS, RNC (Absorbed radiation)
      Rns <- ((1.0 - C.ReflCoeffSoil)*(CRAD*1000.0) - Rnl) / C.LatentHeat

      # calculate evaporative demand of the atmosphere (isothermal evaporation)
      Ea  = 0.26 * (SaturationVapourPressure - VapourPressure) * (0.5 + C.BU * FF * C.Ten2Two);
      #print ( paste0('Delta:', Delta, ', Rnl:',Rnl, ', Rns:', Rns, ', Ea:', Ea))

      # calculate the final result
      ES0  = (Delta * Rns + C.Gamma * Ea) / (Delta + C.Gamma)
      if (!is.na(ES0) & ES0 < 0.0)
      {
        ES0 <- 0.0
      }

      dv.fl <- subset(day.flags, day.flags$Property == "TN" |
                                 day.flags$Property == "TX" |
                                 day.flags$Property == "FF" |
                                 day.flags$Property == "MVP" |
                                 day.flags$Property == "MSUN" |
                                 day.flags$Property == "ANGRAD" |
                                 day.flags$Property == "CRAD")
      if (nrow(dv.fl) > 0) { Flags <- paste(unique(dv.fl[, "Flags"]), collapse = ",") }
    }

    #print (paste0('E0:', E0, ', TMAX:', TMAX, ',TMIN:', TMIN))

    return (c(ES0, Flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.ES0 - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.ES0 - Warning: ', warn))
    return (c(NA, NA))
  })

  return (result)

}

#*********************************************************
# Calculate the Penman potential evaporation from a crop canopy
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags of the station
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - day.list        [INPUT] [LIST]         - list with data.frame of the day for current station
#                    [RETURN] [NUMERIC]     - Penmann Evapotraspiration
#*********************************************************
Aggregation.ET0 <- function(station.data, hourly.flags, current.date, day.list)
{
  result <- tryCatch({
    # variables initialization
    ET0     <- NA
    Flags   <- NA
    day.obs   <- day.list[[1]]
    day.flags <- day.list[[2]]

    # retrieve all daily properties already calculate
    TMAX    <- as.numeric(day.obs[1, "TX"])
    TMIN    <- as.numeric(day.obs[1, "TN"])
    MVP     <- as.numeric(day.obs[1, "MVP"])
    FF      <- as.numeric(day.obs[1, "FF"])
    ANGRAD  <- as.numeric(day.obs[1, "ANGRAD"])
    Global.Radiation    <- as.numeric(day.obs[1, "CRAD"])

    if (!is.na(TMAX) & !is.na(TMIN) & !is.na(MVP) & !is.na(FF) &!is.na(Global.Radiation) & !is.na(ANGRAD))
    {
      # constants definitions
      C.Z <- 10.0
      C.Gamma <- 0.665 * (1.0e-3)

      # wind speed at 2 meter
      FF2 <- (FF * 4.87) / log( (67.8 * C.Z) - 5.42)

      # calculate average temperature
      TMean <- (TMAX + TMIN) / 2

      # retrieve station coordinates
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      if ( length(station.coord) <= 0)
      {
        print (paste0('Missing coordinates for station number ', station.data[1, "Station"]))
        return (NA)
      }

      # retrieve the station altitude
      station.altitude <- as.numeric(station.coord$Altitude)

      Patm <- 101.3 * ( ((293-(0.0065*station.altitude))/293) ^ 5.26)
      C.Gamma <- C.Gamma * Patm

      delta <- 4098 * (0.6108 * exp( (17.27 * TMean) / (237.3 + TMean) ) )
      delta <- delta / ((TMean + 237.3) ^ 2)

      eTMax = 0.6108 * exp( (17.27 * TMAX) / (237.3 + TMAX) )
      eTMin = 0.6108 * exp( (17.27 * TMIN) / (237.3 + TMIN) )
      ES = (eTMax + eTMin) / 2

      EA = MVP / 10.0;

      # calculate Boltzmann values
      BoltzmannTMax <- 4.903 * (1.0e-9) * ((TMAX + 273.16) ^ 4)
      BoltzmannTMin <- 4.903 * (1.0e-9) * ((TMIN + 273.16) ^ 4)

      # calculate radiation values
      ClearSkyRadiation <- (0.75 + (0.00002 * station.altitude)) * ANGRAD
      Rnl <- ((BoltzmannTMax + BoltzmannTMin) / 2) * (0.34 - (0.14 * (EA ^ 0.5)))

      # calculate Penmann Evapotraspiration
      if (ClearSkyRadiation != 0)
      {
        Rnl <- Rnl * (1.35 * (Global.Radiation/ClearSkyRadiation) - 0.35)

        Rn <- (0.77 * (Global.Radiation/1000.0)) - Rnl

        ET0 <- (0.408 * delta * Rn) + (C.Gamma * (900/(TMean + 273)) * FF2 * (ES - EA))

        ET0 <- ET0 / (delta + C.Gamma * (1 + (0.34*FF2)) )

        # reset value if negative
        if (ET0 < 0)
        {
          ET0 <- 0.0
        }
      }
      else
      {
        ET0 <- 0.0
      }

      dv.fl <- subset(day.flags, day.flags$Property == "TN" |
                        day.flags$Property == "TX" |
                        day.flags$Property == "FF" |
                        day.flags$Property == "MVP" |
                        day.flags$Property == "ANGRAD" |
                        day.flags$Property == "CRAD")
      if (nrow(dv.fl) > 0) { Flags <- paste(unique(dv.fl[, "Flags"]), collapse = ",") }
    }

    #print (paste0('Station:', station.data[1, "Station"], ',Global.Radiation:', Global.Radiation, ',ET0:', ET0, ', TMAX:', TMAX, ',TMIN:', TMIN))

    return (c(ET0, Flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.ET0 - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.ET0 - Warning: ', warn))
    return (c(NA, NA))
  })

  return (result)

}


#*********************************************************
# Calculate the Penman potential evaporation from a crop canopy
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	  - the entire data.frame with station data
#  - current.date    [INPUT] [DATETIME]	    - ellaboration date
#  - day.agg         [INPUT] [XML]          - xml with aggregated data for current station and date
#                    [RETURN] [NUMERIC]     - Penmann Evapotraspiration
#*********************************************************
Aggregation.ET0_OLD<- function(station.data, current.date, day.agg)
{
  result <- tryCatch({
    # variables initialization
    TMAX    <- NA
    TMIN    <- NA
    MSUN    <- NA
    MVP     <- NA
    FF      <- NA
    ANGRAD  <- NA
    APRAD   <- NA
    ET0     <- NA

    # retrieve Measured Sunshine & ANGOT Radiation
    xNode <- getNodeSet(day.agg, "//Observation/TX")
    if (!is.null(xNode) & length(xNode) > 0)
    {
      if (xmlValue(xNode[[1]]) != 'NA')
      {
        TMAX <- as.double(as.character(xmlValue(xNode[[1]])))
      }
    }

    xNode <- getNodeSet(day.agg, "//Observation/TN")
    if (!is.null(xNode) & length(xNode) > 0)
    {
      if (xmlValue(xNode[[1]]) != 'NA')
      {
        TMIN <- as.double(as.character(xmlValue(xNode[[1]])))
      }
    }

    xNode <- getNodeSet(day.agg, "//Observation/MVP")
    if (!is.null(xNode) & length(xNode) > 0)
    {
      if (xmlValue(xNode[[1]]) != 'NA')
      {
        MVP <- as.double(as.character(xmlValue(xNode[[1]])))
      }
    }

    xNode <- getNodeSet(day.agg, "//Observation/MSUN")
    if (!is.null(xNode) & length(xNode) > 0)
    {
      if (xmlValue(xNode[[1]]) != 'NA')
      {
        MSUN <- as.double(as.character(xmlValue(xNode[[1]])))
      }
    }

    xNode <- getNodeSet(day.agg, "//Observation/FF")
    if (!is.null(xNode) & length(xNode) > 0)
    {
      if (xmlValue(xNode[[1]]) != 'NA')
      {
        FF <- as.double(as.character(xmlValue(xNode[[1]])))
      }
    }

    xNode <- getNodeSet(day.agg, "//Observation/ANGRAD")
    if (!is.null(xNode) & length(xNode) > 0)
    {
      if (xmlValue(xNode[[1]]) != 'NA')
      {
        ANGRAD <- as.double(as.character(xmlValue(xNode[[1]])))
      }
    }

    xNode <- getNodeSet(day.agg, "//Observation/APRAD")
    if (!is.null(xNode) & length(xNode) > 0)
    {
      if (xmlValue(xNode[[1]]) != 'NA')
      {
        APRAD <- as.double(as.character(xmlValue(xNode[[1]])))
      }
    }

    # calculate Hargreaves Radiation
    if (!is.na(TMAX) & !is.na(TMIN) & !is.na(MVP) & !is.na(FF))
    {
      # constants definitions
      C.Goudriaan       <- 238.102
      C.BruntE          <- 0.1
      C.BruntF          <- 0.9
      C.BU              <- 0.54
      C.Boltzmann       <- 4.9e-3
      C.Gamma           <- 0.67
      C.ReflCoeffCanopy <- 0.20       #reflection coeff of water
      C.LatentHeat      <- 2.45e6     #Latent heat of vaporization of water
      C.Ten2Two         <- log(2.0/0.033)/log(10.0/0.033);

      RelativeSunshineDuration <- 0.0

      # retrieve station coordinates
      station.coord <- subset(stations.df, stations.df$StationNumber == station.data[1, "Station"])
      if ( length(station.coord) <= 0)
      {
        print (paste0('Missing coordinates for station number ', station.data[1, "Station"]))
        return (NA)
      }

      # calculate the astronomical day length, sin LD, cos LD
      astro.df <- Aggregation.DayLength(station.coord, current.date)
      DayLength <- astro.df[1, "DayLength"]

      if (abs(as.numeric(as.character(station.coord[1, "Latitude"]))) < 45.0)
      {
        C.BruntE <- 0.3
        C.BruntF <- 0.7
      }

      if (DayLength > 0.0)
      {
        if (!is.na(MSUN))
        {
          RelativeSunshineDuration <- MSUN / DayLength
        }
        else if (!is.na(APRAD) & !is.na(ANGRAD))
        {
          RelativeSunshineDuration = ( ( APRAD/ANGRAD) - as.double(as.character(station.coord[1, "AngstromA"])) ) /
            as.double(as.character(station.coord[1, "AngstromB"]));
        }
      }

      # calculate average temperature
      TMean <- (TMAX + TMIN) / 2
      TMeanGoudriaan <- TMean + C.Goudriaan

      # calculate saturation vapour pressure and vapour pressure
      SaturationVapourPressure <- 6.10588 * exp(17.32491 * TMean / TMeanGoudriaan)
      VapourPressure <- min(MVP, SaturationVapourPressure)

      # calculate DELTA
      Delta <- (C.Goudriaan * 17.32491 * SaturationVapourPressure) / (TMeanGoudriaan * TMeanGoudriaan)

      # calculate RNL
      Rnl <- C.Boltzmann *
        ((TMean + 273.0) ** 4) *
        (0.56 - 0.08 * sqrt(VapourPressure)) *
        (C.BruntE + C.BruntF * RelativeSunshineDuration);

      # calculate RNW, RNS, RNC (Absorbed radiation)
      Rnc <- ((1.0 - C.ReflCoeffCanopy)*( APRAD * 1000.0) - Rnl) / C.LatentHeat

      # calculate evaporative demand of the atmosphere (isothermal evaporation)
      Eac  = 0.26 * (SaturationVapourPressure - VapourPressure) * (1.0 + C.BU * FF * C.Ten2Two);

      # calculate the final result
      ET0  = (Delta * Rnc + C.Gamma * Eac) / (Delta + C.Gamma)
      if (!is.na(ET0) & ET0 < 0.0)
      {
        ET0 <- 0.0
      }
    }

    #print (paste0('E0:', E0, ', TMAX:', TMAX, ',TMIN:', TMIN))

    return (ET0)
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.ET0 - Error : ', err))
    return (NA)
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.ET0 - Warning: ', warn))
    return (NA)
  })

  return (result)

}

#*********************************************************
# Calculate the DayLength, sinLD, cosLD
# Parameters :
#  - station.coord   [INPUT] [DATA.FRAME]	  - station coordinate
#  - current.date    [INPUT] [DATETIME]	    - ellaboration date
#                    [RETURN] [DATA.FRAME]  - Data frame with the DayLength, SinLD, CosLD
#*********************************************************
Aggregation.DayLength <- function(station.coord, current.date)
{
  result <- tryCatch({
    # calculate the Julien day
    jDay <- as.numeric(as.character(format(current.date, "%j")))

    # calculate the solar constant J/m2/s
    SolarConstant <- 1370.0 * (1.0 + 0.033 * cos(2.0 * pi * jDay / 365.0))
    #print (paste0('SolarConstant:', SolarConstant))

    # calculate the solar declination
    SolarDeclination <- -asin( sin(23.45 * pi / 180.0) * cos( 2.0 * pi * (jDay + 10.0) / 365.0))
    #print (paste0('SolarDeclination:', SolarDeclination))

    num.Latitude <- as.double(as.character(station.coord[1, "Latitude"]))
    SinLD <- sin(SolarDeclination) * sin( num.Latitude * pi/180)
    CosLD <- cos(SolarDeclination) * cos( num.Latitude * pi/180)

    dAob <- SinLD / CosLD
    #print (paste0('SinLD:', SinLD, ', CosLD:', CosLD))

    # calculate Astronomical Day Length
    DayLength <- 0.0
    if (abs(dAob) < 1.0)
    {
      DayLength <- 12.0 * (1.0 + 2.0 * asin(dAob) / pi);
    }
    else if (dAob > 1.0)
    {
      DayLength <- 24.0
    }

    #print (paste0('DayLength:', DayLength))

    return (data.frame( DayLength, SinLD, CosLD, SolarConstant))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.DayLength[Station:', station.coord[1, "StationNumber"], '] - Error : ', err))
    return (NA)
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.DayLength[Station:', station.coord[1, "StationNumber"], '] - Warning : ', warn))
    return (NA)
  })

  return (result)
}

#*********************************************************
# Retrieve the sunrise and sunset time for a specific station
# and specific date
#
# Parameters :
#  - station.coord   [INPUT] [DATA.FRAME]	  - station coordinate
#  - current.date    [INPUT] [DATETIME]	    - ellaboration date
#                    [RETURN] [DATA.FRAME]  - Data frame with the Sunrise, Sunset time
#*********************************************************
Aggregation.DaySunlightTimes <- function(station.coord, current.date)
{
  result <- tryCatch({

    num.Latitude <- as.double(as.character(station.coord[1, "Latitude"]))
    num.Longitude <- as.double(as.character(station.coord[1, "Longitude"]))

    dst <- suppressWarnings (getSunlightTimes(as.Date (current.date), lat = num.Latitude, lon = num.Longitude, tz="UTC") )
    if (is.null(dst) | length(dst) <= 0)
    {
      print ( paste0('Aggregation.DaySunlightTimes: Lat=', num.Latitude, ', Long:', num.Longitude, ', DST:', length(dst)))
      return (NULL)
    }

    #print (dst)
    sunrise <- dst[1, "sunrise"]
    sunset <- dst[1, "sunset"]
    rs.df <- data.frame( sunrise, sunset)

    return (rs.df)
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.DaySunlightTimes[Station:', station.coord[1, "StationNumber"], '] - Error : ', err))
    return (NULL)
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.DaySunlightTimes[Station:', station.coord[1, "StationNumber"], '] - Warning : ', warn))
    return (NULL)
  })

  return (result)
}


#*********************************************************
# Make the temporale interpolation for a specific property
#
# Parameters :
#  - station.obs   [INPUT] [DATA.FRAME]	  - station observation
#  - current.date  [INPUT] [DATETIME]	    - ellaboration date
#  - property      [INPUT] [STRING]       - name of column to interpolate
#  - digits        [INPUT] [INT]          - number of digits to round the value
#  [RETURN] [DATA.FRAME]  - Data frame with interpolated value
#*********************************************************
Aggregation.Column.Interpolation <- function(station.obs, current.date, property, digits)
{
  result <- tryCatch( {

    start.cd <- current.date + 0 * 3600
    end.cd <- current.date + 23 * 3600

    # observation of current date
    obs.cd <- subset(station.obs,
                      strptime(station.obs$DayTime, "%Y%m%d%H") >= start.cd &
                      strptime(station.obs$DayTime, "%Y%m%d%H") <= end.cd)

    # check if the observations are hourly or 3-hour
    is.HourlyObservation <- CheckHourlyObservations(obs.cd[, "DayTime"])
    obs.cd.number <- if (is.HourlyObservation) 24 else 8
    hour.step <- if (is.HourlyObservation) 1 else 3

    # if the number of valid observation into the column are less than 80% the interpolation are not done
    obs.valid.index <- which( !is.na(obs.cd[, property]) )
    obs.na.index <- which (is.na(obs.cd[, property]))

    #print (paste0('Valid index:', as.character( length(obs.valid.index)),
    #              'NA index:', as.character( length(obs.na.index)),
    #              'Number:', as.character( obs.cd.number)))

    if ( length(obs.na.index > 0) )
    {
      # not necessary the interpolation
      if ( length(obs.valid.index) != obs.cd.number &
           round(length(obs.valid.index) / obs.cd.number, digits=1) < 0.8)
      {
        print (paste0('Station no.:', as.character(station.obs[1, "Station"]), ' not enough values to interpolate property ', property))
      }
      else
      {
        # create indexes array and property values array
        missing.index <- c()
        valid.index <- c()
        obs.prop <- c()

        pos.daytime <- start.cd
        pos.index <- 1
        mis.index <- 0
        val.index <- 0

        # extract valid data for previous day
        obs.prevday <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") < start.cd)
        if (nrow(obs.prevday) > 0)
        {
          pos.daytime <- current.date - 24*3600   # 00 of the previous day
          end.prevday = pos.daytime + 23 * 3600   # 23 of previous day
          while (pos.daytime <= end.prevday)
          {
            row.d <- subset(obs.prevday, strptime(obs.prevday$DayTime, "%Y%m%d%H") == pos.daytime)
            if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
            {
              val.index <- val.index + 1
              valid.index[val.index] <- pos.index
              obs.prop[val.index] <- row.d[1, property]
            }

            # increment position and daytime
            pos.index <- pos.index + 1
            pos.daytime <- pos.daytime + hour.step * 3600
          }
        }

        # extract valid data for current date
        pos.daytime <- start.cd
        while (pos.daytime <= end.cd)
        {
          row.d <- subset(obs.cd, strptime(obs.cd$DayTime, "%Y%m%d%H") == pos.daytime)
          if (nrow(row.d) <= 0)
          {
            #print ( paste0('Daytime:', pos.daytime, ' missing row'))
          }
          else if (is.na(row.d[1, property]))
          {
            mis.index <- mis.index + 1
            missing.index[mis.index] <- pos.index
          }
          else {
            val.index <- val.index + 1
            valid.index[val.index] <- pos.index
            obs.prop[val.index] <- row.d[1, property]
          }

          # increment position and daytime
          pos.index <- pos.index + 1
          pos.daytime <- pos.daytime + hour.step * 3600
        }

        # extract valid data for next day
        obs.nextday <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") > end.cd)
        if (nrow(obs.nextday) > 0 )
        {
          pos.daytime <- current.date + 24 * 3600 # 00 of next day
          end.nextday <- pos.daytime + 23 * 3600
          while (pos.daytime < end.nextday)
          {
            row.d <- subset(obs.nextday, strptime(obs.nextday$DayTime, "%Y%m%d%H") == pos.daytime)
            if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
            {
              val.index <- val.index + 1
              valid.index[val.index] <- pos.index
              obs.prop[val.index] <- row.d[1, property]
            }

            # increment position and daytime
            pos.index <- pos.index + 1
            pos.daytime <- pos.daytime + hour.step * 3600
          }
        }

        print (paste0('Total number of values:', as.character(length(obs.prop)), ', Total valid indexes;', as.character(length(valid.index))))

        cd.loess <- loess(obs.prop ~ valid.index, span = 0.9, degree = 2)
        cd.predict <- predict(cd.loess, newdata = missing.index)

        # save the predicted value to the current obserbations
        offset.pd <- nrow ( subset(station.obs, strptime(obs.cd$DayTime, "%Y%m%d%H") < start.cd) )
        for (x in 1:length(cd.predict))
        {
          tmp.value <- round(cd.predict[x], digits = digits)
          print (paste0('Station no.:', as.character(station.obs[1, "Station"]),
                        ' - Interpolation for property ', property,
                        ' - Index:', as.character(missing.index[x]),
                        ' - Value:', as.character(as.numeric(tmp.value))))

          station.obs[ offset.pd + missing.index[x], property] <- tmp.value
        }
      }
    }

    return (station.obs)
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.Column.Interpolation[Station:', station.obs[1, "Station"], 'Property:', property, '] - Error : ', err))
    return (station.obs)
  }
  , warning = function (warn)
  {
    print (paste0('Aggregation.Column.Interpolation[Station:', station.obs[1, "Station"], 'Property:', property, '] - Warning : ', warn))
    return (station.obs)
  }
  )

  return (result)
}

#*********************************************************
# Make the temporale interpolation for a specific property relative
# to 24 H of current date
#
# Parameters :
#  - station.obs   [INPUT] [DATA.FRAME]	  - station observation
#  - current.date  [INPUT] [DATETIME]	    - ellaboration date
#  - property      [INPUT] [STRING]       - name of column to interpolate
#  - digits        [INPUT] [INT]          - number of digits to round the value
#  [RETURN] [VECTOR]  - Vector with interpolated data
#*********************************************************
Aggregation.Column.Interpolation.24H <- function(station.obs, current.date, property, digits)
{
  interpolated.property <- c()

  result <- tryCatch( {

    start.cd <- current.date + 0 * 3600
    end.cd <- current.date + 23 * 3600

    # observation of current date
    obs.cd <- subset(station.obs,
                     strptime(station.obs$DayTime, "%Y%m%d%H") >= start.cd &
                     strptime(station.obs$DayTime, "%Y%m%d%H") <= end.cd)

    # check if the observations are hourly or 3-hour
    is.HourlyObservation <- CheckHourlyObservations(obs.cd[, "DayTime"])
    obs.cd.number <- if (is.HourlyObservation) 24 else 8
    hour.step <- if (is.HourlyObservation) 1 else 3

    # if the number of valid observation into the column are less than 80% the interpolation are not done
    obs.valid.index <- which( !is.na(obs.cd[, property]) )
    obs.na.index <- which (is.na(obs.cd[, property]))

    #print (paste0('Station no.:', as.character(station.obs[1, "Station"]),
    #              ',Property:', property,
    #              ',Valid index:', as.character( length(obs.valid.index)),
    #              ',NA index:', as.character( length(obs.na.index)),
    #              ',Number:', as.character( obs.cd.number)))

    if ( length(obs.na.index > 0) | length(obs.valid.index) < obs.cd.number)
    {
      # not necessary the interpolation
      if ( length(obs.valid.index) != obs.cd.number &
           round(length(obs.valid.index) / obs.cd.number, digits=1) < 0.8)
      {
        print (paste0('Station no.:', as.character(station.obs[1, "Station"]), ' not enough values to interpolate property ', property,
                      ' for date ', format(current.date, "%Y%m%d")))
        interpolated.property <- c(NA)
        interpolated.property <- rep(interpolated.property, obs.cd.number, obs.cd.number)
      }
      else
      {
        # create indexes array and property values array
        missing.index <- c()
        valid.index <- c()
        obs.prop <- c()

        pos.daytime <- start.cd
        pos.index <- 1
        mis.index <- 0
        val.index <- 0

        # extract valid data for previous day
        obs.prevday <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") < start.cd)
        if (nrow(obs.prevday) > 0)
        {
          pos.daytime <- current.date - 24*3600   # 00 of the previous day
          end.prevday = pos.daytime + 23 * 3600   # 23 of previous day
          while (pos.daytime <= end.prevday)
          {
            row.d <- subset(obs.prevday, strptime(obs.prevday$DayTime, "%Y%m%d%H") == pos.daytime)
            if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
            {
              val.index <- val.index + 1
              valid.index[val.index] <- pos.index
              obs.prop[val.index] <- row.d[1, property]
            }

            # increment position and daytime
            pos.index <- pos.index + 1
            pos.daytime <- pos.daytime + hour.step * 3600
          }
        }

        #print ('passed prev day')

        # extract valid data for current date
        current.day.index.start <- pos.index
        pos.daytime <- start.cd
        while (pos.daytime <= end.cd)
        {
          row.d <- subset(obs.cd, strptime(obs.cd$DayTime, "%Y%m%d%H") == pos.daytime)
          if (nrow(row.d) <= 0 | is.na(row.d[1, property]))
          {
            # missing observation row or property value is NA
            mis.index <- mis.index + 1
            missing.index[mis.index] <- pos.index
          }
          else {
            val.index <- val.index + 1
            valid.index[val.index] <- pos.index
            obs.prop[val.index] <- row.d[1, property]
          }

          # increment position and daytime
          pos.index <- pos.index + 1
          pos.daytime <- pos.daytime + hour.step * 3600
        }
        current.day.index.stop <- pos.index

        #print ('passed current day')

        # extract valid data for next day
        obs.nextday <- subset(station.obs, strptime(station.obs$DayTime, "%Y%m%d%H") > end.cd)
        if (nrow(obs.nextday) > 0 )
        {
          pos.daytime <- current.date + 24 * 3600 # 00 of next day
          end.nextday <- pos.daytime + 23 * 3600
          while (pos.daytime < end.nextday)
          {
            row.d <- subset(obs.nextday, strptime(obs.nextday$DayTime, "%Y%m%d%H") == pos.daytime)
            if (nrow(row.d) > 0 & !is.na(row.d[1, property]))
            {
              val.index <- val.index + 1
              valid.index[val.index] <- pos.index
              obs.prop[val.index] <- row.d[1, property]
            }

            # increment position and daytime
            pos.index <- pos.index + 1
            pos.daytime <- pos.daytime + hour.step * 3600
          }
        }

        #print (paste0('Total number of values:', as.character(length(obs.prop)), ', Total valid indexes;', as.character(length(valid.index))))

        cd.loess <- loess(obs.prop ~ valid.index, span = 0.9, degree = 2)
        cd.predict <- predict(cd.loess, newdata = missing.index)

        current.index = 1
        obs.index = current.day.index.start
        x = 1
        #print (obs.prop)
        while (current.index <= obs.cd.number)
        {
          if (x <= length(missing.index) && current.index == missing.index[x])
          {
            interpolated.property <- c(interpolated.property, round(cd.predict[x], digits = digits))
            x <- x + 1
          }
          else
          {
            interpolated.property <- c(interpolated.property, round(obs.prop[obs.index], digits = digits))
            obs.index <- obs.index + 1
          }
          current.index <- current.index + 1
        }
      }
    }
    else
    {
      # the interpolation are not necessary
      interpolated.property <- c(NA)
      interpolated.property <- rep(interpolated.property, obs.cd.number, obs.cd.number)
    }

    return (interpolated.property)
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.Column.Interpolation[Station:', station.obs[1, "Station"], 'Property:', property, '] - Error : ', err))
    return (interpolated.property)
  }
  , warning = function (warn)
  {
    print (paste0('Aggregation.Column.Interpolation[Station:', station.obs[1, "Station"], 'Property:', property, '] - Warning : ', warn))
    return (interpolated.property)
  }
  )

  return (result)
}

#*********************************************************
#
#           Aggregation Method for CHINA
#
#*********************************************************
Aggregation.SUN.CHN <- function(station.data, hourly.flags)
{
  return (c(NA, NA))
}

Aggregation.RAD.CHN <- function(station.data, hourly.flags)
{
  return (c(NA, NA))
}

Aggregation.LowClouds.CHN <- function(station.data, hourly.flags)
{
  return (c(NA, NA))
}

#*********************************************************
# Get the minimum temperature CHINA
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	- the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags data frame
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - mos.station     [INPUT] [DATA.FRAME]   - MOS data for current station
#                    [RETURN] [NUMERIC]     - the value of minimum temperature and related flag
#*********************************************************
Aggregation.TN.CHN <- function(station.data, hourly.flags, current.date, mos.station)
{
  tn <- NA
  flags <- NA
  checkFlags <- !is.null(hourly.flags) & (nrow(hourly.flags) > 0)
  result <- tryCatch(
    {
      dt06cd <- current.date + 6 * 3600
      dt06pd <- current.date - 18 * 3600

      station06cd  <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt06cd)
      if (nrow(station06cd) > 0)
      {
        if (!is.na(station06cd[1, "TN12"]))
        {
          tn <- as.numeric(station06cd[1, "TN12"])
          if (checkFlags)
          {
            flags.df.06 <- subset(hourly.flags, strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06cd &
                                                hourly.flags$Property == "TN12")
            if (nrow(flags.df.06) > 0)
            {
              flags <- flags.df.06[1, "Flags"]
            }
          }
        }
      }

      # use the 6h observations
      if (is.na(tn))
      {
        dt12pd <- current.date - 12 * 3600
        dt18pd <- current.date - 06 * 3600
        dt00cd <- current.date + 0*3600

        station12pd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt12pd)
        station18pd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt18pd)
        station06pd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt06pd)
        station00cd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt00cd)

        tn06 <- NA
        if (nrow(station12pd) > 0 )
        {
          if (!is.na(station12pd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station12pd[1, "TN6"])))
          }
        }

        if (nrow(station18pd) > 0 )
        {
          if (!is.na(station18pd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station18pd[1, "TN6"])))
          }
        }

        if (nrow(station06pd) > 0 )
        {
          if (!is.na(station06pd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station06pd[1, "TN6"])))
          }
        }

        if (nrow(station06cd) > 0 )
        {
          if (!is.na(station06cd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station06cd[1, "TN6"])))
          }
        }

        if (nrow(station00cd) > 0 )
        {
          if (!is.na(station00cd[1, "TN6"]))
          {
            tn06 <- c(tn06, as.numeric(as.character(station00cd[1, "TN6"])))
          }
        }

        if (length(tn06) > 0 & length(which(!is.na(tn06))) > 0)
        {
          tn <- min(tn06, na.rm = TRUE)
          if (checkFlags)
          {
            flags.tn6 <- subset(hourly.flags, hourly.flags$Property == "TN6" &
                                  (strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06pd |
                                     strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt12pd |
                                     strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18pd |
                                     strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00cd |
                                     strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06cd))
            flags <- AggregateFormulaFlags(flags.tn6[, "Flags"])
          }
        }
      }

      # try to identify the minimum from the TN1 hourly observations between 18 previous day and 06 current day
      if (is.na(tn) )
      {
        tn.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt06pd &
                          strptime(station.data$DayTime, "%Y%m%d%H") <= dt06cd)

        # only for hourly observation
        if ( CheckHourlyObservations(tn.df[, "DayTime"]) )
        {
          valid.values = length( which(!is.na(tn.df[, "TN1"])) )
          if ( round((valid.values / nrow(tn.df)), digit=1) >= 0.8)
          {
            tn <- min (tn.df[, "TN1"], na.rm = TRUE)
            if (checkFlags)
            {
              flags.tn1 <- subset(hourly.flags, hourly.flags$Property == "TN1" &
                                                strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt06pd &
                                                strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt06cd)
              flags <- AggregateFormulaFlags(flags.tn1[, "Flags"])
            }
          }
        }
      }

      # try to identify the min from the entire list of hourly observations of air temperature between
      # 18 previous day and 06 current day
      if (is.na(tn))
      {
        tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt06pd &
                          strptime(station.data$DayTime, "%Y%m%d%H") <= dt06cd)

        if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
        {
          valid.values <- length( which(!is.na(tt.df[, "TT"])) )
          if ( round((valid.values/nrow(tt.df)), digits = 1) >= 0.8)
          {
            tn <- min( tt.df[, "TT"], na.rm = TRUE)
            if (checkFlags)
            {
              flags.tt <- subset(hourly.flags, hourly.flags$Property == "TT" &
                                    strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt06pd &
                                    strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt06cd)
              flags <- AggregateFormulaFlags(flags.tt[, "Flags"])
            }
          }
        }
      }

      # MOS Checks
      if (!is.na(tn) & nrow(mos.station) > 0)
      {
        dt18pd <- current.date - 06 * 3600
        # get the highest TT Value in the interval 06 cd - 18 cd
        tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt18pd &
                          strptime(station.data$DayTime, "%Y%m%d%H") <= dt06cd)

        # only for hourly osservation
        if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
        {
          valid.values <- length(which(!is.na(tt.df[, "TT"])))
          lowest.tt <- c()
          if ( round((valid.values / nrow(tt.df)), digits = 1) >= 0.8)
          {
            lowest.tt <- which( tt.df$TT < tn)
          }

          mos.tn <- NA
          mos.idx <- which( strptime(mos.station$DayTime, "%Y%m%d%H") == dt06cd )
          if (length(mos.idx) > 0)
          {
            mos.tn <- if (!is.na(mos.station[mos.idx[1], "TN"])) as.numeric(mos.station[mos.idx[1], "TN"]) else NA
          }

          if (length(lowest.tt) == 1 & !is.na(mos.tn))
          {
            if ( tt.df[lowest.tt[1],"TT"] < mos.tn)
            {
              print(paste0("Station no. ", station.data[1, "Station"]," - TN temperature [", tn, "] replaced by MOS value [", mos.tn, "] for inconsistent TT value [", tt.df[lowest.tt[1], "TT"], "] !" ))
              tn <- mos.tn
              flags <- "R"
            }
          }
        }
      }

      return (c(tn, flags))
    }
    ,error = function (err)
    {
      print (paste0('Aggregation.TN.CHN - Error : ', err))
      return (c(NA, NA))
    }
    ,warning = function (warn)
    {
      print (paste0('Aggregation.TN.CHN - Warning: ', warn))
      return (c(NA, NA))
    } )

  return (result)
}

#*********************************************************
# Get the maximum temperature CHINA
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	- the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME]   - the hourly flags data frame
#  - current.date    [INPUT] [DATETIME]	    - elaboration date
#  - mos.station     [INPUT] [DATA.FRAME]   - MOS data for current station
#                    [RETURN] [NUMERIC]     - the value of maximum temperature and related flag
#*********************************************************
Aggregation.TX.CHN <- function(station.data, hourly.flags, current.date, mos.station)
{
  tx <- NA
  flags <- NA
  checkFlags <- !is.null(hourly.flags) & (nrow(hourly.flags) > 0)
  result <- tryCatch( {

    dt18cd <- current.date + 18 * 3600

    station18cd <- station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == dt18cd, ]

    if (length (station18cd) > 0 )
    {
      if (!is.na(station18cd[1, "TX12"]))
      {
        tx <- as.numeric(as.character(station18cd[1, "TX12"]))
        if (checkFlags)
        {
          flags.df.18 <- subset(hourly.flags, strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18cd &
                                  hourly.flags$Property == "TX12")
          if (nrow(flags.df.18) > 0)
          {
            flags <- flags.df.18[1, "Flags"]
          }
        }
      }
    }

    # use the 6 hour observations
    if (is.na(tx) | tx == 0)
    {
      dt12cd <- current.date + 12 * 3600
      dt06cd <- current.date + 06 * 3600
      dt00cd <- current.date + 00 * 3600
      dt18pd <- current.date - 06 * 3600

      tx6 <- NA
      station12cd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt12cd)
      station06cd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt06cd)
      station00cd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt00cd)
      station18pd <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == dt18pd)

      if (length(station18cd) > 0)
      {
        if (!is.na(station18cd[1, "TX6"]))
        {
          tx6 <- c(tx6, as.numeric(as.chracter(station18cd[1, "TX6"])))
        }
      }

      if (length(station12cd) > 0)
      {
        if (!is.na(station12cd[1, "TX6"]))
        {
          tx6 <- c(tx6, as.numeric(as.chracter(station12cd[1, "TX6"])))
        }
      }

      if (length(station06cd) > 0)
      {
        if (!is.na(station06cd[1, "TX6"]))
        {
          tx6 <- c(tx6, as.numeric(as.chracter(station06cd[1, "TX6"])))
        }
      }

      if (length(station00cd) > 0)
      {
        if (!is.na(station00cd[1, "TX6"]))
        {
          tx6 <- c(tx6, as.numeric(as.chracter(station00cd[1, "TX6"])))
        }
      }

      if (length(station18pd) > 0)
      {
        if (!is.na(station18pd[1, "TX6"]))
        {
          tx6 <- c(tx6, as.numeric(as.chracter(station18pd[1, "TX6"])))
        }
      }

      if (length(which(!is.na(tx6))) >= 1)
      {
        tx <- min (tx6, na.rm = TRUE)
        if (checkFlags)
        {
          flags.tx6 <- subset(hourly.flags, hourly.flags$Property == "TX6" &
                                (strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18pd |
                                   strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt12cd |
                                   strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt18cd |
                                   strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00cd |
                                   strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt06cd))
          flags <- AggregateFormulaFlags(flags.tx6[, "Flags"])
        }
      }
    }

    # use 24 hourly observations
    if (is.na(tx))
    {
      dt18pd <- current.date - 06 * 3600
      dt18cd <- current.date + 18 * 3600
      tx.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt18pd &
                                    strptime(station.data$DayTime, "%Y%m%d%H") <= dt18cd)

      # only for hourly observation
      if ( CheckHourlyObservations(tx.df[, "DayTime"]) )
      {
        # check if the TN1 column was interpolated
        valid.values = length( which(!is.na(tx.df[, "TX1"])) )
        if ( round((valid.values / nrow(tx.df)), digits=1) >= 0.8)
        {
          tx <- max (tx.df[, "TX1"], na.rm = TRUE)
          if (checkFlags)
          {
            flags.tx1 <- subset(hourly.flags, hourly.flags$Property == "TX1" &
                                              strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt18pd &
                                              strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt18cd)
            flags <- AggregateFormulaFlags(flags.tx1[, "Flags"])
          }
        }
      }
    }

    # try to identify the max from the entire list of hourly observations of air temperature between
    # 06 and 18 of current day
    if (is.na(tx))
    {
      dt18pd <- current.date - 6 * 3600
      dt18cd <- current.date + 18 * 3600
      tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt18pd &
                                    strptime(station.data$DayTime, "%Y%m%d%H") <= dt18cd)

      # only for hourly observation
      if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
      {
        valid.values <- length(which(!is.na(tt.df[, "TT"])))
        if ( round((valid.values / nrow(tt.df)) , digits = 1) >= 0.8)
        {
          tx <- max( tt.df[, "TT"], na.rm = TRUE)
          if (checkFlags)
          {
            flags.tt1 <- subset(hourly.flags, hourly.flags$Property == "TT" &
                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") >= dt18pd &
                                  strptime(hourly.flags$DayTime, "%Y%m%d%H") <= dt18cd)
            flags <- AggregateFormulaFlags(flags.tt1[, "Flags"])
          }
        }
      }
    }

    # MOS Checks
    if (!is.na(tx) & nrow(mos.station) > 0)
    {
      # get the highest TT Value in the interval 06 cd - 18 cd
      dt06cd <- current.date + 6 * 3600
      dt18cd <- current.date + 18 * 3600
      tt.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt06cd &
                        strptime(station.data$DayTime, "%Y%m%d%H") <= dt18cd)

      # only for hourly osservation
      if ( CheckHourlyObservations(tt.df[, "DayTime"]) )
      {
        valid.values <- length(which(!is.na(tt.df[, "TT"])))
        higher.tt <- c()
        if ( round((valid.values / nrow(tt.df)), digits = 1) >= 0.8)
        {
          higher.tt <- which( tt.df$TT > tx)
        }

        mos.tx <- NA
        mos.idx <- which( strptime(mos.station$DayTime, "%Y%m%d%H") == dt18cd )
        if (length(mos.idx) > 0)
        {
          mos.tx <- if (!is.na(mos.station[mos.idx[1], "TX"])) as.numeric(mos.station[mos.idx[1], "TX"]) else NA
        }

        if (length(higher.tt) == 1 & !is.na(mos.tx))
        {
          if (tt.df[higher.tt[1], "TT"] < mos.tx)
          {
            print(paste0("Station no. ", station.data[1, "Station"], " - TX temperature [", tx, "] replaced by MOS value [", mos.tx, "] for inconsistent TT value [", tt.df[higher.tt[1], "TT"], "] !" ))
            tx <- mos.tx
            flags <- "R"
          }
        }
      }
    }

    return (c(tx, flags))
  }
  ,error = function (err)
  {
    print (paste0('Aggregation.TX.CHN - Error : ', err))
    return (c(NA, NA))
  }
  ,warning = function (warn)
  {
    print (paste0('Aggregation.TX.CHN - Warning: ', warn))
    return (c(NA, NA))
  })

  return (result)
}

#*********************************************************
# Calculate precipitation for CHINA
# Parameters :
#  - station.data    [INPUT] [DATA.FRAME]	- the entire data.frame with station data
#  - hourly.flags    [INPUT] [DATA.FRAME] - the hourly flags data frame
#  - current.date    [INPUT] [DATETIME]	  - elaboration date
#                    [RETURN] [VECTOR]    - the value of daily precipitation and related flag
#*********************************************************
Aggregation.RRR.CHN <- function(station.data, hourly.flags, current.date)
{
  result <- tryCatch(
    {
      RRR <- NA
	    Flags <- NA

      # try to identify the 24 hours observation ot 00 of next day
      dt00nd <- current.date + 24 * 3600
      station00nd <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt00nd, ]
      if (length(station00nd) > 0)
      {
        if (!is.na(station00nd[1, "PR24"]))
        {
          RRR <- as.numeric(as.character(station00nd[1, "PR24"]))
          if (!is.null(hourly.flags) & nrow(hourly.flags) > 0)
          {
            fl.24 <- subset(hourly.flags, hourly.flags$Property == "PR24" &
                                          strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt00nd )
            if (nrow(fl.24) > 0)  { Flags <- fl.24[1, "Flags"] }
          }
        }
      }

      # check for 24hours precipitation at 21 UTC current day
      if (is.na(RRR))
      {
        dt21cd <- current.date + 21 * 3600
        station21cd <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt21cd, ]
        if (length(station21cd) > 0)
        {
          if (!is.na(station21cd[1, "PR24"]))
          {
            RRR <- as.numeric(as.character(station21cd[1, "PR24"]))
            if (!is.null(hourly.flags) & nrow(hourly.flags) > 0)
            {
              fl.24 <- subset(hourly.flags, hourly.flags$Property == "PR24" &
                                            strptime(hourly.flags$DayTime, "%Y%m%d%H") == dt21cd )
              if (nrow(fl.24) > 0)  { Flags <- fl.24[1, "Flags"] }
            }
          }
        }
      }

      # calculate the precipitation like sum of the hourly observations
      if (FALSE) {
        if (is.na(RRR))
        {
          dt01cd <- current.date + 01 * 3600
          RR1H.DF <- subset( station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= dt01cd &
                                           strptime(station.data$DayTime, "%Y%m%d%H") <= dt00nd )

          isHourlyObservations <- CheckHourlyObservations(RR1H.DF[, "DayTime"])
          if (isHourlyObservations)
          {
            RR1H.COL <- RR1H.DF[, "PREC"]
            if (length(RR1H.COL[!is.na(RR1H.COL)]) == 24)
            {
              RRR <- sum(RR1H.DF$PREC, na.rm = TRUE)
            }
          }
        }
      }

      # if all alghoritms fail try to use RR & TR
      if (FALSE) {
        if (is.na(RRR))
        {

          dt00nd <- current.date + 24 * 3600
          dt01cd <- current.date + 00 * 3600
          dt <- dt00nd
          no.checks <- 0
          while (dt > dt01cd)
          {
            row.dt <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt, ]
            #print (dt)
            #print (row.dt)
            no.checks <- no.checks + 1
            if (length(row.dt) > 0)
            {
              if (!is.na(row.dt[1, "TR"]) & !is.na(row.dt[1, "RR"])) break
            }

            dt <- dt - 3 * 3600
          }

          # determine the hour interval to extract data for the algorithm
          hour.interval <- 24
          if (no.checks > 2 & no.checks <= 4)
          {
            hour.interval <- 18
          }
          else if (no.checks > 4 & no.checks <= 6)
          {
            hour.interval <- 12
          }
          else if (no.checks > 6)
          {
            hour.interval <- 0
          }

          #print (paste0('RRR Hour interval;', hour.interval))

          if (hour.interval > 0)
          {
            # get the end of the interval search but not before 01 of current date
            dt.end <- dt - hour.interval * 3600
            if (dt.end < dt01cd )
            {
              dt.end <- dt01cd
            }

            tr <- 12
            while (dt > dt.end)
            {
              # search the interval between the first datetime where RR&TR are values for hour.interval back
              # if the row has TR&RR valued use it and change the RR to the new value, otherwise, if the record missing
              # or the field are not valued get 1/2 tr value (not less than 3)
              row.dt <- station.data[strptime(station.data$DayTime, "%Y%m%d%H") == dt, ]
              #print (row.dt)
              if (length(row.dt) > 0 && !is.na(row.dt[1, "TR"]))
              {
                if (!is.na(row.dt[1, "RR"]))
                {
                  RRR <- RRR + as.numeric(as.character(row.dt[1, "RR"]))
                }

                tr <- as.numeric(as.character(row.dt[1, "TR"]))
              }
              else
              {
                if (tr > 3)
                {
                  tr <- tr / 2
                }
              }
              dt <- dt - tr * 3600

              #print (paste0('RRR:', RRR, ', TR:', tr, ', DT:', dt))
            }
          }
        }
      }

      return (c(RRR, Flags))
    }
    ,error = function (err)
    {
      print (paste0('Aggregation.RRR.CHN - Error : ', err))
      return (c(NA, NA))
    }
    ,warning = function (warn)
    {
      print (paste0('Aggregation.RRR.CHN - Warning: ', warn))
      return (c(NA, NA))
    } )

	return (result)
}
