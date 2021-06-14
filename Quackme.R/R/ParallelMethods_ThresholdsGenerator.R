library(rgdal)
library(sp)
library(sf)
library(gstat)
library(automap)

#*********************************************************
# Methods to generate thresholds values (daily & seasons)
# for various meteorological parameters
#*********************************************************

#*********************************************************
# Generate the daily thresholds for current station
# current.station   [IN]  [INT]         station number
# current.path      [IN]  [STRING]      path for source modules
# reference.year    [IN]  [INT]         reference year for which generate the threshods
# RETURN Data.Frame with daily results
#*********************************************************
Parallel.TGenerator.Daily.Ellaboration <- function(current.station, current.path, reference.year)
{
  # load methods module
  source( paste0(current.path, "TGenerator.Methods.R"))

  years = c(1985, reference.year)

  #read data for current station
  print (paste0('Start reading data for station ', current.station,' at',Sys.time()))
  con <- odbcConnect("<dbname>", uid="<password>", pwd="<password>", rows_at_time = 500)

  # prepare query
  sSQL = "Select day,
    (case when min(TMax)='z' then 'NA' else min(TMax) end) as tmax,
    (case when min(TMin)='z' then 'NA' else min(TMin) end) as tmin,
    (case when min(TMean)='z' then 'NA' else min(TMean) end) as tmean
        from <tablename>
          group by day
          order by day"

  sSQL = gsub('#StationNumber#', current.station, sSQL)

  # read values from database
  tValues <- as.matrix(sqlQuery(con, sSQL))
  tmax <- as.vector(tValues[,2])
  tmin <- as.vector(tValues[,3])
  tmean <- as.vector(tValues[,4])

  close(con)
  print (paste0('End reading data for station ', current.station,' at',Sys.time()))

  tmax[ tmax == 'NA' ] <- NA
  tmax <- as.numeric(tmax)

  tmin[ tmin == 'NA' ] <- NA
  tmin <- as.numeric(tmin)

  tmean[ tmean == 'NA' ] <- NA
  tmean <- as.numeric(tmean)

  n.t <- length(tmean)
  for (t in 1:n.t)
  {
    if (is.na(tmean[t]) | is.na(tmax[t]) | is.na(tmin[t]))
    {
      tmean[t] <- NA
      tmax[t]  <- NA
      tmin[t]  <- NA
    }
  }

  # process daily data for current station
  #numberofRows = if (leap.year(reference.year)) 366 else 365
  numberofRows <- 365
  daily.station <- data.frame(matrix(ncol=8, nrow=numberofRows))
  colnames(daily.station) <- c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1")
  daily.station["Station"] <- rep(current.station, numberofRows)
  for(i in 1:numberofRows)
  {
    daily.station[i, "Day"] <- i
  }

  #myTime <- 1:365

  tryCatch(
    {
      #Pierluca De Palma
      #19.09.2019 remove apply and add loess

      # min temperature
      if (sum(!is.na(tmin))>2300)
      {
        #daily.station["MTN99"] <- round(loess(perc.ref(tmin, p=0.99, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        #daily.station["MTN1"] <-  round(loess(perc.ref(tmin, p=0.01, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)

        #mtn99.p <- perc.ref(tmin, p=0.99, ref=c(1985,2018))
        #mtn1.p <- perc.ref(tmin, p=0.01, ref=c(1985,2018))

        #cn99 <- c(mtn99.p[351:365], mtn99.p, mtn99.p[1:15])
        #cn1 <- c(mtn1.p[351:365], mtn1.p, mtn1.p[1:15])

        #cn99.ta <- max.peak(cn99)
        #cn1.ta <- min.peak(cn1)

        #cn99.tb <- max.peak(cn99.ta[,2])
        #cn1.tb <- min.peak(cn1.ta[,2])

        #mtn99 <- round(spline(cn99.ta[cn99.tb[,1],1],cn99.tb[,2],xout=1:395,method='natural')$y[16:380], digits = 1)
        #mtn1 <- round(spline(cn1.ta[cn1.tb[,1],1],cn1.tb[,2],xout=1:395,method='natural')$y[16:380], digits = 1)
        #daily.station["MTN99"] <- mtn99
        #daily.station["MTN1"] <- mtn1

        mtn99.p <- perc.ref(tmin, p=0.99, ref= years)
        mtn1.p <- perc.ref(tmin, p=0.01, ref= years)

        cn99 <- c(mtn99.p[351:365], mtn99.p, mtn99.p[1:15])
        cn1 <- c(mtn1.p[351:365], mtn1.p, mtn1.p[1:15])

        cn99.ta <- max.peak(cn99)
        cn1.ta <- min.peak(cn1)

        cn99.tb <- max.peak(cn99.ta[,2])
        cn1.tb <- min.peak(cn1.ta[,2])

        int.spline9 = splinefunH(cn99.ta[cn99.tb[,1],1],cn99.tb[,2],m=tang(cbind(cn99.ta[cn99.tb[,1],1],cn99.tb[,2])))
        int.spline1 = splinefunH(cn1.ta[cn1.tb[,1],1],cn1.tb[,2],m=tang(cbind(cn1.ta[cn1.tb[,1],1],cn1.tb[,2])))
        mtn99 = round(int.spline9(1:395)[16:380],digit=1)
        mtn1 = round(int.spline1(1:395)[16:380],digit=1)

        daily.station["MTN99"] <- mtn99
        daily.station["MTN1"] <- mtn1

      }

      # max temperature
      if (sum(!is.na(tmax))>2300)
      {
        #daily.station["MTX99"] <- round(loess(perc.ref(tmax, p=0.99, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        #daily.station["MTX1"] <-  round(loess(perc.ref(tmax, p=0.01, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)

        #mtx99.p <- perc.ref(tmax, p=0.99, ref=c(1985,2018))
        #mtx1.p <- perc.ref(tmax, p=0.01, ref=c(1985,2018))

        #cx99 <- c(mtx99.p[351:365], mtx99.p, mtx99.p[1:15])
        #cx1 <- c(mtx1.p[351:365], mtx1.p, mtx1.p[1:15])

        #cx99.ta <- max.peak(cx99)
        #cx1.ta <- min.peak(cx1)

        #cx99.tb <- max.peak(cx99.ta[,2])
        #cx1.tb <- min.peak(cx1.ta[,2])

        #mtx99 <- round(spline(cx99.ta[cx99.tb[,1],1],cx99.tb[,2],xout=1:395,method='natural')$y[16:380], digits = 1)
        #mtx1 <- round(spline(cx1.ta[cx1.tb[,1],1],cx1.tb[,2],xout=1:395,method='natural')$y[16:380], digits = 1)

        #daily.station["MTX99"] <- mtx99
        #daily.station["MTX1"] <- mtx1

        mtx99.p <- perc.ref(tmax, p=0.99, ref= years)
        mtx1.p <- perc.ref(tmax, p=0.01, ref= years)

        cx99 <- c(mtx99.p[351:365], mtx99.p, mtx99.p[1:15])
        cx1 <- c(mtx1.p[351:365], mtx1.p, mtx1.p[1:15])

        cx99.ta <- max.peak(cx99)
        cx1.ta <- min.peak(cx1)

        cx99.tb <- max.peak(cx99.ta[,2])
        cx1.tb <- min.peak(cx1.ta[,2])

        int.spline9 = splinefunH(cx99.ta[cx99.tb[,1],1],cx99.tb[,2],m=tang(cbind(cx99.ta[cx99.tb[,1],1],cx99.tb[,2])))
        int.spline1 = splinefunH(cx1.ta[cx1.tb[,1],1],cx1.tb[,2],m=tang(cbind(cx1.ta[cx1.tb[,1],1],cx1.tb[,2])))
        mtx99 = round(int.spline9(1:395)[16:380],digit=1)
        mtx1 = round(int.spline1(1:395)[16:380],digit=1)

        daily.station["MTX99"] <- mtx99
        daily.station["MTX1"] <- mtx1

      }

      # mean temperature
      if (sum(!is.na(tmean))>2300)
      {
        #daily.station["MT99"] <-  round(loess(perc.ref(tmean, p=0.99, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        #daily.station["MT1"] <-  round(loess(perc.ref(tmean, p=0.01, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)

        #mt99.p <- perc.ref(tmean, p=0.99, ref=c(1985,2018))
        #mt1.p <- perc.ref(tmean, p=0.01, ref=c(1985,2018))

        #c99 <- c(mt99.p[351:365], mt99.p, mt99.p[1:15])
        #c1 <- c(mt1.p[351:365], mt1.p, mt1.p[1:15])

        #c99.ta <- max.peak(c99)
        #c1.ta <- min.peak(c1)

        #c99.tb <- max.peak(c99.ta[,2])
        #c1.tb <- min.peak(c1.ta[,2])

        #mt99 <- round(spline(c99.ta[c99.tb[,1],1],c99.tb[,2],xout=1:395,method='natural')$y[16:380], digits = 1)
        #mt1 <- round(spline(c1.ta[c1.tb[,1],1],c1.tb[,2],xout=1:395,method='natural')$y[16:380], digits = 1)

        #daily.station["MT99"] <- mt99
        #daily.station["MT1"] <- mt1

        mtm99.p <- perc.ref(tmean, p=0.99, ref= years)
        mtm1.p <- perc.ref(tmean, p=0.01, ref= years)

        cm99 <- c(mtm99.p[351:365], mtm99.p, mtm99.p[1:15])
        cm1 <- c(mtm1.p[351:365], mtm1.p, mtm1.p[1:15])

        cm99.ta <- max.peak(cm99)
        cm1.ta <- min.peak(cm1)

        cm99.tb <- max.peak(cm99.ta[,2])
        cm1.tb <- min.peak(cm1.ta[,2])

        int.spline9 = splinefunH(cm99.ta[cm99.tb[,1],1],cm99.tb[,2],m=tang(cbind(cm99.ta[cm99.tb[,1],1],cm99.tb[,2])))
        int.spline1 = splinefunH(cm1.ta[cm1.tb[,1],1],cm1.tb[,2],m=tang(cbind(cm1.ta[cm1.tb[,1],1],cm1.tb[,2])))
        mtm99 = round(int.spline9(1:395)[16:380],digit=1)
        mtm1 = round(int.spline1(1:395)[16:380],digit=1)

        daily.station["MT99"] <- mtm99
        daily.station["MT1"] <- mtm1
      }

      if (leap.year(reference.year))
      {
        # position of row for 29.02
        r <- 60
        row2802 <- daily.station[59, ]
        daily.station[ seq(r+1, nrow(daily.station)+1), ] <- daily.station[ seq(r, nrow(daily.station)), ]
        daily.station[r,] <- row2802
        daily.station[r : nrow(daily.station), "Day"] <- daily.station[r : nrow(daily.station), "Day"] + 1
      }

    },
    error = function(err) {
      print ( paste0('[ERROR] TGenerator.Daily.Ellaboration (', current.station,"): ", err))
      return (daily.station)
    },
    warning = function(warn) {
      print ( paste0('[WARNING] TGenerator.Daily.Ellaboration (', current.station,"): ", warn))
      return (daily.station)
    })

  return (daily.station)
}

