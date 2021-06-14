#*********************************************************
#         Functions for threshold generator
#*********************************************************
library(chron)
library(extRemes)
library(RODBC)
library(data.table)

#*********************************************************
# Calculate the percentage for one property using specific
# time interval
# x   vectore
# p   percentage
# ref years
#*********************************************************
perc.ref <- function(x, p, ref)
{
  # ref is a vector containing the 1st year and the last year of reference period
  years <- ref[1]:ref[2]
  leap.ref <- which(leap.year(years))
  #identify the 29th of Feb and move data in a separate vector
  feb.29 <- c()
  for (l in 1:length(leap.ref)){
    feb.29 <- c(feb.29,julian(2,29,years[leap.ref[l]],origin=c(12,31,(ref[1]-1))))
  }
  x.feb29 <- x[feb.29]
  x <- x[-feb.29]
  years.number <- ref[2] - ref[1] + 1
  nx <- 1:(365 * years.number)
  threshold.p <- rep(NA,365)
  for(i in 1:365)
  {
    #identify all days i by using the integer modulus 365
    day.i <- which(nx%%365==i)
    if (i==365)
    {
      day.i <- which(nx%%365==0)
    }

    day.i.m3 <- day.i-3
    day.i.m2 <- day.i-2
    day.i.m1 <- day.i-1
    day.i.p3 <- day.i+3
    day.i.p2 <- day.i+2
    day.i.p1 <- day.i+1
    day.i.m3[day.i.m3<0] <- NA
    day.i.m2[day.i.m2<0] <- NA
    day.i.m1[day.i.m1<0] <- NA
    day.i.p3[day.i.p3<0] <- NA
    day.i.p2[day.i.p2<0] <- NA
    day.i.p1[day.i.p1<0] <- NA


    sample.p <- c(x[day.i],x[day.i.m3],x[day.i.m2],x[day.i.m1],x[day.i.p1],x[day.i.p2],x[day.i.p3])

    if(i>56 & i < 63){
      sample.p <- c(sample.p,x.feb29)
    }

    threshold.p[i] <- quantile(sample.p,probs=p,na.rm=TRUE)
  }
  return(threshold.p)
}

#*********************************************************
# Calculate the percentage for one property relative
# to the specific season
#*********************************************************
day.jump <- function(x,seas,p,ref){

  jump.p <- NA
  result <- tryCatch({
    years <- ref[1]:ref[2]
    leap.ref <- which(leap.year(years))

    #identify the 29th of Feb and move data in a separate vector
    feb.29 <- c()
    for (l in 1:length(leap.ref)){
      feb.29 <- c(feb.29,julian(2,29,years[leap.ref[l]],origin=c(12,31,(ref[1]-1))))
    }
    x.feb29 <- x[feb.29]
    x <- x[-feb.29]

    years.number <- ref[2] - ref[1] + 1
    nx <- 1:(365 * years.number)

    days.seas <- c()
    # extract the array depending by season
    if(seas=='summer'){
      day.seas <- which(nx%%365>151 & nx%%365<244)
    }
    if(seas=='winter'){
      day.seas <- which( (nx%%365>0 & nx%%365<60) | nx%%365==0)
      day.seas <- c(day.seas,which(nx%%365>334 & nx%%365<366))
      days.seas <- c(days.seas,feb.29)
    }
    if(seas=='spring'){
      day.seas <- which(nx%%365>59 & nx%%365<152)
      days.seas <- c(days.seas,feb.29)
    }
    if(seas=='autumn'){
      day.seas <- which(nx%%365>243 & nx%%365<335)
    }

    jump.p <- quantile(abs(diff(x[day.seas])),probs=p,na.rm=TRUE)

    return(jump.p)
  },
  error = function(err) {
    print ( paste0('[ERROR] day.jump :', err))
    return (jump.p)
  },
  warning = function(warn) {
    print ( paste0('[WARNING] day.jump :', warn))
    return (jump.p)
  })

  return (result)
}

#*********************************************************
# Calculate the percentage for one property relative
# to the specific season. Will be used only for wind speed
# and precipitation
#*********************************************************
rv.p <- function(x,p,seas,ref)
{
  x.rl <- NA
  result <- tryCatch( {

    years <- ref[1]:ref[2]
    leap.ref <- which(leap.year(years))

    #identify the 29th of Feb and move data in a separate vector
    feb.29 <- c()
    for (l in 1:length(leap.ref)){
      feb.29 <- c(feb.29,julian(2,29,years[leap.ref[l]],origin=c(12,31,(ref[1]-1))))
    }
    x.feb29 <- x[feb.29]
    x <- x[-feb.29]

    years.number <- ref[2] - ref[1] + 1
    nx <- 1:(365 * years.number)

    day.seas <- c()
    if(seas=='summer'){
      day.seas <- which(nx%%365>151 & nx%%365<244)
    }
    if(seas=='winter'){
      day.seas <- which(nx%%365>0 & nx%%365<60)
      day.seas <- c(day.seas,which(nx%%365>334 & nx%%365<366))
      day.seas <- c(day.seas,feb.29)
    }
    if(seas=='spring'){
      day.seas <- which(nx%%365>59 & nx%%365<152)
      day.seas <- c(day.seas,feb.29)
    }
    if(seas=='autumn'){
      day.seas <- which(nx%%365>243 & nx%%365<335)
    }

    x.seas <- x[day.seas]
    thresh.p <- quantile(x.seas[x.seas>0], probs=0.95, na.rm = TRUE)
    x.d.seas.exc <- which(x.seas>thresh.p)

    if ( length(x.d.seas.exc) > 0)
    {
      x.seas.exc <- x.seas[x.d.seas.exc] - thresh.p

      if(seas=='winter'){
        #x.rl <- suppressWarnings(fpot(x.seas.exc,threshold=0,model='gpd',npp=90.25,mper=p, std.err = FALSE)$estimate[1])
        mymod = fevd(x.seas.exc,threshold=0,type='GP',units='90.25/year')
        x.rl = return.level(mymod,return.period=p)

      }
      if(seas=='spring' | seas=='summer'){
        #x.rl <- suppressWarnings(fpot(x.seas.exc,threshold=0,model='gpd',npp=92,mper=p, std.err = FALSE)$estimate[1])
        mymod = fevd(x.seas.exc,threshold=0,type='GP',units='92/year')
        x.rl = return.level(mymod,return.period=p)
      }
      if(seas=='autumn'){
        #x.rl <- suppressWarnings(fpot(x.seas.exc,threshold=0,model='gpd',npp=91,mper=p, std.err = FALSE)$estimate[1])
        mymod = fevd(x.seas.exc,threshold=0,type='GP',units='91/year')
        x.rl = return.level(mymod,return.period=p)
      }

      x.rl <- x.rl + thresh.p

    } else {
      print (paste0('Not enough value to calculate threshold per season ', seas))
    }

    return (x.rl)
  },
  error = function(err) {
    print ( paste0('[ERROR] rv.p :', err))
    return (x.rl)
  },
  warning = function(warn) {
    print ( paste0('[WARNING] rv.p :', warn))
    return (x.rl)
  }
  )

  return(result)
}

