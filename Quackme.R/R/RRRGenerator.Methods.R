#*********************************************************
# Ellaborate the precipitation for entire day for a station
# INPUT Parameters
# station.data    [DATA.FRAME]  contains all precipitation data for the station
# station.number  [INTEGER]     station number
# ref.date        [DATE]        date to ellaborate
# start.elab      [DATE]        elaboration start date
# end.elab        [DATE]        elaboration end date
# hour.interval   [INTEGER]     hour interval
# current.path    [STRING]      path to use
# mos.data        [DATA.FRAME]  MOS data
# RETURN
#  Data.Frame with all records for the request hours. The columns of the
# returned data.frame are [Station, DayTime, RRR, Flag]
#*********************************************************
Parallel.RRRGenerator.6H <- function(station.data, station.number, ref.date, start.elab, end.elab, current.path, mos.data)
{
  df <- data.frame(matrix( ncol = 4, nrow = 0))
  colnames(df) <- c("Station","DayTime", "RRR", "Flag")

  # load specific modules if are not loaded yet
  if (!exists("CheckHourlyObservations", mode="function"))
    source( paste0(current.path, "Aggregation/Aggregation.Formulas.R"))

  if (!exists("Aggregation.Column.Interpolation.ByInterval", mode="function"))
    source( paste0(current.path, "Aggregation/AggregationByStation.R"))

  result <- tryCatch(
    {
      isHourlyObservations <- CheckHourlyObservations(station.data[, "DayTime"])

      # interpolate 24 hours precipitation
      prec.inter <- NULL
      if (isHourlyObservations)
      {
        prec.inter <- Aggregation.Column.Interpolation.ByInterval(station.data, ref.date, "PREC", 1,
                                                                     (ref.date + 0 * 3600),
                                                                     (ref.date + 30 * 3600),
                                                                      31)

        inter.valid <- !is.null(prec.inter)
        if (inter.valid) (inter.valid <- nrow(prec.inter) > 0) else FALSE
        if (inter.valid)
        {
          for (m in 1:nrow(prec.inter))
          {
            # check if the DayTime is present into the observations
            nrows <- nrow(subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == strptime(prec.inter[m, "DayTime"], "%Y%m%d%H")))
            if (nrows >= 1)
            {
              #print (paste0('Interpolated:', prec.inter[m, "Value"]))
              if (!is.na(prec.inter[m, "Value"]))
              {
                prec.value <- suppressWarnings(as.numeric(as.character(prec.inter[m, "Value"])))
                if (prec.value < 0) { prec.value <- 0 }
                station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == strptime(prec.inter[m, "DayTime"], "%Y%m%d%H"), "PREC"] <- prec.value
              }
              else
              {
                #print (prec.inter)
                #print (paste0('NULL for station - ', station.data[1, "Station"]))
              }
            }
          }
        }
      }

      # start with ref.date after the first hour interval duration
      work.date <- start.elab
      i.hour.interval <- 6
      while(work.date <= end.elab)
      {
        # reset variables
        flag = 3
        rrr <- NA

        # prepare data for run date
        print (paste0('Station:', station.number, ',Working for date:', format(work.date, '%Y%m%d%H'), "\n"))

        period.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= (work.date - (hour.interval -1)*3600) &
                                          strptime(station.data$DayTime, "%Y%m%d%H") <= work.date)

        # try to find the single row for the observation datetime
        nrow.period <- nrow(period.df)
        if (nrow.period <= 0) {
          print (paste0('Station:', station.number, ' No rows for datetime; ', format(work.date, "%Y%m%d%H")))
          work.date <- work.date + i.hour.interval*3600
          next
        }

        # check if the period.df contains the daytime to run
        rows <- subset( period.df, strptime(period.df$DayTime, "%Y%m%d%H") == work.date)
        if ( nrow(rows) <= 0) {
          print (paste0('Station:', station.number, ' Row not present for datetime; ', format(work.date, "%Y%m%d%H")))
          work.date <- work.date + i.hour.interval*3600
          next
        }

        # extract the row of run datetime
        row <- rows[1, ]
        if (!is.na(row$PR06) )
        {
          rrr <-  row$PR06
        }

        # get the RR value if the TR = hour.interval
        if (is.na (rrr) & !is.na(row$TR) & !is.na(row$RR))
        {
          if (as.integer(row$TR) == 6)
          {
            rrr <- row$RR
          }
        }

        # check if the period.DF contains a number of rows = hour.interval
        if (is.na (rrr) & nrow(period.df) == i.hour.interval)
        {

          valid.data <- which (!is.na(period.df$TR) & !is.na(period.df$RR))
          if ( length(valid.data) == i.hour.interval)
          {
            tr1.counter <- length(which( as.integer(period.df$TR) == 1))
            if (tr1.counter == hour.interval)
            {
              rrr <- round(sum(period.df$RR), digits = 2)
            }
          }

          if (is.na(rrr))
          {
            # try to get the hourly precipitation values
            valid.data <- which(!is.na(period.df$PREC))
            if ( length(valid.data) == i.hour.interval)
            {
              rrr <- round(sum(period.df$PREC), digits = 1)

              # search for interpolated data into hourly values to set the FLAG= 4
              endIndex   <- 25 + difftime(work.date, ref.date, units = "hours")
              startIndex <- endIndex - i.hour.interval
              #print (paste0('work.date:', work.date, 'start index:', startIndex, ' endIndex:', endIndex))
              #print (prec.inter)
              is.interpolated <- which ( prec.inter$Index >= startIndex & prec.inter$Index <= endIndex)
              flag <- if (length(is.interpolated) > 0) 4 else 3
            }
          }

          # try to split the 12 hourly precipitation
          if (is.na(rrr) & !is.null(mos.data) & !is.na(row$TR) & as.integer(row$TR) == 12)
          {
              #search the mos PR06 for the 2 observations
              ratio6 <- NA
              ratio12 <- NA
              mos6.row <- subset(mos.data, strptime(mos.data$DayTime, "%Y%m%d%H") == (work.date - 6*3600) & !is.na(mos.data$PR06))
              mos12.row <- subset(mos.data, strptime(mos.data$DayTime, "%Y%m%d%H") == work.date & !is.na(mos.data$PR06))
              if (nrow(mos6.row) > 0 & nrow(mos12.row) > 0)
              {
                if ( !is.na(mos6.row[1, "PR06"]) & !is.na(mos12.row[1, "PR06"]))
                {
                  mos.total <- as.numeric(as.character(mos6.row[1, "PR06"])) + as.numeric(as.character(mos12.row[1, "PR06"]))
                  ratio6  <- 0
                  ratio12 <- 0
                  if (mos.total > 0.0)
                  {
                    ratio6  <- as.numeric(as.character(mos6.row[1, "PR06"])) / mos.total
                    ratio12 <- as.numeric(as.character(mos12.row[1, "PR06"])) / mos.total
                  }
                }
              }

              if (!is.na(ratio12))
              {
                rrr <- round(as.numeric(as.character(row[1, "RR"])) * ratio12, digits = 1)
                flag <- 5 # MOS interpolated
              }
          }


          # try to split 12 hourly precipitation looking to the next 6 hour observations
          if (is.na(rrr) & !is.null(mos.data) & is.na(row$TR))
          {
            # search if the +6 observation has TR = 12, and then do the split
            row.plus.6 <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == (work.date + 6*3600) &
                                                        !is.na(station.data$TR) &
                                                        station.data$TR == 12 &
                                                        !is.na(station.data$RR))

            if (nrow(row.plus.6) > 0)
            {
              #search the mos PR06 for the 2 observations
              ratio6 <- NA
              ratio12 <- NA
              mos6.row <- subset(mos.data, strptime(mos.data$DayTime, "%Y%m%d%H") == work.date & !is.na(mos.data$PR06))
              mos12.row <- subset(mos.data, strptime(mos.data$DayTime, "%Y%m%d%H") == (work.date + 6*3600) & !is.na(mos.data$PR06))
              if (nrow(mos6.row) > 0 & nrow(mos12.row))
              {
                #if ( !is.na(mos6.row[1, "RR"]) & !is.na(mos12.row[1, "RR"]))
                if ( !is.na(mos6.row[1, "PR06"]) & !is.na(mos12.row[1, "PR06"]))
                {
                  mos.total <- as.numeric(as.character(mos6.row[1, "PR06"])) + as.numeric(as.character(mos12.row[1, "PR06"]))
                  ratio6  <- 0.0
                  ratio12 <- 0.0
                  if (mos.total > 0.0)
                  {
                    ratio6  <- as.numeric(as.character(mos6.row[1, "PR06"])) / mos.total
                    ratio12 <- as.numeric(as.character(mos12.row[1, "PR06"])) / mos.total
                  }
                }
              }

              if (!is.na(ratio6))
              {
                rrr <- round(as.numeric(as.character(row.plus.6[1, "RR"])) * ratio6, digits = 1)
                flag <- 5 # MOS interpolated
              }
            }
          }
        }

        if (!is.na(rrr))
        {
          df[nrow(df) + 1, ] <- c(station.number, format(work.date, "%Y%m%d%H"), rrr, flag)
        }

        # pass to next date
        work.date <- work.date + i.hour.interval * 3600
      }
      return (df)
    }
    ,error = function (err)
    {
      print (paste0('Parallel.RRRGenerator - Error : ', err))
      return (df)
    }
    ,warning = function (warn)
    {
      print (paste0('Parallel.RRRGenerator - Warning: ', warn))
      return (df)
    }
  )

  return (result)

}