#*********************************************************
# Generate the seasons thresholds for current station
# current.station   [IN]  [INT]         station number
# current.path      [IN]  [STRING]      path for source modules
# RETURN Data.Frame with seasons results
#*********************************************************
Parallel.TGenerator.Seasons.Ellaboration <- function(current.station, current.path, reference.year)
{
  # load methods module
  source( paste0(current.path, "TGenerator.Methods.R"))

  years = c(1985, reference.year)

  season.station <- data.frame(matrix(ncol=10, nrow=4) )
  colnames(season.station) <- c("Station", "Season", "MT5", "MT95", "MTX5", "MTX95", "MTN5", "MTN95", "RRR5Y", "FF5Y")

  result <- tryCatch({
    #read data for current station
    print (paste0('Start reading data for station ', current.station,' at',Sys.time()))
    con <- odbcConnect("<dbname>", uid="<username>", pwd="<password>", rows_at_time = 100)

    # prepare the query
    sSQL = "Select day,
    (case when min(tmax)='z' then 'NA' else min(tmax) end) as tmax,
    (case when min(tmin)='z' then 'NA' else min(tmin) end) as tmin,
    (case when min(tmean)='z' then 'NA' else min(tmean) end) as tmean,
    (case when min(prec)='z' then 'NA' else min(prec) end) as prec,
    (case when min(wind)='z' then 'NA' else min(wind) end) as wind
    from <tablename>
    group by day
    order by day"

    sSQL = gsub('#StationNumber#', current.station, sSQL)
    sSQL = gsub('#ReferenceYear#', reference.year, sSQL)
    print (sSQL)

    # read values
    tValues <- as.matrix(sqlQuery(con, sSQL))
    tmin <- as.numeric(as.vector(tValues[,2]))
    tmax <- as.numeric(as.vector(tValues[,3]))
    tmean <- as.numeric(as.vector(tValues[,4]))
    precipitation <- as.numeric(as.vector(tValues[,5]))
    windspeed <- as.numeric(as.vector(tValues[,6]))

    # close database connection
    close(con)
    print (paste0('End reading data for station ', current.station,' at',Sys.time()))

    # fill the station column
    season.station["Station"] <- rep(current.station, 4)
    season.station[1:4, "Season"] <- c('winter', 'spring', 'summer', 'autumn')

    #***************************
    # Pierluca De Palma - 06.09.2019 - Changed:
    # day.jump from 0.95 to 0.99
    # day.jump from 0.05 to 0.01
    # rv.p from 5 to 10
    # remove apply (19.09.2019)
    #***************************

    #temperature season calculation
    season.station[1, "MT95"] <- round(day.jump(tmean,seas='winter',p=0.99,ref= years), digits=2)
    season.station[2, "MT95"] <- round(day.jump(tmean,seas='spring',p=0.99,ref= years), digits=2)
    season.station[3, "MT95"] <- round(day.jump(tmean,seas='summer',p=0.99,ref= years), digits=2)
    season.station[4, "MT95"] <- round(day.jump(tmean,seas='autumn',p=0.99,ref= years), digits=2)

    season.station[1, "MT5"] <- round(day.jump(tmean,seas='winter',p=0.01,ref= years), digits=2)
    season.station[2, "MT5"] <- round(day.jump(tmean,seas='spring',p=0.01,ref= years), digits=2)
    season.station[3, "MT5"] <- round(day.jump(tmean,seas='summer',p=0.01,ref= years), digits=2)
    season.station[4, "MT5"] <- round(day.jump(tmean,seas='autumn',p=0.01,ref= years), digits=2)

    season.station[1, "MTX95"] <- round(day.jump(tmax,seas='winter',p=0.99,ref= years), digits=2)
    season.station[2, "MTX95"] <- round(day.jump(tmax,seas='spring',p=0.99,ref= years), digits=2)
    season.station[3, "MTX95"] <- round(day.jump(tmax,seas='summer',p=0.99,ref= years), digits=2)
    season.station[4, "MTX95"] <- round(day.jump(tmax,seas='autumn',p=0.99,ref= years), digits=2)

    season.station[1, "MTX5"] <- round(day.jump(tmax,seas='winter',p=0.01,ref= years), digits=2)
    season.station[2, "MTX5"] <- round(day.jump(tmax,seas='spring',p=0.01,ref= years), digits=2)
    season.station[3, "MTX5"] <- round(day.jump(tmax,seas='summer',p=0.01,ref= years), digits=2)
    season.station[4, "MTX5"] <- round(day.jump(tmax,seas='autumn',p=0.01,ref= years), digits=2)

    season.station[1, "MTN95"] <- round(day.jump(tmin,seas='winter',p=0.99,ref= years), digits=2)
    season.station[2, "MTN95"] <- round(day.jump(tmin,seas='spring',p=0.99,ref= years), digits=2)
    season.station[3, "MTN95"] <- round(day.jump(tmin,seas='summer',p=0.99,ref= years), digits=2)
    season.station[4, "MTN95"] <- round(day.jump(tmin,seas='autumn',p=0.99,ref= years), digits=2)

    season.station[1, "MTN5"] <- round(day.jump(tmin,seas='winter',p=0.01,ref= years), digits=2)
    season.station[2, "MTN5"] <- round(day.jump(tmin,seas='spring',p=0.01,ref= years), digits=2)
    season.station[3, "MTN5"] <- round(day.jump(tmin,seas='summer',p=0.01,ref= years), digits=2)
    season.station[4, "MTN5"] <- round(day.jump(tmin,seas='autumn',p=0.01,ref= years), digits=2)

    # precipitation season calculation
    season.station[1, "RRR5Y"] <- round(rv.p(precipitation,seas='winter',p=10,ref= years), digits=2)
    season.station[2, "RRR5Y"] <- round(rv.p(precipitation,seas='spring',p=10,ref= years), digits=2)
    season.station[3, "RRR5Y"] <- round(rv.p(precipitation,seas='summer',p=10,ref= years), digits=2)
    season.station[4, "RRR5Y"] <- round(rv.p(precipitation,seas='autumn',p=10,ref= years), digits=2)

    # wind speed season calculation
    season.station[1, "FF5Y"] <- round(rv.p(windspeed,seas='winter',p=10,ref= years), digits=2)
    season.station[2, "FF5Y"] <- round(rv.p(windspeed,seas='spring',p=10,ref= years), digits=2)
    season.station[3, "FF5Y"] <- round(rv.p(windspeed,seas='summer',p=10,ref= years), digits=2)
    season.station[4, "FF5Y"] <- round(rv.p(windspeed,seas='autumn',p=10,ref= years), digits=2)

    return (season.station)
  },
  error = function(err) {
    print ( paste0('[ERROR] Parallel.TGenerator.Seasons.Ellaboration :', err))
    return (season.station)
  },
  warning = function(warn) {
    print ( paste0('[WARNING] Parallel.TGenerator.Seasons.Ellaboration :', warn))
    return (season.station)
  }  )

  return (result)
}


