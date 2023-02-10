library(RcppAlphahull)
library(sp)
library(cluster)
library(EMCluster)
library(XML)

#*********************************************************
# EM clustering with K chosen to min AIC
# Parameters :
#  - x        [INPUT] points data
#  - k.max    [INPUT] Number of clusters
# RETURN :
#    List of clusters
#*********************************************************
EMclu = function(x,k.max){

  logl=c()
  allclass = array(dim=c(length(x[,1]),k.max))
  for(i in 1:k.max){
    ret.Rnd <- suppressWarnings( init.EM(x, nclass = i, method = "Rnd.EM", EMC = .EMC.Rnd, stable.solution = FALSE))
    ret.class <- suppressWarnings (emcluster(x,emobj = ret.Rnd,assign.class=TRUE))
    allclass[,i] = ret.class$class
    logl = c(logl,summary(ret.class)$AIC)
  }

  f.class= list(cluster=  allclass[,which.min(logl)])
  return(f.class)
}

#*********************************************************
# EM clustering with K chosen with GAP
# Parameters :
#  - x        [INPUT] points data
#  - k.max    [INPUT] Number of clusters
# RETURN :
#    List of clusters
#*********************************************************
EMclu.gap = function(x, K.max){

  ret.Rnd <- suppressWarnings(init.EM(x, nclass = K.max, method = "Rnd.EM", EMC = .EMC.Rnd, stable.solution = FALSE))
  ret.class <- suppressWarnings (emcluster(x,emobj = ret.Rnd,assign.class=TRUE))
  allclass = ret.class$class

  f.class= list(cluster = allclass)
  return(f.class)
}

#*********************************************************
# Calculate the Hull Area
# Parameters :
#  - x        [INPUT] alphahull result structure
# RETURN :
#    Area of hull surface
#*********************************************************
Area.Hull = function(x){

  tryCatch(
  {
    h.poi = x$xahull #nodes of the hull
    h.arc = x$arcs #matrix with arcs info
    h.sin = which(h.arc[,3]==0) #points isolated
    if (length(h.sin) > 0)
    {
      h.arc = h.arc[-h.sin,]
    }
    h.nnod = length(as.vector(h.arc[,8]))

    #calculate end-points
    if (length(as.vector(h.poi[, 1])) > 0)
    {
      for(i in 1:h.nnod){
        rot=cbind(rbind(c(cos(h.arc[i,6]),-sin(h.arc[i,6])),c(sin(h.arc[i,6]),cos(h.arc[i,6]))))
        arot=cbind(rbind(c(cos(h.arc[i,6]),sin(h.arc[i,6])),c(-sin(h.arc[i,6]),cos(h.arc[i,6]))))
        h.e1 = h.arc[i,1:2]+h.arc[i,3]*(h.arc[i,4:5]%*%rot)
        h.e2 = h.arc[i,1:2]+h.arc[i,3]*(h.arc[i,4:5]%*%arot) #c+r*v%*%A_theta
        idx.he1 = (which(h.poi[,1]==h.e1[1] & h.poi[,2]==h.e1[2]))
        idx.he2 = (which(h.poi[,1]==h.e2[1] & h.poi[,2]==h.e2[2]))
        if (length(idx.he1) > 0 & length(idx.he2) > 0)
        {
          h.arc[i,7] = idx.he1[1]
          h.arc[i,8] = idx.he2[1]
        }
      }
    }

    a.arc = as.vector(t(h.arc[,7:8]))  #create a vector with the index of the points

    # need at least 2 elements
    if (length(a.arc) <= 2) return (0)

    for(i in 2:(length(a.arc)-1)){

      if(i%%2 == 1) {next} #need to check to have consecutive nodes at indexes 2-3, 4-5, etc. to build a polygon

      if(a.arc[i]==a.arc[(i+1)]){
        next
      }
      else{
        a.arc[(i+2)] = a.arc[(i+1)]
        a.arc[(i+1)] = a.arc[i]
      }
    }

    a.poly=c() #build the matrix with points' coordinates to create the Polygon

    for(i in 1:length(a.arc))
    {
      a.poly=rbind(a.poly,h.poi[a.arc[i],])
    }

    if (length(a.poly) < 4) return (0)

    h.poly = Polygon(a.poly)
    h.area = h.poly@area

    #now remove/add the areas given by the alpha-convexity (i.e. the arcs)
    al.area = 0

    for(i in 1:h.nnod){

      t.area = 0.5*h.arc[i,3]^2*((2*h.arc[i,6])-(sin(2*h.arc[i,6])))
      if(point.in.polygon(h.arc[i,1],h.arc[i,2],a.poly[,1],a.poly[,2])==0){ #check whether the center of the arc is in/out the Polygon
        al.area = al.area - t.area
      }
      else{
        al.area = al.area + t.area
      }
    }

    final.area = h.area + al.area
    return(final.area)
  },
  error = function (err)
  {
    cat(paste0('Area.Hull - Error : ', err), file = log.file, sep = "\n")
    return (0)
  }
  ,warning = function (warn)
  {
    cat(paste0('Area.Hull - Warning: ', warn), file = log.file, sep = "\n")
    return (0)
  })

}