#*********************************************************
# Max peak
# INPUT - array of values
#*********************************************************
max.peak = function(x)
{
  y = c()
  yp = c()
  dx = diff(x)
  n = length(dx)

  if(dx[1] <= -0.2)
  {
    yp=c(1,yp)
    y=c(y,x[1])
  }

  for(i in 1:(n-2))
  {
    if((dx[i] >= 0.2 & dx[(i+1)] <=- 0.2) |
         (dx[i] >= 0.2 & abs(dx[(i+1)]) <= 0.2) |
           (abs(dx[i]) <= 0.2 & dx[(i+1)] <= -0.2))
    {
      y  = c(y,x[(i+1)])
      yp = c(yp,(i+1))
    }
  }

  if(dx[n] >= 0.2 | dx[(n-1)] >= 0.2)
  {
    if(dx[n] >= dx[(n-1)])
    {
      yp =c(yp,(n+1))
      y  =c(y,x[(n+1)])
    }
    else
    {
      yp=c(yp,n)
      y=c(y,x[n])
    }
  }

  res  = cbind(yp,y)
  return(res)
}

#*********************************************************
# Min peak
# INPUT - array of values
#*********************************************************
min.peak = function(x){

  y=c()
  yp = c()
  dx = diff(x)
  n = length(dx)

  if(dx[1]>=-0.2){yp=c(1,yp);y=c(y,x[1])}

  for(i in 1:(n-2)){

    if((dx[i]<=-0.2 & dx[(i+1)]>=0.2) | (dx[i]<=-0.2 & abs(dx[(i+1)])<=0.2) | (abs(dx[i])<=0.2 & dx[(i+1)]>=0.2)) {

      y = c(y,x[(i+1)])
      yp = c(yp,(i+1))

    }
  }

  if(dx[n]<=-0.2 | dx[(n-1)]<=-0.2)
  {
    if(dx[n]<=dx[(n-1)])
    {
      yp =c(yp,(n+1))
      y  =c(y,x[(n+1)])
    }
    else{yp=c(yp,n);y=c(y,x[n])}
  }

  res  = cbind(yp,y)
}

#*********************************************************
# Tang function
# INPUT - array of values
#*********************************************************
tang = function(x){

  n=length(x[,1])
  mx=rep(NA,n)
  mx[1]=(x[2,2]-x[1,2])/(x[2,1]-x[1,1])
  mx[n]=(x[n,2]-x[(n-1),2])/(x[n,1]-x[(n-1),1])

  for(i in 2:(n-1))
  {
    mx[i]=((x[i,2]-x[(i-1),2])/(x[i,1]-x[(i-1),1]))+
          ((x[(i+1),2]-x[i,2])/(x[(i+1),1]-x[i,1]))

    mx[i]=mx[i]/2
  }

  return(mx)
}

#tang = function(x){

#  n=length(x[,1])
#  mx=rep(NA,n)
#  mx[1] = if (x[2,1] == x[1,1]) NA else (x[2,2]-x[1,2])/(x[2,1]-x[1,1])
#  mx[n] = if (x[n,1] == x[n-1,1]) NA else (x[n,2]-x[(n-1),2])/(x[n,1]-x[(n-1),1])
#  print (paste0('MX1:', mx[1], ', MXN:', mx[n]))
#  for(i in 2:(n-1))
#  {
#    mx[i]= if (x[i,1] == x[(i-1),1]) 0 else ((x[i,2]-x[(i-1),2]) / (x[i,1]-x[(i-1),1])) +
#           if (x[(i+1),1] == x[i,1]) 0 else ((x[(i+1),2]-x[i,2])/(x[(i+1),1]-x[i,1]))
#    print (paste0('I:', i, ', MXI:', mx[i]))
#    mx[i]=mx[i]/2
#  }

#  if (is.na(mx[n]))
#  {

#      mx[n] = mx[n-1] + 0.00000000000000000001
#  }

#  if (is.na(mx[1]))
#  {
#      mx[2] = mx[n-1] + 0.00000000000000000001
#  }

#  return(mx)
#}

#*********************************************************
# Get the elements between 2nd and 6th position.
# All values are ordered ascending.
# The first position are not considered because is
# allways = 0
#*********************************************************
best.5 <- function(x){
  sam <- order(x,decreasing=FALSE)[2:6]
  return(sam)
}