#------- CHINA methods ---------
#*********************************************************
# Generate the daily thresholds for current station
# current.station   [IN]  [INT]         station number
# current.path      [IN]  [STRING]      path for source modules
# reference.year    [IN]  [INT]         reference year for which generate the threshods
# RETURN Data.Frame with daily results
#*********************************************************
Parallel.TGenerator.Daily.CHINA <- function(current.station, current.path, reference.year)
{
  # load methods module
  source( paste0(current.path, "TGenerator.Methods.R"))
  years <- c(1985, reference.year)

  #read data for current station
  print (paste0('Start reading data for station ', current.station,' at',Sys.time()))
  con <- odbcConnect("<dbname>", uid="<username>", pwd="<password>", rows_at_time = 500)

  # prepare query
  sSQL = "Select day,
  (case when min(TMax)='z' then 'NA' else min(TMax) end) as tmax,
  (case when min(TMin)='z' then 'NA' else min(TMin) end) as tmin,
  (case when min(TMean)='z' then 'NA' else min(TMean) end) as tmean
  from <tablename>
  group by day
  order by day"

  sSQL = gsub('#StationNumber#', current.station, sSQL)
  sSQL = gsub('#ReferenceYear#', reference.year, sSQL)
  sSQL = gsub('#ReferenceNextYear#', reference.year + 1, sSQL)

  # read values from database
  tValues <- as.matrix(sqlQuery(con, sSQL))
  tmax <- as.numeric(as.vector(tValues[,2]))
  tmin <- as.numeric(as.vector(tValues[,3]))
  tmean <- as.numeric(as.vector(tValues[,4]))

  close(con)
  print (paste0('End reading data for station ', current.station,' at',Sys.time()))

  # process daily data for current station
  daily.station <- data.frame(matrix(ncol=8, nrow=365))
  colnames(daily.station) <- c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1")
  daily.station["Station"] <- rep(current.station, 365)
  for(i in 1:365)
  {
    daily.station[i, "Day"] <- i
  }

  myTime <- 1:365

  tryCatch(
    {
      #Pierluca De Palma
      #19.09.2019 remove apply and add loess

      # min temperature
      if (sum(!is.na(tmin))>2300)
      {
        #daily.station["MTN99"] <- round(loess(perc.ref(tmin, p=0.99, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        #daily.station["MTN1"] <-  round(loess(perc.ref(tmin, p=0.01, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        mtn99.p <- perc.ref(tmin, p=0.99, ref= years)
        mtn1.p <- perc.ref(tmin, p=0.01, ref= years)

        cn99 <- c(mtn99.p[351:365], mtn99.p, mtn99.p[1:15])
        cn1 <- c(mtn1.p[351:365], mtn1.p, mtn1.p[1:15])

        cn99.ta <- max.peak(cn99)
        cn1.ta <- min.peak(cn1)

        cn99.tb <- max.peak(cn99.ta[,2])
        cn1.tb <- min.peak(cn1.ta[,2])

        int.spline9 = splinefunH(cn99.ta[cn99.tb[,1],1],cn99.tb[,2],m=tang(cbind(cn99.ta[cn99.tb[,1],1],cn99.tb[,2])))
        int.spline1 = splinefunH(cn1.ta[cn1.tb[,1],1],cn1.tb[,2],m=tang(cbind(cn1.ta[cn1.tb[,1],1],cn1.tb[,2])))
        mtn99 = round(int.spline9(1:395)[16:380],digit=1)
        mtn1 = round(int.spline1(1:395)[16:380],digit=1)

        daily.station["MTN99"] <- mtn99
        daily.station["MTN1"] <- mtn1
      }

      # max temperature
      if (sum(!is.na(tmax))>2300)
      {
        #daily.station["MTX99"] <- round(loess(perc.ref(tmax, p=0.99, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        #daily.station["MTX1"] <-  round(loess(perc.ref(tmax, p=0.01, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        mtx99.p <- perc.ref(tmax, p=0.99, ref= years)
        mtx1.p <- perc.ref(tmax, p=0.01, ref= years)

        cx99 <- c(mtx99.p[351:365], mtx99.p, mtx99.p[1:15])
        cx1 <- c(mtx1.p[351:365], mtx1.p, mtx1.p[1:15])

        cx99.ta <- max.peak(cx99)
        cx1.ta <- min.peak(cx1)

        cx99.tb <- max.peak(cx99.ta[,2])
        cx1.tb <- min.peak(cx1.ta[,2])

        int.spline9 = splinefunH(cx99.ta[cx99.tb[,1],1],cx99.tb[,2],m=tang(cbind(cx99.ta[cx99.tb[,1],1],cx99.tb[,2])))
        int.spline1 = splinefunH(cx1.ta[cx1.tb[,1],1],cx1.tb[,2],m=tang(cbind(cx1.ta[cx1.tb[,1],1],cx1.tb[,2])))
        mtx99 = round(int.spline9(1:395)[16:380],digit=1)
        mtx1 = round(int.spline1(1:395)[16:380],digit=1)

        daily.station["MTX99"] <- mtx99
        daily.station["MTX1"] <- mtx1
      }

      # mean temperature
      if (sum(!is.na(tmean))>2300)
      {
        #daily.station["MT99"] <-  round(loess(perc.ref(tmean, p=0.99, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        #daily.station["MT1"] <-  round(loess(perc.ref(tmean, p=0.01, ref=c(1985,2018))~myTime,span=0.7,degree=2)$fitted,digits=2)
        mtm99.p <- perc.ref(tmean, p=0.99, ref= years)
        mtm1.p <- perc.ref(tmean, p=0.01, ref= years)

        cm99 <- c(mtm99.p[351:365], mtm99.p, mtm99.p[1:15])
        cm1 <- c(mtm1.p[351:365], mtm1.p, mtm1.p[1:15])

        cm99.ta <- max.peak(cm99)
        cm1.ta <- min.peak(cm1)

        cm99.tb <- max.peak(cm99.ta[,2])
        cm1.tb <- min.peak(cm1.ta[,2])

        int.spline9 = splinefunH(cm99.ta[cm99.tb[,1],1],cm99.tb[,2],m=tang(cbind(cm99.ta[cm99.tb[,1],1],cm99.tb[,2])))
        int.spline1 = splinefunH(cm1.ta[cm1.tb[,1],1],cm1.tb[,2],m=tang(cbind(cm1.ta[cm1.tb[,1],1],cm1.tb[,2])))
        mtm99 = round(int.spline9(1:395)[16:380],digit=1)
        mtm1 = round(int.spline1(1:395)[16:380],digit=1)

        daily.station["MT99"] <- mtm99
        daily.station["MT1"] <- mtm1
      }

      if (leap.year(reference.year))
      {
        # position of row for 29.02
        r <- 60
        row2802 <- daily.station[59, ]
        daily.station[ seq(r+1, nrow(daily.station)+1), ] <- daily.station[ seq(r, nrow(daily.station)), ]
        daily.station[r,] <- row2802
        daily.station[r : nrow(daily.station), "Day"] <- daily.station[r : nrow(daily.station), "Day"] + 1
      }

    },
    error = function(err) {
      print ( paste0('[ERROR] TGenerator.Daily.CHINA (', current.station,"): ", err))
      return (daily.station)
    },
    warning = function(warn) {
      print ( paste0('[WARNING] TGenerator.Daily.CHINA (', current.station,"): ", warn))
      return (daily.station)
    })

  return (daily.station)
}