#*********************************************************
# Manage the exceptions considering a convex hull logic
# Parameters :
#  - error.df           [INPUT] [DATA.FRAME]- errors data
#  - stations.df        [INPUT] [DATA.FRAME]- stations data
#  - cvhull.file        [INPUT] [STRING]    - XML convex hull configurations
#  - log.file           [INPUT] [HANDLE]    - log file handle
#  - cvx.file           [INPUT] [STRING]    - name of file for previous convex hull errors removed
# RETURN :
#    Data frame with errors data
#*********************************************************
Manage.ConvexHull.Exceptions <- function(error.df, stations.df, cvhull.file, log.file, cvx.file)
{
  result <- tryCatch({

    # check if the file exists
    cvhull.xml <- NULL
    if (file.exists(cvhull.file))
    {
      cvhull.xml <- xmlParse(cvhull.file)
    }
    else
    {
      print ('Convex Hull file empty')
      return (error.df)
    }

    # check if exists the
    cvx.df <- NULL
    if (file.exists(cvx.file)){
      cvx.df <- read.table(cvx.file, header=TRUE, colClasses = c("integer", "character", "character"), stringsAsFactors = FALSE)
    }
    else {
      cvx.df <- as.data.frame(matrix(nrow = 0, ncol = 3))
      colnames(cvx.df) <- c("Station", "Area", "ErrorCode")
    }

    xml.exceptions <- getNodeSet(cvhull.xml, "//Exceptions/Exception")

    for(ex.node in xml.exceptions)
    {
      tryCatch({
        stations.limit <- as.numeric(as.character(xmlValue(getNodeSet(ex.node, "Stations_Counter")[[1]])))
        hull.radius <- strsplit(xmlValue(getNodeSet(ex.node, "Hull_Radius")[[1]]), "[;]")[[1]]
        hull.area <- as.numeric(xmlValue(getNodeSet(ex.node, "Hull_Area")[[1]]))

        error.property <- as.character(xmlGetAttr(getNodeSet(ex.node, "Error")[[1]], "Property"))
        error.code     <- str_pad(as.character(xmlGetAttr(getNodeSet(ex.node, "Error")[[1]], "Code")), 3, "left", pad = "0")
        error.area     <- as.character(xmlValue(getNodeSet(ex.node, "Area")[[1]]))

        # extract only the stations that presents the error configured like exception
        stations.error <- error.df[which(error.df$Property == error.property &
                                         error.df$Code == error.code &
                                         error.df$Area == error.area),
                                   "Station"]

        #print (paste0('Property:', error.property, ', Code:', error.code, ', Area:', error.area, 'Stations:', length(stations.error)))

        if (length(stations.error) >= stations.limit)
        {
          # get coordination for stations associated with the specific error
          ex.stations     <- stations.df[ which(stations.df$StationNumber %in% stations.error), ]
          stations.points <- cbind(as.vector(as.numeric(ex.stations$EULongitude)),
                                   as.vector(as.numeric(ex.stations$EULatitude)))

          # remove duplicates
          dupl = duplicated(stations.points)
          stations.points = stations.points[!dupl,]

          # create clusters
          mygap = clusGap(stations.points, FUNcluster = EMclu.gap, K.max=2, d.power=2, spaceH0 = 'original', B=500)

          # Kmeans with the identified number of clusters
          myk = which.max(mygap$Tab[,3])
          class = EMclu.gap(stations.points,myk)

          # Determine alpha-convex hull for each cluster
          are.res=rep(NA,myk)
          for(i in 1:myk)
          {
            aset = ahull(stations.points[which(class$cluster==i),], alpha=as.numeric(hull.radius[[1]]))
            if (!is.null(aset) & !is.null(aset$arcs) & length(as.vector(aset$arcs[, 1]) >= 2))
            {
              # determine hull area in km2
              sset = suppressWarnings(Area.Hull(aset)/1000000)

              print (paste0('Cluster:', i, ', Radius:', hull.radius[[1]], ', Area:', sset))

              # check the area for other radius if the area was not determinate
              idx.radius <- 2
              if (is.na(sset) | sset <= 0.0)
              {
                while ( (is.na(sset) | sset <= 0.0) & idx.radius <= length(hull.radius))
                {
                  aset = ahull(stations.points[which(class$cluster==i),],alpha=as.numeric(hull.radius[[idx.radius]]))
                  if (!is.null(aset) & !is.null(aset$arcs) & length(as.vector(aset$arcs[, 1]) >= 2))
                  {
                    sset = suppressWarnings(Area.Hull(aset)/1000000)
                    print (paste0('Cluster:', i, ', Radius:', hull.radius[[idx.radius]], ', Area:', sset))
                    if (!is.na(sset) & (sset > hull.area)) break;

                  }
                  idx.radius <- idx.radius + 1
                }
              }

              if (!is.na(sset) & sset > hull.area)
              {
                # find stations index by EU coordinates
                cx <- as.data.frame(aset$ashape.obj$x)
                colnames(cx) <- c("lon", "lat")
                stations.number <- c()
                for (st in 1 : nrow(cx))
                {
                  st.idx <- which(as.integer(stations.df$EULongitude ) == cx[st, "lon"] &
                                  as.integer(stations.df$EULatitude) == cx[st, "lat"])

                  if (length(st.idx) > 0 )
                  {
                    stations.number <- append(stations.number, stations.df[ st.idx[1], "StationNumber"])
                  }
                }

                #print (stations.number)

                # remove all errors with same property and code for the stations belong to the cluster (TO DO)
                if (length(stations.number) > 0)
                {
                  idx2remove <- which(error.df$Property == error.property &
                                      error.df$Code == error.code &
                                      error.df$Area == error.area &
                                      error.df$Station %in% stations.number)

                  error.df <- error.df[-idx2remove, ]

                  if (!is.null(log.file))
                  {

                    # print to log file the list of station for which the error was removed
                    cat( paste0("[", Sys.time(), "]I| Remove error ", error.property, "-", error.code, "[", error.area, "] - Hull.area:",
                                sset, ", for following stations:", paste(stations.number, collapse = ",")),
                         file = log.file, sep="\n")
                  }

                  # get stations for which the errors was removed but are not present into convex hull file
                  for (st in 1: length(stations.number))
                  {
                    #print (paste0('Search for:', stations.number[st], ', ', error.area, ', ', error.property, ', ', error.code))
                    idx.station <- which(cvx.df$Station == stations.number[st] &
                                           cvx.df$Area == error.area &
                                           cvx.df$ErrorCode == paste0(error.property, "-", error.code))
                    #print(idx.station)
                    if (length(idx.station) <= 0)
                    {
                      cvx.df[nrow(cvx.df) + 1, ] <- c(stations.number[st], error.area, paste0(error.property, "-", error.code))
                    }
                  }
                }
              }
            }
          }
        }

        #check if exists some errors that was removed in the previous runs
        if (nrow(error.df) > 0)
        {
          idx.remove <- c()
          for(er in 1:nrow(error.df))
          {
            idx.error <- which(cvx.df$Station == error.df[er, "Station"] &
                               cvx.df$Area == error.df[er, "Area"] &
                               cvx.df$ErrorCode == paste0(error.df[er, "Property"], "-", error.df[er, "Code"]))
            if (length(idx.error) > 0)
            {
              idx.remove <- c(idx.remove, er)
            }
          }

          if (length(idx.remove) > 0)
          {
            error.df <- error.df[-idx.remove, ]
          }
        }

        # save errors removed by convex hull algorithm
        if (nrow(cvx.df) > 0)
        {
          if (file.exists(cvx.file)) {
            file.remove(cvx.file)
          }
          write.table(cvx.df, cvx.file, quote=FALSE, sep="\t", row.names = FALSE, col.names = TRUE)
        }

      }
      ,error = function (err)
      {
        cat(paste0('Manage.ConvexHull.Exceptions[Node cycle] - Error : ', err), file = log.file, sep = "\n")
      }
      ,warning = function (warn)
      {
        cat(paste0('Manage.ConvexHull.Exceptions[Node cycle] - Warning: ', warn), file = log.file, sep = "\n")
      })
    }

    return (error.df)
  },error = function (err)
  {
    cat( paste0('Manage.ConvexHull.Exceptions - Error : ', err), file = log.file, sep = "\n")
    return (error.df)
  }
  ,warning = function (warn)
  {
    cat( paste0('Manage.ConvexHull.Exceptions - Warning: ', warn), file = log.file, sep = "\n")
    return (error.df)
  })

  return (result)
}