#*********************************************************
# Ellaborate the precipitation for entire day for a station relative to 3H deviation
# INPUT Parameters
# station.data    [DATA.FRAME]  contains all precipitation data for the station
# station.number  [INTEGER]     station number
# ref.date        [DATE]        reference date
# start.elab      [DATE]        start ellaboration date
# end.elab        [DATE]        end ellaborate date
# current.path    [STRING]      path to use
# mos.data        [DATA.FRAME]  MOS data
# RETURN
#  Data.Frame with all records for the request hours. The columns of the
# returned data.frame are [Station, DayTime, RRR, Flag]
#*********************************************************
Parallel.RRRGenerator.3H <- function(station.data, station.number, ref.date, start.elab, end.elab, current.path, mos.data)
{
  df <- data.frame(matrix( ncol = 4, nrow = 0))
  colnames(df) <- c("Station","DayTime", "RRR", "Flag")

  # load specific modules if are not loaded yet
  if (!exists("CheckHourlyObservations", mode="function"))
    source( paste0(current.path, "Aggregation/Aggregation.Formulas.R"))

  if (!exists("Aggregation.Column.Interpolation.ByInterval", mode="function"))
    source( paste0(current.path, "Aggregation/AggregationByStation.R"))

  result <- tryCatch(
    {
      isHourlyObservations <- CheckHourlyObservations(station.data[, "DayTime"])

      # interpolate 24 hours precipitation
      prec.inter <- NULL
      if (isHourlyObservations)
      {
        # interpolate data between 00 of current date and 06 of next date
        prec.inter <- Aggregation.Column.Interpolation.ByInterval(station.data, ref.date, "PREC", 1,
                                                                  (ref.date + 0 * 3600),
                                                                  (ref.date + 30 * 3600),
                                                                  31)

        inter.valid <- !is.null(prec.inter)
        if (inter.valid) (inter.valid <- nrow(prec.inter) > 0) else FALSE
        if (inter.valid)
        {
          for (m in 1:nrow(prec.inter))
          {
            # check if the DayTime is present into the observations
            nrows <- nrow(subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == strptime(prec.inter[m, "DayTime"], "%Y%m%d%H")))
            if (nrows >= 1)
            {
              #print (paste0('Interpolated:', prec.inter[m, "Value"]))
              if (!is.na(prec.inter[m, "Value"]))
              {
                prec.value <- suppressWarnings(as.numeric(as.character(prec.inter[m, "Value"])))
                if (prec.value < 0) { prec.value <- 0 }
                station.data[ strptime(station.data$DayTime, "%Y%m%d%H") == strptime(prec.inter[m, "DayTime"], "%Y%m%d%H"), "PREC"] <- prec.value
              }
              else
              {
                #print (prec.inter)
                #print (paste0('NULL for station - ', station.data[1, "Station"]))
              }
            }
          }
        }
      }

      # start from start.elab until end.elab date
      work.date <- start.elab
      i.hour.interval <- 3
      while(work.date <= end.elab)
      {
        # reset variables
        flag = 3
        rrr <- NA

        print (paste0('Station:', station.number, ',Working for date:', format(work.date, '%Y%m%d%H'), "\n"))

        # retrieve data for specific period
        period.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") >= work.date - (i.hour.interval -1) * 3600 &
                                          strptime(station.data$DayTime, "%Y%m%d%H") <= work.date)
        #print(period.df)
        #print (period.df[, c("PR24", "PR06", "PREC", "RR", "TR")])

        # try to find the single row for the observation datetime
        nrow.period <- nrow(period.df)
        if (nrow.period <= 0) {
          print (paste0('Station:', station.number, ' No rows for datetime; ', format(work.date, "%Y%m%d%H")))
          # pass to next date
          work.date <- work.date + i.hour.interval * 3600
          next
        }

        # check if the period.df contains the daytime for current interval
        row <- NULL
        rows <- subset( period.df, strptime(period.df$DayTime, "%Y%m%d%H") == work.date)
        if ( nrow(rows) == 1) {
          row <- rows[1, ]
        }

        # get the RR value if the TR = hour.interval
        if (!is.null(row) & is.na(rrr))
        {
          if (!is.na(row$TR) & !is.na(row$RR) & as.integer(row$TR) == i.hour.interval)
          {
            rrr <- row$RR
          }
        }

        # check if the period.DF contains a number of rows = hour.interval
        if (is.na (rrr) & nrow(period.df) == i.hour.interval)
        {
          # try to get the hourly precipitation values if all are presents
          valid.data <- which(!is.na(period.df$PREC))
          if ( length(valid.data) == i.hour.interval)
          {
            rrr <- round(sum(period.df$PREC), digits = 1)

            # search for interpolated values on hourl PREC to set the FLAG = 4
            if (!is.null(prec.inter))
            {
              endIndex   <- 25 + difftime(work.date, ref.date, units = "hours")
              startIndex <- endIndex - i.hour.interval
              is.interpolated <- which ( prec.inter$Index >= startIndex & prec.inter$Index <= endIndex)
              flag <- if (length(is.interpolated) > 0) 4 else 3
            }
          }
          else if (length(valid.data) == (i.hour.interval - 1) & !is.null(mos.data))
          {
            # try to retrieve the missing values from MOS file
            check.date <- work.date - (i.hour.interval-1) * 3600
            prec.1H <- c()
            while (check.date <= work.date)
            {
              #get row
              row.df <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == check.date)
              if (nrow(row.df) == 0 || is.na(row.df[1, "PREC"]))
              {
                # search invide mos the date
                mos.1H.row <- subset(mos.data, strptime(mos.data$DayTime, "%Y%m%d%H") == check.date)
                if (nrow(mos.1H.row) > 0 & !is.na(mos.1H.row[1, "PREC"]))
                {
                  prec.1H <- c(prec.1H, mos.1H.row[1, "PREC"])
                }
              }
              else
              {
                prec.1H <- c(prec.1H, row.df[1, "PREC"])
              }

              check.date <- check.date + 1 * 3600
            }

            if (length(prec.1H) == i.hour.interval)
            {
              rrr <- round(sum(prec.1H), digits = 1)
              flag = 5
            }
          }
        }


        # try to calculate the MOS ratio if the RR/TR for 6/12 H are present
        if (is.na(rrr) & !is.null(mos.data))
        {
          #search the mos hourly precipitation values
          mos.rows <- NULL
          RR6 <- NA
          # TR present
          if  (!is.na(row$TR))
          {
            if (as.integer(row$TR) == 6 & !is.na(row$RR))
            {
              RR6 <- row$RR
            }
            else if (as.integer(row$TR) == 12 & !is.na(row$RR))
            {
              #need to find the previous 6 hour value
              previous.6H <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == (work.date - 6*3600))
              if (nrow(previous.6H) >= 1)
              {
                if (!is.na(previous.6H[1, "RR"]) & !is.na(previous.6H[1, "TR"]) & as.integer(previous.6H[1, "TR"]) == 6)
                {
                  RR6 <- row$RR - previous.6H[1, "RR"]
                  RR6 <- ifelse( RR6 < 0, 0, RR6)
                }
              }
            }
            # retrieve MOS data only if have a valid valid for 6H precipitation
            if (!is.na(RR6))
            {
              mos.rows <- subset(mos.data, strptime(mos.data$DayTime, "%Y%m%d%H") >= (work.date - ( (2 * i.hour.interval - 1) * 3600)) &
                                           strptime(mos.data$DayTime, "%Y%m%d%H") <= work.date)
            }
          }
          # TR not present that level
          else
          {
            # check the row 3 hours late to get the RR
            rr.rows <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == (work.date + 3*3600))
            if (nrow(rr.rows) >= 1)
            {
              if (!is.na(rr.rows[1, "RR"]) & as.integer(rr.rows[1, "TR"]) == 6)
              {
                RR6 <- rr.rows[1, "RR"]
              }
              else if (!is.na(rr.rows[1, "RR"]) & as.integer(rr.rows[1, "TR"]) == 12)
              {
                #need to find the previous 6 hour value
                previous.6H <- subset(station.data, strptime(station.data$DayTime, "%Y%m%d%H") == (work.date - 3*3600))
                if (nrow(previous.6H) >= 1)
                {
                  if (!is.na(previous.6H[1, "RR"]) & !is.na(previous.6H[1, "TR"]) & as.integer(previous.6H[1, "TR"]) == 6)
                  {
                    RR6 <- rr.rows[1, "RR"] - previous.6H[1, "RR"]
                    RR6 <- ifelse (RR6 < 0, 0, RR6)
                  }
                }
              }
            }

            if (!is.na(RR6))
            {
              mos.rows <- subset(mos.data, strptime(mos.data$DayTime, "%Y%m%d%H") >= (work.date - ( (i.hour.interval - 1) * 3600)) &
                                           strptime(mos.data$DayTime, "%Y%m%d%H") <= work.date + (i.hour.interval * 3600))
            }
          }

          if (!is.null(mos.rows))
          {
            if (nrow(mos.rows) == 6 & !is.na(RR6))
            {
              #check the number of valid values for 1 H precipitations
              valid.mos.prec <- which(!is.na(mos.rows[, "PREC"]))
              if (length(rows) == 6)
              {
                total.prec <- sum(mos.rows[, "PREC"], na.rm = TRUE)
                partial.1 <- as.numeric(as.character(mos.rows[1, "PREC"])) +
                             as.numeric(as.character(mos.rows[2, "PREC"])) +
                             as.numeric(as.character(mos.rows[3, "PREC"]))
                partial.2 <- as.numeric(as.character(mos.rows[4, "PREC"])) +
                             as.numeric(as.character(mos.rows[5, "PREC"])) +
                             as.numeric(as.character(mos.rows[6, "PREC"]))

                ratio.1 <- 0.0
                ratio.2 <- 0.0

                if (total.prec > 0.0)
                {
                  ratio.1 <- round(RR6 * partial.1/total.prec, digits=1)
                  ratio.2 <- round(RR6 * partial.2/total.prec, digits=1)
                }

                # calculate final value
                rrr <- ifelse (is.na(row$TR), ratio.1, ratio.2)
                flag <- 5
              }
            }
          }
        }

        if (!is.na(rrr))
        {
          df[nrow(df) + 1, ] <- c(station.number, format(work.date, "%Y%m%d%H"), rrr, flag)
        }

        # pass to next date
        work.date <- work.date + i.hour.interval * 3600
      }
      return (df)
    }
    ,error = function (err)
    {
      print (paste0('Parallel.RRRGenerator.3H - Error : ', err))
      return (df)
    }
    ,warning = function (warn)
    {
      print (paste0('Parallel.RRRGenerator.3H - Warning: ', warn))
      return (df)
    }
  )

  return (result)

}