#*********************************************************
# Generate the seasons thresholds for current station
# current.station   [IN]  [INT]         station number
# current.path      [IN]  [STRING]      path for source modules
# RETURN Data.Frame with seasons results
#*********************************************************
Parallel.TGenerator.Seasons.CHINA <- function(current.station, current.path, reference.year)
{
  # load methods module
  source( paste0(current.path, "TGenerator.Methods.R"))
  years <- c(1985, reference.year)

  season.station <- data.frame(matrix(ncol=10, nrow=4) )
  colnames(season.station) <- c("Station", "Season", "MT5", "MT95", "MTX5", "MTX95", "MTN5", "MTN95", "RRR5Y", "FF5Y")

  result <- tryCatch({
    #read data for current station
    print (paste0('Start reading data for station ', current.station,' at',Sys.time()))
    con <- odbcConnect("<dbname>", uid="<username>", pwd="<password>", rows_at_time = 500)

    # prepare the query
    sSQL = "Select day,
    (case when min(tmax)='z' then 'NA' else min(tmax) end) as tmax,
    (case when min(tmin)='z' then 'NA' else min(tmin) end) as tmin,
    (case when min(tmean)='z' then 'NA' else min(tmean) end) as tmean,
    (case when min(prec)='z' then 'NA' else min(prec) end) as prec,
    (case when min(wind)='z' then 'NA' else min(wind) end) as wind
    from <tablename>
    group by day
    order by day"

    sSQL = gsub('#StationNumber#', current.station, sSQL)
    sSQL = gsub('#ReferenceYear#', reference.year, sSQL)
    sSQL = gsub('#ReferenceNextYear#', reference.year + 1, sSQL)

    # read values
    tValues <- as.matrix(sqlQuery(con, sSQL))
    tmin <- as.numeric(as.vector(tValues[,2]))
    tmax <- as.numeric(as.vector(tValues[,3]))
    tmean <- as.numeric(as.vector(tValues[,4]))
    precipitation <- as.numeric(as.vector(tValues[,5]))
    windspeed <- as.numeric(as.vector(tValues[,6]))

    # close database connection
    close(con)
    print (paste0('End reading data for station ', current.station,' at',Sys.time()))

    # fill the station column
    season.station["Station"] <- rep(current.station, 4)
    season.station[1:4, "Season"] <- c('winter', 'spring', 'summer', 'autumn')

    #***************************
    # Pierluca De Palma - 06.09.2019 - Changed:
    # day.jump from 0.95 to 0.99
    # day.jump from 0.05 to 0.01
    # rv.p from 5 to 10
    # remove apply (19.09.2019)
    #***************************

    #temperature season calculation
    season.station[1, "MT95"] <- round(day.jump(tmean,seas='winter',p=0.99,ref= years), digits=2)
    season.station[2, "MT95"] <- round(day.jump(tmean,seas='spring',p=0.99,ref= years), digits=2)
    season.station[3, "MT95"] <- round(day.jump(tmean,seas='summer',p=0.99,ref= years), digits=2)
    season.station[4, "MT95"] <- round(day.jump(tmean,seas='autumn',p=0.99,ref= years), digits=2)

    season.station[1, "MT5"] <- round(day.jump(tmean,seas='winter',p=0.01,ref= years), digits=2)
    season.station[2, "MT5"] <- round(day.jump(tmean,seas='spring',p=0.01,ref= years), digits=2)
    season.station[3, "MT5"] <- round(day.jump(tmean,seas='summer',p=0.01,ref= years), digits=2)
    season.station[4, "MT5"] <- round(day.jump(tmean,seas='autumn',p=0.01,ref= years), digits=2)

    season.station[1, "MTX95"] <- round(day.jump(tmax,seas='winter',p=0.99,ref= years), digits=2)
    season.station[2, "MTX95"] <- round(day.jump(tmax,seas='spring',p=0.99,ref= years), digits=2)
    season.station[3, "MTX95"] <- round(day.jump(tmax,seas='summer',p=0.99,ref= years), digits=2)
    season.station[4, "MTX95"] <- round(day.jump(tmax,seas='autumn',p=0.99,ref= years), digits=2)

    season.station[1, "MTX5"] <- round(day.jump(tmax,seas='winter',p=0.01,ref= years), digits=2)
    season.station[2, "MTX5"] <- round(day.jump(tmax,seas='spring',p=0.01,ref= years), digits=2)
    season.station[3, "MTX5"] <- round(day.jump(tmax,seas='summer',p=0.01,ref= years), digits=2)
    season.station[4, "MTX5"] <- round(day.jump(tmax,seas='autumn',p=0.01,ref= years), digits=2)

    season.station[1, "MTN95"] <- round(day.jump(tmin,seas='winter',p=0.99,ref= years), digits=2)
    season.station[2, "MTN95"] <- round(day.jump(tmin,seas='spring',p=0.99,ref= years), digits=2)
    season.station[3, "MTN95"] <- round(day.jump(tmin,seas='summer',p=0.99,ref= years), digits=2)
    season.station[4, "MTN95"] <- round(day.jump(tmin,seas='autumn',p=0.99,ref= years), digits=2)

    season.station[1, "MTN5"] <- round(day.jump(tmin,seas='winter',p=0.01,ref= years), digits=2)
    season.station[2, "MTN5"] <- round(day.jump(tmin,seas='spring',p=0.01,ref= years), digits=2)
    season.station[3, "MTN5"] <- round(day.jump(tmin,seas='summer',p=0.01,ref= years), digits=2)
    season.station[4, "MTN5"] <- round(day.jump(tmin,seas='autumn',p=0.01,ref= years), digits=2)

    # precipitation season calculation
    season.station[1, "RRR5Y"] <- round(rv.p(precipitation,seas='winter',p=10,ref= years), digits=2)
    season.station[2, "RRR5Y"] <- round(rv.p(precipitation,seas='spring',p=10,ref= years), digits=2)
    season.station[3, "RRR5Y"] <- round(rv.p(precipitation,seas='summer',p=10,ref= years), digits=2)
    season.station[4, "RRR5Y"] <- round(rv.p(precipitation,seas='autumn',p=10,ref= years), digits=2)

    # wind speed season calculation
    season.station[1, "FF5Y"] <- round(rv.p(windspeed,seas='winter',p=10,ref= years), digits=2)
    season.station[2, "FF5Y"] <- round(rv.p(windspeed,seas='spring',p=10,ref= years), digits=2)
    season.station[3, "FF5Y"] <- round(rv.p(windspeed,seas='summer',p=10,ref= years), digits=2)
    season.station[4, "FF5Y"] <- round(rv.p(windspeed,seas='autumn',p=10,ref= years), digits=2)

    return (season.station)
  },
  error = function(err) {
    print ( paste0('[ERROR] Parallel.TGenerator.Seasons.CHINA :', err))
    return (season.station)
  },
  warning = function(warn) {
    print ( paste0('[WARNING] Parallel.TGenerator.Seasons.CHINA :', warn))
    return (season.station)
  }  )

  return (result)
}

