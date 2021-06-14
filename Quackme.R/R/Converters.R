#*********************************************************
#            Convert module
#*********************************************************
library(XML)
library(stringi)
library(stringr)

#*********************************************************
# Method to convert an input WMO file to internal JRC format
# srcFile [INPUT]   [STRING] full path and name of the input file
# refDate [INPUT]   [STRING] the reference date in the format YYYYMMDD
#         [RETURN]  [STRING] Full path name of the convert file
#*********************************************************
Input.WMO.Converter <- function( srcFile, refDate)
{
  result <- tryCatch(
    {
      newFileName <- paste0("D:/AMDAC/QCS/Sources/QCS/Input/I.WMO.",  refDate, ".dat")
      if (file.exists(newFileName))
      {
        file.remove(newFileName)
      }

      file.copy(srcFile, newFileName)
      return (newFileName)
    }
    ,error = function (err)
    {
      print (paste0('Input.WMO.Converter - Error : ', err))
      return (NULL)
    }
    ,warning = function (warn)
    {
      print (paste0('Input.WMO.Converter - Warning: ', warn))
      return (NULL)
    }
  )
  return (result)
}

#*********************************************************
# Convert data from MG format to internal format
# srcPath [INPUT] [STRING] - source path
# srcFile [INPUT] [STRING] - source file name
# refDate [INPUT] [INT]    - reference date like integer (YYYYMMDD)
# wmo.codes [INPUT] [INT]  - wmo codes of stations managed inside JRC
#         [RETURN] the new name of the new file input
#*********************************************************
Input.MG.Converter <- function(srcPath, srcFile, refDate, wmo.codes)
{
  result <- tryCatch(
    {
      newFileName <- paste0(srcPath, "I.MG.", refDate, ".dat")

      # remove the file if exists
      if (file.exists(newFileName))
      {
        file.remove(newFileName)
      }

      # read input file like CSV
      csv.data <- read.csv(file=paste0(srcPath, srcFile), header=TRUE, sep=";")

      # extract only column for own interest
      csv.df <- subset(csv.data, select=c("INDEX", "TL", "TD", "TX1", "TN1", "TX6", "TN6", "TX", "TN", "RR1h", "RR24h", "RR6h", "RR", "TR", "SNO", "DIR", "FF", "N", "L", "GL1h", "GL24", "QFE", "QFF", "Sh", "SS24", "VIS", "YYYY", "MM", "DD", "HHmm", "GS"))

      # remove rows for which the INDEX column contains text DECODE
      csv.df <-csv.df[(stri_sub(csv.df$INDEX, 1, 6) != "DECODE"),]

      # change column names
      colnames(csv.df) <- c("Station", "TT", "TD", "TX1", "TN1", "TX6", "TN6", "TX12", "TN12", "PREC", "PR24", "PR06", "RR", "TR", "SNOW", "DIR", "FF", "N", "L", "RD", "RD24", "AP", "QFF", "SH", "SH24", "VIS", "YYYY", "MM", "DD", "HHmm", "SOIL")

      # complete the column HHMM with zero until 4 characters length
      csv.df[, "HHmm"] <- stri_pad_left(csv.df$HHmm, 4, pad="0")

      # remove 'space' characters where not necessary
      csv.df <- data.frame(lapply(csv.df, trimws), stringsAsFactors = FALSE)

      # replace / with NA
      csv.df[csv.df=="/"]<-NA

      # replace N, L column values , 9 with 8
      csv.df$N[as.numeric(csv.df$N) == 9] <- 8
      csv.df$L[as.numeric(csv.df$L) == 9] <- 8

      # remove rows for which we do not have the station number or with incomplete date
      csv.df <-csv.df[!(is.na(csv.df$Station) | is.na(csv.df$YYYY) | is.na(csv.df$MM) | is.na(csv.df$MM) | is.na(csv.df$HHmm)),]

      # remove rows with not fixed hour time
      csv.df <-csv.df[(stri_pad_left(stri_sub(csv.df$HHmm, -2), 2, pad="0") == "00"),]

      # add the DayTime column
      csv.df["DayTime"] <- with (csv.df, paste0(csv.df$YYYY,
                                                stri_pad_left(paste0(csv.df$MM), 2, pad="0"),
                                                stri_pad_left(paste0(csv.df$DD), 2, pad="0"),
                                                stri_pad_left(substr(csv.df$HHmm, 0, 2), 2, pad="0")))
      csv.df <- subset(csv.df, select=c("Station", "DayTime", "TT", "TD", "TX1", "TN1", "TX6", "TN6", "TX12", "TN12", "PREC", "PR24", "PR06", "RR", "TR", "SNOW", "DIR", "FF", "N", "L", "RD", "RD24", "AP", "QFF", "SH", "SH24", "VIS", "SOIL" ))

      # replace the + character with P in the way to not block the XML ellaboration
      csv.df$VIS <- gsub("\\+", "", csv.df$VIS)

      # remove rows with date less that reference date
      #csv.df <- csv.df[ as.numeric(stri_sub(csv.df$DayTime, 0, 8)) >= as.numeric(paste0(refDate, '00')), ]
      csv.df <- csv.df[ strptime(csv.df$DayTime, "%Y%m%d") >= strptime(refDate, "%Y%m%d"), ]

      # remote the last 0 from the station_number and convert the value to numerical value
      #csv.df$Station <- stri_sub(csv.df$Station, 1, 5)
      #csv.df$Station = substr(csv.df$Station,1,nchar(csv.df$Station)-1)
      csv.df$Station <- as.numeric(csv.df$Station)

      # remove rows for the stations not managed inside JRC
      csv.df <- csv.df [ csv.df$Station %in% wmo.codes, ]

      # replace to NA all the non numeric values
      #csv.df <- lapply(csv.df[,"DIR"], function(x) if(is.numeric(x)) as.numeric(x) else x)
      for (c in 1:ncol(csv.df))
      {
        c.idx <- grep("[+-]?([0-9]*[.])?[0-9]+", csv.df[, c])
        non.c.idx <- setdiff(seq_len(nrow(csv.df)), c.idx)
        csv.df[non.c.idx, c] <- NA
      }

      # sort data frame by station and daytime
      csv.df <- csv.df[ order( csv.df[,1], csv.df[,2] ), ]

      # divide by 10 the values of FF column
      #csv.df$FF <- round(as.numeric(csv.df$FF) / 10.0, digits = 2)
      csv.df$FF <- round(as.numeric(csv.df$FF) * 0.514, digits = 2)

      # add missing columns
      csv.df["RH"] <- NA

      # add columns for calculated values
      csv.df ["D_E"] <- NA
      csv.df ["D_RH"] <- NA
      csv.df ["D_VPD"] <- NA
      csv.df ["D_SLOPE"] <- NA

      # save data.frame to text file
      write.table(csv.df, newFileName,sep="\t",row.names=FALSE, col.names=TRUE, quote=FALSE)

      return (newFileName)
    }
    ,error = function (err)
    {
      print (paste0('Input.MG.Converter - Error : ', err))
      return (NULL)
    }
    ,warning = function (warn)
    {
      print (paste0('Input.MG.Converter - Warning: ', warn))
      return (NULL)
    }
  )
  return (result)
}