#*********************************************************
# Ellaborate the precipitation for entire day for a station
# INPUT Parameters
# mosPath         [STRING]  path of MOS file
# refDate         [DATE]    reference date
# input.stations  [VECTOR]  array of stations
# columns.numnber [INT]     number of managed columns
# RETURN
#  Data.Frame with mos data
#*********************************************************
RRRGenerator.ReadMOSByDate <- function(mosPath, reference.date, input.stations, columns.number)
{
  mosdata <- NULL

  #check if the file MOS.<reference date>.dat is present
  mosfile <- paste0(mosPath, "MOS.", format(reference.date, "%Y%m%d"), ".dat")
  if (file.exists(mosfile))
  {
    mosdata <- read.table(mosfile, header = TRUE)
    if (length(colnames(mosdata)) != columns.number)
    {
      mosdata <- NULL
    }
  }

  # read from CSV file if the .dat missing or is not valid
  if (is.null(mosdata))
  {
    # load the converter module
    currentPath <- paste0(getwd() , '/')
    source( paste0(currentPath, "Converters.R"))

    # load and convert the MOS csv file
    mosfile <- paste0(mosPath, "M.MG.", format(reference.date, "%Y%m%d"), ".csv")
    if (!file.exists(mosfile))
    {
      cat(paste0('[', Sys.time(), ']W| Missing MOS file ', mosfile), file = log.file, sep="\n")
    }
    else
    {
      mos.datfile <- Input.MG.MOS.Converter(mosPath,
                                            paste0("M.MG.", format(reference.date, "%Y%m%d"), ".csv"),
                                            format(reference.date, "%Y%m%d"),
                                            input.stations)
      mosdata <- read.table(mos.datfile, header = TRUE)
    }
  }

  if (is.null(mosdata))
  {
    print(paste0('MOS file missing for date ', format(reference.date, "%Y%m%d")))
  }
  else
  {
    print (paste0('MOS file ', mosfile, ' loaded.' ))
  }

  return (mosdata)
}