#*********************************************************
# Generate the daily thresholds for current station
# station.data   [IN]  [DATA.FRAME]   coordinates for station in elaboration
# st.500         [IN]  [DATA.FRAME]   coordinates of stations in the range of 500 km less than station in elaboration
# data.500       [IN]  [DATA.FRAME]   threshold data for the stations in the range of 500 km less than station in elaboration
# reference.year [IN]  [INT]          reference year
# RETURN Data.Frame with daily results
#*********************************************************
Parallel.TGenerator.Daily.Cokrig.Ellaboration <- function(station.data, st.500, data.500, reference.year)
{
   # create the DATA.FRAME for threshold data relative to current station
   print (paste0('Start elaboration for station:', station.data[1, "StationNumber"]))
   station.thre <-  data.frame(matrix(ncol=length(colnames(data.500)), nrow=0) )
   colnames(station.thre) <- c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1")

   results <- tryCatch({
     # read the ERA5 percentile for the station
     con <- odbcConnect("<dbname>", uid="<username>", pwd="<password>", rows_at_time = 100)

     sSQL = "select rg.idgrid, rg.latitude, rg.longitude, t.decade,
                    TO_NUMBER(TO_CHAR(t.startdec, 'DDD')) as jstartdec, TO_NUMBER(TO_CHAR(t.enddec, 'DDD')) as jenddec,
                    tmax_p1, tmax_p99, tmin_p1, tmin_p99, tavg_p1, tavg_p99
            from  <tablename>
            order by rg.idgrid, t.decade"

     sSQL = gsub('#Latitude#', station.data[1, "Latitude"], sSQL)
     sSQL = gsub('#Longitude#', station.data[1, "Longitude"], sSQL)
     sSQL = gsub('#ReferenceYear#', reference.year, sSQL)

     # read data from database
     era5 <- as.matrix(sqlQuery(con, sSQL))

     # close database connetion
     close(con)

     # determine the number of days for the reference year
     numberOfDays = if (leap.year(reference.year)) 366 else 365

     era5.startdec <- as.integer(as.vector(era5[, 5]))
     era5.decade   <- as.integer(as.vector(era5[, 4]))

     prev.decade <- 0

     era.lat <- NA
     era.lon <- NA
     era.tx1 <- NA
     era.tx99 <- NA
     era.tn1 <- NA
     era.tn99 <- NA
     era.tmean1 <- NA
     era.tmean99 <- NA
     era5.metrica <- NA

     #print (paste0('Dopo lettura dati:', Sys.time()))
     # for all days in the year
     for (d in 1:numberOfDays)
     #for (d in 1:1)
     {
       # retrieve the correct decade (TO DO)
       dk.indexes <- which(era5.startdec <= d)
       if (length(dk.indexes) <= 0 )
       {
         print (paste0('Day:', d, ', Station:', station.data[1, "Station"], ' missing era5 data'))
         next
       }

       #retrieve current decade
       current.decade <- era5.decade[dk.indexes[length(dk.indexes)]]

       #print (paste0('Day:', d, ', Current decade:', current.decade, "\n"))

       # retrieve ERA5 data only for current decade
       era5.dec <- era5[which(era5.decade == current.decade),]

       # retrieve threshold data for current day relative to stations in range of 500 km
       day.500 <- data.500[which(data.500$Day == d), ]
       #print (paste0('Stazioni con dati giornalieri:', nrow(day.500), "\n"))

       # create a data frame with coordinates and data
       staz.thre.tx99 = c()
       staz.thre.tn99 = c()
       staz.thre.tmean99 = c()
       staz.thre.tx1 = c()
       staz.thre.tn1 = c()
       staz.thre.tmean1 = c()
       staz.metric <- as.data.frame(matrix(nrow = 0, ncol = 2))
       l.staz.metric <- list()

       for(i in 1:nrow(day.500))
       {
         staz.thre.tx99 = c(staz.thre.tx99, day.500[i, "MTX99"])
         staz.thre.tn99 = c(staz.thre.tn99, day.500[i, "MTN99"])
         staz.thre.tmean99 = c(staz.thre.tmean99, day.500[i, "MT99"])
         staz.thre.tx1 = c(staz.thre.tx1, day.500[i, "MTX1"])
         staz.thre.tn1 = c(staz.thre.tn1, day.500[i, "MTN1"])
         staz.thre.tmean1 = c(staz.thre.tmean1, day.500[i, "MT1"])
         st.idx = which(st.500$StationNumber == day.500[i, "Station"])
         staz.metric = rbind(staz.metric, c(st.500[st.idx, "EULongitude"], st.500[st.idx, "EULatitude"]))
         l.staz.metric[[ length(l.staz.metric) + 1]] <- c(st.500[st.idx, "EULongitude"], st.500[st.idx, "EULatitude"])
       }

       #print (paste0('Dopo processo dati treshold:', Sys.time()))

       if (prev.decade != current.decade)
       {
         prev.decade <- current.decade

         era.lat <- as.numeric(as.vector(era5.dec[, 2]))
         era.lon <- as.numeric(as.vector(era5.dec[, 3]))
         era.tx1 <- as.numeric(as.vector(era5.dec[, 7]))
         era.tx99 <- as.numeric(as.vector(era5.dec[, 8]))
         era.tn1 <- as.numeric(as.vector(era5.dec[, 9]))
         era.tn99 <- as.numeric(as.vector(era5.dec[, 10]))
         era.tmean1 <- as.numeric(as.vector(era5.dec[, 11]))
         era.tmean99 <- as.numeric(as.vector(era5.dec[, 12]))

         #convert coordinates from array to spatial object latlon in WGS84
         era5.coo = data.frame(lon=era.lon, lat=era.lat)
         coordinates(era5.coo) = c('lon','lat')
         wgs84 <- CRS("+init=epsg:4326")
         proj4string(era5.coo)=wgs84

         #Lambert Azimuthal Equal Area projection EU Standard
         azi <- CRS("+init=epsg:3035")
         era5.pmetric = suppressWarnings(spTransform(era5.coo, azi))
         era5.metric = cbind(era5.pmetric$lon,era5.pmetric$lat)
       }

       #print (paste0('Dopo processo dati era5', Sys.time()))

       #identify for each stations in the neighborhood of the target station the grid-value of ERA5
       u.era = c()
       l.u.era = lapply(l.staz.metric, FUN = LApply.Euclid, era.metric = era5.metric)
       u.era <- unlist(l.u.era, use.names = FALSE)

       #for(i in 1:length(staz.metric[,1])){
       #    all.dist = unlist(apply(FUN=UnivKrig.Euclid, MARGIN=1, era5.metric, y=staz.metric[i,]))
       #   u.era = c(u.era, which.min(all.dist))
       #}

       #retrieve the grid value for target station
       x.dist = UnivKrig.Euclid(era5.metric, y=c(station.data[1, "EULongitude"], station.data[1, "EULatitude"]))
       x.era = which.min(x.dist)

       #print (paste0('Dopo process indexes .era:', Sys.time()))

       pr.tmean99 <- UnivKrig.Prediction(era5.metric, era.tmean99, staz.metric, staz.thre.tmean99, station.data, x.era, u.era)
       pr.tx99 <- UnivKrig.Prediction(era5.metric, era.tx99, staz.metric, staz.thre.tx99, station.data, x.era, u.era)
       pr.tn99 <- UnivKrig.Prediction(era5.metric, era.tn99, staz.metric, staz.thre.tn99, station.data, x.era, u.era)

       pr.tmean1 <- UnivKrig.Prediction(era5.metric, era.tmean1, staz.metric, staz.thre.tmean1, station.data, x.era, u.era)
       pr.tx1 <- UnivKrig.Prediction(era5.metric, era.tx1, staz.metric, staz.thre.tx1, station.data, x.era, u.era)
       pr.tn1 <- UnivKrig.Prediction(era5.metric, era.tn1, staz.metric, staz.thre.tn1, station.data, x.era, u.era)

       print (paste0('Station:', station.data[1, "StationNumber"], ', Day:', d, ', TX99:', pr.tx99, ', TX1:', pr.tx1, ', TN99:', pr.tn99, ', TN1:', pr.tn1, ', TMEAN99:', pr.tmean99, ', TMEAN1:', pr.tmean1))

       allNA <- is.na(pr.tmean99) & is.na(pr.tx99) & is.na(pr.tn99) &
                is.na(pr.tmean1) & is.na(pr.tx1) & is.na(pr.tn1)

       if (!allNA)
       {
         # add the day data to data.frame
         station.thre <- rbind(station.thre, c(station.data[1, "StationNumber"],
                                               d,
                                               ifelse(is.na(pr.tmean99), NA, round(pr.tmean99, digits = 1)),
                                               ifelse(is.na(pr.tx99), NA, round(pr.tx99, digits = 1)),
                                               ifelse(is.na(pr.tn99), NA, round(pr.tn99, digits = 1)),
                                               ifelse(is.na(pr.tmean1), NA, round(pr.tmean1, digits = 1)),
                                               ifelse(is.na(pr.tx1), NA, round(pr.tx1, digits = 1)),
                                               ifelse(is.na(pr.tn1), NA, round(pr.tn1, digits = 1))))
       }
     }

     colnames(station.thre) <- c("Station", "Day", "MT99", "MTX99", "MTN99", "MT1", "MTX1", "MTN1")
     print (paste0('End elaboration for station:', station.data[1, "StationNumber"]))
     return (station.thre)
   },
   error = function(err) {
     print ( paste0('[ERROR] Parallel.TGenerator.Daily.Cokrig.Ellaboration [Station:' , station.data[1, "StationNumber"] ,'] :', err))
     return (station.thre)
   },
   warning = function(warn) {
     print ( paste0('[WARNING] Parallel.TGenerator.Daily.Cokrig.Ellaboration [Station:' , station.data[1, "StationNumber"] ,'] :', warn))
     return (station.thre)
   } )

   return (results)

}