#*********************************************************
# Convert data from MG format to internal format
# srcPath [INPUT] [STRING] - source path
# srcFile [INPUT] [STRING] - source file name
# refDate [INPUT] [INT]    - reference date like integer (YYYYMMDD)
# wmo.codes [INPUT] [INT]  - wmo codes of stations managed inside JRC
#         [RETURN] the new name of the new file input
#*********************************************************
Input.MG.MOS.Converter <- function(srcPath, srcFile, refDate, wmo.codes)
{
  result <- tryCatch(
    {
      newFileName <- paste0(srcPath, "MOS.", refDate, ".dat")

      # remove the file if exists
      if (file.exists(newFileName))
      {
        file.remove(newFileName)
      }

      # read input file like CSV
      csv.data <- read.csv(file=paste0(srcPath, srcFile), header=TRUE, sep=";")

      # extract only column for own interest
      csv.df <- subset(csv.data, select=c("INDEX", "TL", "TD", "TX1", "TN1", "TX", "TN", "RR1h", "RR24h", "RR6h", "FF", "LAYER1", "LAYER2", "LAYER3", "LAYER4", "YYYY", "MM", "DD", "HHmm"))

      # remove rows for which the INDEX column contains text DECODE
      csv.df <-csv.df[(stri_sub(csv.df$INDEX, 1, 6) != "DECODE"),]

      # change column names
      colnames(csv.df) <- c("Station", "TT", "TD", "TX1", "TN1", "TX", "TN", "PREC", "PR24", "PR06", "FF", "RRRX1", "RRRX6", "RRRX12", "RRRX24","YYYY", "MM", "DD", "HHmm")

      # complete the column HHMM with zero until 4 characters length
      csv.df[, "HHmm"] <- stri_pad_left(csv.df$HHmm, 4, pad="0")

      # remove 'space' characters where not necessary
      csv.df <- data.frame(lapply(csv.df, trimws), stringsAsFactors = FALSE)

      # replace / with NA
      csv.df[csv.df=="/"]<-NA

      # remove rows for which we do not have the station number or with incomplete date
      csv.df <-csv.df[!(is.na(csv.df$Station) | is.na(csv.df$YYYY) | is.na(csv.df$MM) | is.na(csv.df$MM) | is.na(csv.df$HHmm)),]

      # remove rows with not fixed hour time
      csv.df <-csv.df[(stri_pad_left(stri_sub(csv.df$HHmm, -2), 2, pad="0") == "00"),]

      # add the DayTime column
      csv.df["DayTime"] <- with (csv.df, paste0(csv.df$YYYY,
                                                stri_pad_left(paste0(csv.df$MM), 2, pad="0"),
                                                stri_pad_left(paste0(csv.df$DD), 2, pad="0"),
                                                stri_pad_left(substr(csv.df$HHmm, 0, 2), 2, pad="0")))
      csv.df <- subset(csv.df, select=c("Station", "DayTime", "TT", "TD", "TX1", "TN1", "TX", "TN", "PREC", "PR24", "PR06", "FF", "RRRX1", "RRRX6", "RRRX12", "RRRX24" ))

      # remove rows with date less that reference date
      csv.df <- csv.df[ strptime(csv.df$DayTime, "%Y%m%d") >= strptime(refDate, "%Y%m%d"), ]

      # remote the last 0 from the station_number and convert the value to numerical value
      csv.df$Station <- as.numeric(csv.df$Station)

      # remove rows for the stations not managed inside JRC
      csv.df <- csv.df [ csv.df$Station %in% wmo.codes, ]

      # replace to NA all the non numeric values
      for (c in 1:ncol(csv.df))
      {
        c.idx <- grep("[+-]?([0-9]*[.])?[0-9]+", csv.df[, c])
        non.c.idx <- setdiff(seq_len(nrow(csv.df)), c.idx)
        csv.df[non.c.idx, c] <- NA
      }

      # sort data frame by station and daytime
      csv.df <- csv.df[ order( csv.df[,1], csv.df[,2] ), ]

      # divide by 10 the values of FF column
      csv.df$FF <- round(as.numeric(csv.df$FF) * 0.514, digits = 2)

      # save data.frame to text file
      write.table(csv.df, newFileName,sep="\t",row.names=FALSE, col.names=TRUE, quote=FALSE)

      return (newFileName)
    }
    ,error = function (err)
    {
      print (paste0('Input.MG.MOS.Converter - Error : ', err))
      return (NULL)
    }
    ,warning = function (warn)
    {
      print (paste0('Input.MG.MOS.Converter - Warning: ', warn))
      return (NULL)
    }
  )
  return (result)
}

