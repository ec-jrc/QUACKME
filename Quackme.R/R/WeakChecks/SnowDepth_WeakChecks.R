#*********************************************************
#             Snow Depth Weak Checks
#*********************************************************

#*********************************************************
# The checks will be done for a single station
# Parameters :
#  - xml.obs    [INPUT] [XML]			    - xml data of the observations relative to the date to be analyse
#  - hist.obs   [INPUT] [DATA.FRAME]  - data frame with hourly observations data starting from date to analyse - 1 with a deep of ? days
#  - day.obs    [INPUT] [INT]			    - day to analyze (like int in the format YYYYMMDDHH)
#  - xml.errors [INPUT] [XML]         - xml errors
#  - mos.data   [INPUT] [DATA.FRAME]  - MOS data
# RETURN :
#               [XML]                 - station observation with some ALERT messages, if error was detected
#*********************************************************
WeakChecks.ChecksSnowDepth <- function(xml.obs, df.obs, day.obs, xml.errors, mos.data)
{
  # set previous and current day
  #print ( paste('Current date snow:', day.obs, sep=""))
  currDay <- day.obs
  prevDay <- currDay - 3600 * 24

  # extract the observations of the previous 24 hour to determine the average between min and max observed temperature
  ts1 <- currDay - 3600 * 24
  te1 <- currDay - 1
  df.obs.last24 <- subset(df.obs, strptime(DayTime, "%Y%m%d%H") >= ts1 & strptime(DayTime, "%Y%m%d%H") <= te1)

  # initialize variables
  tt.ave <- 0
  tt.min.24 <- 0
  tt.max.24 <- 0
  if (nrow(df.obs.last24) > 0)
  {
    tt.min.24 <- min( df.obs.last24$TTT, na.rm = TRUE)
    tt.max.24 <- max( as.numeric(as.character(df.obs.last24$TTT)), na.rm = TRUE)
    tt.ave <- (tt.min.24 + tt.max.24) / 2
  }
  #print (paste('TT.min.24:', tt.min.24, ', TT.max.24:', tt.max.24, ', TT.ave:', tt.ave))

  # calculate precipitation values
  ts2.12 <- currDay - 3600 * 12
  te2 <- currDay - 1
  rrr.12 <- sum( df.obs$PREC, na.rm = TRUE & strptime(df.obs$DayTime, "%Y%m%d%H") >= ts2.12 & strptime(df.obs$DayTime, "%Y%m%d%H") <= te2)
  ts2.24 <- currDay - 3600 * 24
  rrr.24 <- sum( as.numeric(as.character(df.obs$PREC)), na.rm = TRUE & strptime(df.obs$DayTime, "%Y%m%d%H") >= ts2.24 & strptime(df.obs$DayTime, "%Y%m%d%H") <= te2)
  ts2.36 <- currDay - 3600 * 36
  rrr.36 <- sum( as.numeric(as.character(df.obs$PREC)), na.rm = TRUE & strptime(df.obs$DayTime, "%Y%m%d%H") >= ts2.36 & strptime(df.obs$DayTime, "%Y%m%d%H") <= te2)
  ts2.48 <- currDay - 3600 * 48
  rrr.48 <- sum( as.numeric(as.character(df.obs$PREC)), na.rm = TRUE &  strptime(df.obs$DayTime, "%Y%m%d%H") >= ts2.48 & strptime(df.obs$DayTime, "%Y%m%d%H") <= te2)

  #print (paste('RRR.12:', rrr.12, ', RRR.24:', rrr.24, 'RRR.36:', rrr.36, 'RRR.48', rrr.48))

  # get dailly observations
  te.today <- currDay + 3600 * 24 -1
  df.obs.today <- subset(df.obs, strptime(DayTime, "%Y%m%d%H") >= currDay & strptime(DayTime, "%Y%m%d%H") <= te.today)
  #print (df.obs.today)

  # for each observation
  for (obs in 1:nrow(df.obs.today))
  {
    row <- df.obs.today[obs, ]

    # skip to next row if the current SNOW value are NOT DEFINED
    if (is.na( row$SNOW))
    {
        next
    }

    d.snow <- 0
    obs.node.snow <- getNodeSet(xml.obs, paste("//*/Observation[DayTime=\"",row$DayTime ,"\"]/SNOW", sep="") )
    if ( length( obs.node.snow) < 1)
    {
        next
    }

    # check if exist the observation for snow 24 hours earlier
    ts.snow.24 <- strptime( row$DayTime, "%Y%m%d%H" ) - 3600 * 24
    obs.24 <- subset(df.obs, strptime(DayTime, "%Y%m%d%H" ) ==  ts.snow.24)
    if (!(is.null(obs.24) | is.na (obs.24[1,]$SNOW)))
    {
      print ( paste('24 snow:', obs.24[1,]$Snow))
      d.snow <- row$SNOW - obs.24[1,]$SNOW
    }
    #print (paste ('snow:', row$Snow, ',dsnow:', d.snow))

    # solo for test
    tn <- 10
    tx <- 10

    if (d.snow > 0)
    {
      if (tn > 5)
      {
        if ( row$TTT > 1 & substr(row$DayTime, 9, 10) == "18")
        {
          obs.node.snow[[1]] <- Errors.Message.Property (row, xml.errors, "001", "SNOW", obs.node.snow[[1]])
        }
      }
    }

    if (tt.ave > 10)
    {
      obs.node.snow[[1]] <- Errors.Message.Property (row, xml.errors, "002", "SNOW", obs.node.snow[[1]])
    }

    # check the snow observation for 24h before, 36 hour before and 48 hour before
    tt.snow.36 <- strptime ( row$DayTime, "%Y%m%d%H") - 3600 * 36
    tt.snow.48 <- strptime ( row$DayTime, "%Y%m%d%H") - 3600 * 48
    obs.snow36 <- df.obs [ which ( strptime(df.obs$DayTime, "%Y%m%d%H") == tt.snow.36), "Snow"]
    obs.snow48 <- df.obs [ which ( strptime(df.obs$DayTime, "%Y%m%d%H") == tt.snow.48), "Snow"]

    if ( !(is.null(obs.24) &
            is.null(obs.snow36) &
             is.null(obs.snow48) &
              row$SNOW < 100 & rrr.24 < 0.05))
    {

      if (row$SNOW < 0.2 * row$PREC & tn < 0 & tx < 0 )
      {
        obs.node.snow[[1]] <- Errors.Message.Property (row, xml.errors, "003", "SNOW", obs.node.snow[[1]])
      }

      if (d.snow > 0.4 * row$PREC )
      {
        obs.node.snow[[1]] <- Errors.Message.Property (row, xml.errors, "004", "SNOW", obs.node.snow[[1]])
      }

      if (d.snow < -50)
      {
        obs.node.snow[[1]] <- Errors.Message.Property (row, xml.errors, "005", "SNOW", obs.node.snow[[1]])
      }

      if (row$SNOW >= 900 & row$PREC >= 200)
      {
        obs.node.snow[[1]] <- Errors.Message.Property (row, xml.errors, "006", "SNOW", obs.node.snow[[1]])
      }

      if ( row$SNOW >= 500 && d.snow > 200 & (row$SNOW >= 200 & row$PREC >= 100))
      {
        obs.node.snow[[1]] <- Errors.Message.Property (row, xml.errors, "007", "SNOW", obs.node.snow[[1]])
      }
    }
  }

  return (xml.obs)
}