#*************************************************************************
# Calculate the prediction for single variable
# era5.metric  [IN] [DATA.FRAME] - coordinates of station for ERA5 data
# era5.var     [IN] [VECTOR]     - ERA5 data for the variable
# staz.metric  [IN] [DATA.FRAME] - coordinates for neighborhood stations
# thre.var     [IN] [VECTOR]     - threshold data for variable
# station.coord[IN] [DATA.FRAME] - coordinates of station in elaboration
# x.era        [IN] [VECTOR]     - indexes of grid for station in elaboration
# u.era        [IN] [VECTOR]     - indexes of grid values for ERA5
#*************************************************************************
UnivKrig.Prediction <- function(era5.metric, era5.var, staz.metric, thre.var, station.coord, x.era, u.era)
{
  x.t <- NA
  result <- tryCatch({

    # prepare matrix of data
    allstaz = data.frame(x=staz.metric[,1], y=staz.metric[,2], t=thre.var, et=era5.var[u.era])
    coordinates(allstaz) = ~x + y

    #print (paste0('Before autofit:', Sys.time()))
    #Fit variograms for current variable
    staz.ava=autofitVariogram(t~et, allstaz)$var_model

    #coordinate of the target station here Ponza and closes point of ERA5
    x.grid = data.frame(x = station.coord[1, "EULongitude"], y = station.coord[1, "EULatitude"], et = era5.var[x.era])
    coordinates(x.grid) = ~x + y

    #print ('Before krige')
    #estimate threshold at the target point here Ponza
    x.t = suppressWarnings( krige(t~et, locations=allstaz, newdata=x.grid, model=staz.ava) )
    #print (paste0('END:', Sys.time()))

    #print (paste0('Pred:', x.t$var1.pred, ', Var:', x.t$var1.var))
    return (ifelse(abs(x.t$var1.pred) > abs(x.t$var1.var), NA, x.t$var1.pred ))
  } ,
  error = function(err) {
    print ( paste0('[ERROR] UnivKrig.Prediction [Station:' , station.coord[1, "StationNumber"] ,'] :', err))
    return (x.t)
  },
  warning = function(warn) {
    print ( paste0('[WARNING] UnivKrig.Prediction [Station:' , station.coord[1, "StationNumber"] ,'] :', warn))
    return (x.t)
  })

  return (result)
}

#*************************************************************************
# Euclid function
#*************************************************************************
UnivKrig.Euclid <- function(x,y){

  res = sqrt((x[1]-y[1])^2+(x[2]-y[2])^2)
  return(res)
}

LApply.Euclid <- function (staz.metric, era.metric)
{
  all.dist = unlist(apply(FUN=UnivKrig.Euclid, MARGIN=1, era.metric, y=staz.metric))
  return (which.min(all.dist))
}