#*********************************************************
# Method to convert an input data frame to the correspondent XML structure
# obs.df 	[INPUT]		[DATA.FRAME]	- onservation data
#         [RETURN]	[XML]		 	    - observations data with status and error message like XML structure
#*********************************************************
Input.WeakChecks.XML.Converter <- function(obs.df)
{
  result <- tryCatch(
    {
    obs.xml <- newXMLNode("Observations")
    for (i in  1:nrow(obs.df))
    {
      row <- obs.df[i,]
      ## observation node
      obs.node <- newXMLNode("Observation", parent=obs.xml)

      # Station code
      newXMLNode("Station", row$Station, parent=obs.node)

      ## day time node
      newXMLNode("DayTime", row$DayTime, parent=obs.node)

      ## TT node
      xNode <- newXMLNode("TT", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TT

      ## TD node
      xNode <- newXMLNode("TD", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TD

      ## TX1 node
      xNode <- newXMLNode("TX1", 'NA',attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TX1

      ## TN1 node
      xNode <- newXMLNode("TN1", 'NA',attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TN1

      ## TX6 node
      xNode <- newXMLNode("TX6", 'NA',attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TX6

      ## TN6 node
      newXMLNode("TN6", 'NA',attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TN6

      ## TX12 node
      xNode <- newXMLNode("TX12", 'NA',attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TX12

      ## TN12 node
      xNode <- newXMLNode("TN12", 'NA',attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TN12

      ## Precipitation node
      xNode <- newXMLNode("PREC", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$PREC

      ## Precipitation node for the last 24 hours
      xNode <- newXMLNode("PR24", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$PR24

      ## Precipitation node for the last 6 hours
      xNode <- newXMLNode("PR06", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$PR06

      ## Precipitation and interval of measure
      xNode <- newXMLNode("RR", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$RR

      xNode <- newXMLNode("TR", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$TR

      ## Snow node
      xNode <- newXMLNode("SNOW", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$SNOW

      ## Wind direction
      xNode <- newXMLNode("DIR", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$DIR

      ## Wind speed node
      xNode <- newXMLNode("FF", 'NA',attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$FF

      ## Total cloud cover
      xNode <- newXMLNode("N", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$N

      ## Low cloud cover
      xNode <- newXMLNode("L", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$L

      ## Global radiation
      xNode <- newXMLNode("RD", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$RD

      ## Global radiation for the last 24 hours
      xNode <- newXMLNode("RD24", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$RD24

      ## Atmosphere pressure
      xNode <- newXMLNode("AP", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$AP

      ## Atmosphere pressure reduce to MSL
      xNode <- newXMLNode("QFF", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$QFF

      ## Sunshine
      xNode <- newXMLNode("SH", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$SH

      ## Sunshine duration on the last 24 hours
      xNode <- newXMLNode("SH24", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$SH24

      ## Visibility
      xNode <- newXMLNode("VIS", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$VIS

      ## Properties for which does not exists correspondence in MG file
      ## Relative humidity
      xNode <- newXMLNode("RH", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$RH

      ## Calculated properties

      ## Vapour pressure
      newXMLNode("D_E", 'NA', attrs=c("Status"="C"), parent=obs.node)
      ## Relative humidity
      newXMLNode("D_RH", 'NA', attrs=c("Status"="C"), parent=obs.node)
      ## Vapour pressure deficit
      newXMLNode("D_VPD", 'NA', attrs=c("Status"="C"), parent=obs.node)
      ## slope of saturation vapour pressure vs.temperature curve
      newXMLNode("D_SLOPE", 'NA', attrs=c("Status"="C"), parent=obs.node)

      ## Missing properties

      # State of SOIL
      #newXMLNode("SOIL", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xNode <- newXMLNode("SOIL", 'NA', attrs=c("Status"="C"), parent=obs.node)
      xmlValue(xNode) <- row$SOIL
    }

    return (obs.xml)
  }
  ,error = function (err)
  {
    print (paste0('Input.XML.Converter - Error : ', err))
    return (NULL)
  }
  ,warning = function (warn)
  {
    print (paste0('Input.XML.Converter - Warning: ', warn))
    return (NULL)
  })

  return (result)
}

#*********************************************************
# HeavyChecks => Method to convert an input data frame to the correspondent XML structure,
#                with data for any station
# obs.df 	        [INPUT]		[DATA.FRAME]	- onservation data
# agg.properties  [INPUT]   [VECTOR]      - vector with aggregation properties' names
#         [RETURN]	[XML]		 	    - observations data with status and error message like XML structure
#*********************************************************
Input.HeavyChecks.XML.Converter <- function(obs.df, agg.properties)
{
  obs.xml <- newXMLNode ("Observation")

  result <- tryCatch(
    {
      # get column names
      col.names <- colnames(obs.df)

      for (i in  1:nrow(obs.df))
      {
        row <- obs.df[i,]

        # Station code
        newXMLNode("Station", row$Station, parent = obs.xml)

        # DayTime node
        newXMLNode("DayTime", row$DayTime, parent = obs.xml)

        # Add nodes for all aggregation properties
        for (c in 1:length(agg.properties))
        {
          if (col.names[c] == 'Station') next
          if (col.names[c] == 'DayTime') next

          xNode <- newXMLNode(col.names[c], 'NA', attrs=c("Status"="C"), parent = obs.xml)
          xmlValue(xNode) <- row[col.names[c]]
        }
      }

      return (obs.xml)
    }
    ,error = function (err)
    {
      print (paste0('Input.HeavyChecks.XML.Converter - Error : ', err))
      return (obs.xml)
    }
    ,warning = function (warn)
    {
      print (paste0('Input.HeavyChecks.XML.Converter - Warning: ', warn))
      return (obs.xml)
    }
    )

  return (result)
}

#*********************************************************
# Convert XML file to dataframework for WeakChecks Level
# xmlFileName 	[INPUT]		[STRING]	  - xml file name
# datFileName 	[INPUT]		[STRING]	  - data.frame file name
#*********************************************************
Output.WeakChecks.Xml2DataFrame <- function(xmlFileName, datFileName)
{
  # open xml file
  xml.file <- xmlParse(xmlFileName)
  xml.root <- xmlRoot(xml.file)

  # remove ALERT nodes
  nodes <- getNodeSet(xml.root, "//Observation/ALERT")
  removeNodes(nodes)

  # convert to data.frame
  df <- xmlToDataFrame (xml.root, c("integer", "integer",
                                    "numeric", "numeric", "numeric",  "numeric", "numeric",
                                    "numeric", "numeric", "numeric",  "numeric", "numeric",
                                    "numeric", "numeric", "numeric", "numeric", "numeric",
                                    "numeric", "numeric", "numeric", "numeric", "numeric",
                                    "numeric", "numeric", "numeric", "numeric", "numeric",
                                    "numeric", "numeric", "numeric", "numeric", "numeric",
                                    "numeric"))

  # save data.frame to file
  write.table(df, datFileName,sep="\t",row.names=FALSE)
}

#*********************************************************
# Convert XML file to dataframework for Aggregation Level
# xmlFileName 	[INPUT]		[STRING]	  - xml file name
# datFileName 	[INPUT]		[STRING]	  - data.frame file name
#*********************************************************
Output.Aggregation.Xml2DataFrame <- function(xmlFileName, datFileName)
{
  # open xml file
  xml.file <- xmlParse(xmlFileName)
  xml.root <- xmlRoot(xml.file)

  # get the number of columns
  xml.Observation <- getNodeSet(xml.root, "//Observation")[[1]]
  cnt.obs.child <- xpathApply(xml.Observation, path="count(./*)", xmlValue)

  # create the vector of columns types
  columns <- c("integer", "integer")
  for (i in 1:(cnt.obs.child - 2))
    columns <- c(columns, "numeric")

  df <- xmlToDataFrame(xml.root, columns)

  # save data.frame to file
  write.table(df, datFileName,sep="\t",row.names=FALSE)
}

#*********************************************************
# Convert XML file to Data.Frame for HeavyChecks Level
# Produce a Data.Frame only with errors
# Update flags considering human changes
# xmlFileName 	[INPUT]		[STRING]	  - XML file name
# datFileName 	[INPUT]		[STRING]	  - data.frame file name
# daily.flags   [INPUT]   [DATA.FRAME]- data frame with daily flags
# RETURN [LIST] List with 2 data frames : one with errors and one with daily flags
#*********************************************************
Output.HeavyChecks.Xml2DataFrame <- function(xmlFileName, datFileName, daily.flags)
{
  df.errors <- as.data.frame (matrix(nrow = 0, ncol = 5), stringsAsFactors = FALSE)
  colnames(df.errors) <- c("Station", "DayTime", "Property", "Flag", "ErrorCode")

  result <- tryCatch(
    {
      # open xml file
      xml.file <- xmlParse(xmlFileName)
      xml.root <- xmlRoot(xml.file)

      # replace values with NA for nodes with W(wrong) status
      #node.list <- getNodeSet(xml.root, "//Observation")
      #if (length(node.list) > 0)
      #{
      #  for (node.child in node.list)
      #  {
      #    # check if the node contains elements with Wrong and/or Suspicious status
      #    wr.nodes <- xpathSApply(node.child, "./*[@Status=\"W\"]", xmlChildren)
      #    if (length(wr.nodes) > 0)
      #    {
      #      for (wr.node in wr.nodes)
      #      {
      #        xmlValue(wr.node) <- 'NA'
      #      }
      #    }
      #  }
      #}

      # retrieve ALERT nodes
      alert.nodes <- getNodeSet(xml.root, "//ALERT")

      # before to remove the alert nodes save the errors messages
      if (length(alert.nodes) > 0)
      {
        for (a.node in alert.nodes)
        {
          parent <- xmlParent(a.node)
          property <- xmlGetAttr(a.node, "Property")
          error.code <- xmlGetAttr(a.node, "Code")
          station <- xmlValue(getNodeSet(parent, "./Station")[[1]])
          daytime <- xmlValue(getNodeSet(parent, "./DayTime")[[1]])
          property.flag <- xmlGetAttr(getNodeSet(parent, paste0("./", property))[[1]], "Status")
          df.errors[1 + nrow(df.errors), ] <- c(station, daytime, property, property.flag, error.code)
        }
      }

      # remove alert nodes from the XML
      if (length(alert.nodes) >0 ) removeNodes(alert.nodes)

      # search for modified properties
      md.nodes <- getNodeSet(xml.file, "//Observation/*[@Status=\"M\" or @Status=\"F\"]")
      if (length(md.nodes) > 0 )
      {
        for (xmd.node in md.nodes)
        {
          xml.parent    <- xmlParent(xmd.node)
          property.name <- xmlName(xmd.node)
          station.number <- as.integer(xmlValue(getNodeSet(xml.parent, "./Station")[[1]]))
          day.time       <- xmlValue(getNodeSet(xml.parent, "./DayTime")[[1]])

          daily.flags <- HeavyChecks.ManageFlags(daily.flags, station.number, strptime(day.time, "%Y%m%d"), property.name, "H")
        }
      }

      # get the number of columns
      xml.Observation <- getNodeSet(xml.root, "//Observation")[[1]]
      cnt.obs.child <- xpathApply(xml.Observation, path="count(./*)", xmlValue)

      # create the vector of columns types
      columns <- c("integer", "integer")
      for (i in 1:(cnt.obs.child - 2))
        columns <- c(columns, "numeric")

      # save XML to data.frame
      df <- suppressWarnings(xmlToDataFrame(xml.root, columns))

      # save data.frame to file
      write.table(df, datFileName, sep="\t", row.names=FALSE)

      daily.flags <- daily.flags[ order(daily.flags[, "Station"]), ]

      # release memory
      rm(xml.file)
      rm(xml.root)

      return (list(df.errors, daily.flags))
    }
    ,error = function (err)
    {
      print (paste0('Output.HeavyChecks.Xml2DataFrame - Error : ', err))
      return (list(df.errors, daily.flags))
    }
    ,warning = function (warn)
    {
      print (paste0('Output.HeavyChecks.Xml2DataFrame - Warning: ', warn))
      return (list(df.errors, daily.flags))
    }
  )

  return (result)
}

#*********************************************************
# Convert XML file to Data.Frame for HeavyChecks Level
# Produce a Data.Frame only with errors
# Update flags considering human changes
# xmlFileName 	[INPUT]		[STRING]	  - XML file name
# datFileName 	[INPUT]		[STRING]	  - data.frame file name
# daily.flags   [INPUT]   [DATA.FRAME]- data frame with daily flags
# RETURN [LIST] List with 2 data frames : one with errors and one with daily flags
#*********************************************************
Output.ThresholdChecks.Xml2DataFrame <- function(xmlFileName, datFileName, daily.flags)
{
  df.errors <- as.data.frame (matrix(nrow = 0, ncol = 6), stringsAsFactors = FALSE)
  colnames(df.errors) <- c("Station", "DayTime", "Property", "Flag", "ErrorCode", "Area")

  result <- tryCatch(
    {
      # open xml file
      xml.file <- xmlParse(xmlFileName)
      xml.root <- xmlRoot(xml.file)

      # retrieve ALERT nodes
      alert.nodes <- getNodeSet(xml.root, "//ALERT")

      # before to remove the alert nodes save the errors messages
      if (length(alert.nodes) > 0)
      {
        for (a.node in alert.nodes)
        {
          parent <- xmlParent(a.node)
          property      <- xmlGetAttr(a.node, "Property")
          error.code    <- xmlGetAttr(a.node, "Code")
          error.message <- xmlGetAttr(a.node, "Message")
          error.area    <- xmlGetAttr(a.node, "Area", default = "Unknown")
          if (error.area == "Unknown")
          {
            error.area <- ifelse(str_detect(paste0(error.message), "season"), "Season", "Daily")
          }
          station <- xmlValue(getNodeSet(parent, "./Station")[[1]])
          daytime <- xmlValue(getNodeSet(parent, "./DayTime")[[1]])
          property.flag  <- xmlGetAttr(getNodeSet(parent, paste0("./", property))[[1]], "Status")
          df.errors[1 + nrow(df.errors), ] <- c(station, daytime, property, property.flag, error.code, error.area)
        }
      }

      # remove alert nodes from the XML
      if (length(alert.nodes) >0 ) removeNodes(alert.nodes)

      # search for modified properties
      md.nodes <- getNodeSet(xml.file, "//Observation/*[@Status=\"M\" or @Status=\"F\"]")
      if (length(md.nodes) > 0 )
      {
        for (xmd.node in md.nodes)
        {
          xml.parent     <- xmlParent(xmd.node)
          property.name  <- xmlName(xmd.node)
          station.number <- xmlValue(getNodeSet(xml.parent, "./Station")[[1]])
          day.time       <- xmlValue(getNodeSet(xml.parent, "./DayTime")[[1]])

          daily.flags <- ThresholdChecks.ManageFlags(daily.flags, station.number, strptime(day.time, "%Y%m%d"), property.name, "H")
        }
      }

      # get the number of columns
      xml.Observation <- getNodeSet(xml.root, "//Observation")[[1]]
      cnt.obs.child <- xpathApply(xml.Observation, path="count(./*)", xmlValue)

      # create the vector of columns types
      columns <- c("integer", "integer")
      for (i in 1:(cnt.obs.child - 2))
        columns <- c(columns, "numeric")

      # save XML to data.frame
      df <- suppressWarnings(xmlToDataFrame(xml.root, columns))

      # save data.frame to file
      write.table(df, datFileName, sep="\t", row.names=FALSE)

      daily.flags <- daily.flags[ order(daily.flags[, "Station"]), ]

      # release memory
      rm(xml.file)
      rm(xml.root)

      return (list(df.errors, daily.flags))
    }
    ,error = function (err)
    {
      print (paste0('Output.ThresholdChecks.Xml2DataFrame - Error : ', err))
      return (list(df.errors, daily.flags))
    }
    ,warning = function (warn)
    {
      print (paste0('Output.ThresholdChecks.Xml2DataFrame - Warning: ', warn))
      return (list(df.errors, daily.flags))
    }
  )

  return (result)
}

#*********************************************************
# Convert WeakChecks errors into DataFrame
# xml.filename 	[INPUT]		[STRING]  - full path of XML file with WeakChecks errors
# dat.filename  [INPUT]	  [STRING]	- full path of DAT file with WeakChecks errors
#*********************************************************
WeakChecks.Errors.Xml2DataFrame <- function(xml.filename, dat.filename)
{
  # prepare the ouput file
  if (file.exists(dat.filename))
  {
    file.remove(dat.filename)
  }

  # recreate the file
  file.df <- file( dat.filename , open="wt")
  cat ( paste("Station", "DayTime",  "Property", "Value", "Status", "Codes", sep = "\t"), file = file.df, sep="\r\n")

  result <- tryCatch(
    {
      xml.data <- xmlParse(xml.filename)

      obsNodes <- getNodeSet(xml.data, "//Observation")
      for (n in 1:length(obsNodes))
      {
        station.number <- xmlValue( getNodeSet(obsNodes[[n]], "./Station")[[1]])
        day.time <- xmlValue( getNodeSet(obsNodes[[n]], "./DayTime")[[1]])

        propNodes <- getNodeSet(obsNodes[[n]], "./*")
        for (c in 1:length(propNodes))
        {
          #ignore Station, DayTime, ALERT nodes
          if ( xmlName(propNodes[[c]]) == 'Station' |
               xmlName(propNodes[[c]]) == 'DayTime' |
               xmlName(propNodes[[c]]) == 'ALERT' )
          {
            next
          }

          propCodes <- NA
          alertNodes <- getNodeSet(obsNodes[[n]], paste0("./ALERT[@Property=\"", xmlName(propNodes[[c]]), "\"]"))
          for (a in 1:length(alertNodes))
          {
            if (is.na(propCodes))
            {
              propCodes <- xmlGetAttr(alertNodes[[a]], "Code")
            }
            else
            {
              propCodes <- paste0(propCodes, "|", xmlGetAttr(alertNodes[[a]], "Code"))
            }
          }

          # save data to the file
          cat ( paste(station.number, day.time, xmlName(propNodes[[c]]), xmlValue(propNodes[[c]]), xmlGetAttr(propNodes[[c]], "Status"), propCodes, sep = "\t" ), file = file.df, sep='\r\n')
        }
      }

      ## close connection to error file anyway
      flush.connection(file.df)
      close.connection(file.df)

      return (TRUE)
    }
    ,error = function (err)
    {
      close(file.df)
      print (paste0('WeakChecks.Errors.Xml2DataFrame - Error : ', err))
      return (FALSE)
    }
    ,warning = function (warn)
    {
      close(file.df)
      print (paste0('WeakChecks.Errors.Xml2DataFrame - Warning: ', warn))
      return (FALSE)
    }
  )

  return (result)
}


