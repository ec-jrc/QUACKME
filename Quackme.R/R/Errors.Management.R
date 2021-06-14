#*********************************************************
#             ERRORS management Module
#*********************************************************
library(stringr)

#*********************************************************
# Manage the error for WeakChecks
# F - forced
# M - modified
# W - wrong
# Parameters :
# err.code       [IN]  [STRING]  error code
# prop.node      [IN]  [XML]     XML node of property
# day.time       [IN]  [INT]     date time in format YYYYMMDDHH24
# station.errors [IN]  [DATA.FRAME] data frame with station errors
# errpars        [IN]  [List]    error parameters Pierluca De Palma 17.09.2019
#    					   [OUT] [XMLNODE] the property node (changed or not)
#*********************************************************
WeakChecks.ManageError <- function(err.code, prop.node, day.time, station.errors, errpars)
{
  property.name <- paste0(xmlName(prop.node))
  x.node <- tryCatch(
    {
      generate.msg <- is.null(station.errors)

      # check if the message was already generated
      if (generate.msg == FALSE)
      {
        # search the combination <property, message code, daytime>
        err.indexes <- which(station.errors$DayTime == day.time &
                             station.errors$Property == property.name &
                             str_detect(paste0(station.errors$Codes), err.code))

        print ( paste0('Station:', station.errors[1, "Station"], ',Property:', property.name, ', code:', err.code, ', DayTime:', day.time, ', Indexes:', length(err.indexes)))
        generate.msg <- (length(err.indexes) <= 0)
        if (generate.msg == FALSE)
        {
          # if the message was already generate check the Status attribute for the property
          error.row <- station.errors[err.indexes[1], ]
          generate.msg <- (error.row$Status == "M" | error.row$Status == "W" | error.row$Status == "S")
          print ( paste0('Property:', property.name, ', code:', err.code, ', DayTime:', day.time,  ', Error.Status:', error.row$Status))
        }
      }

      if (generate.msg == TRUE)
      {
        # get message node
        msg <- df.msg[ which( df.msg$Property == property.name & df.msg$Code == err.code), ]
        msgLevel <- paste0(msg$Level)

        #Pierluca De Palma 17.09.2019
        #put error parameters in the KO xml
        #msg$Text <- gsub("#Code#", err.code, msg$Text)

        if(length(errpars)>0)
        {
          for (t in 1:length(errpars))
          {
            tbR = paste0("#", t-1, "#")
            msg$Text <- gsub(tbR, errpars[t], msg$Text)
          }
        }

        msg$Text <- gsub("#Code#", property.name, msg$Text)

        #print("----------------")
        #print(errpars)
        #print (paste0(tbR,"-", msg$Text))
        #print("----------------")

        # add alert node and set new value
        newXMLNode("ALERT", attrs=c("Level"=msgLevel,
                                    "Property"=property.name,
                                    "Code"=err.code,
                                    "Message"=paste0(msg$Text),
                                    "Status"="?"),
                   parent=xmlParent(prop.node))

        #manage the node status
        nodeStatus <- xmlGetAttr(prop.node, "Status")
        if (msgLevel == "W" |
            (msgLevel == "S" & !(nodeStatus == "W")) |
            (msgLevel == "A" & nodeStatus %in% c("A", "C") ))
        {
          xmlAttrs(prop.node) <- c(Status=msgLevel)
        }
      }

      return (prop.node)
    }
    ,error = function (err)
    {
      print (paste0('WeakCheks.ManageError - Error[Code=', err.code, ', Property=', property.name, '] : ', err))
      return (prop.node)
    }
    ,warning = function (warn)
    {
      print (paste0('WeakCheks.ManageError - Warning: ', warn))
      return (prop.node)
    }
  )

  return (x.node)
}

#*********************************************************
# Convert data from XML error file o a data frame
# xml.errors	[IN]		  [XML]		      xml structure
# 					  [RETURN]	[DATA.FRAME]	data frame with only data (no ALERT information)
#*********************************************************
Erros.XmlData.ToDataFrame <- function (xml.errors)
{
	xml.root <- xmlRoot(xml.errors)
	nodes <- getNodeSet(xml.root, "//Observation/ALERT")
	removeNodes(nodes)
	df = xmlToDataFrame(xml.root)
	rm("xml.errors")

	return (df)
}

#*********************************************************
# Check error message presence into the XML error file
# err.code    [IN]  [STRING]  error code
# err.prop    [IN]  [STRING]  property name
# err.station [IN]  [INT]     station code
# err.dt      [IN]  [INT]     date time in format YYYYMMDDHH24
# xml.errors  [IN]  [XML]     xml structure
# 					  [OUT]	[XMLNODE]	XmlNode if the error is present, NULL otherwise
#*********************************************************
Errors.Xml.Search.Code <- function(err.code, err.prop, err.station, err.dt, xml.errors)
{
  nodes <- getNodeSet(xml.errors, paste0("//Observation[(DayTime=", err.dt, " and Station=", err.station,
                                        ")]/ALERT[(@Code=\"", err.code, "\" and @Property=\"", err.prop , "\")]"))

  return ( switch( length(nodes) + 1, NULL, nodes[[1]]) )
}

#*********************************************************
# Check the property node with an error status
# F - forced
# M - modified
# W - wrong
# Parameters :
# err.code    [IN]  [STRING]  error code
# err.prop    [IN]  [STRING]  property name
# err.station [IN]  [INT]     station code
# err.dt      [IN]  [INT]     date time in format YYYYMMDDHH24
# xml.errors  [IN]  [XML]     xml structure
# 					  [OUT]	[XMLNODE]	XmlNode if the error is present, NULL otherwise
#*********************************************************
Errors.Xml.Search.Property <- function(err.prop, err.station, err.dt, xml.errors)
{
  nodes <- getNodeSet(xml.errors, paste0("//Observation[DayTime=", err.dt,
                                         " and Station=", err.station, "]/",
                                         err.prop,
                                         "[(@Status=\"F\" or @Status=\"M\" or @Status=\"W\")]"))

  return ( switch( length(nodes) + 1, NULL, nodes[[1]]) )
}

#*********************************************************
# Manage the error generation for a property, considering the error level
# and if message was generate again or not
# row         [IN]  [DATA.FRAME] row of data.frame with observation data
# xml.errors  [IN]  [XML]     xml structure
# err.code    [IN]  [STRING]  error code
# err.prop    [IN]  [STRING]  property name
# xml.node    [IN]  [XMLNODE] node with current property situation
# 					  [OUT]	[XMLNODE]	Changed XML node
#
# !! ATTENTION df.msg is a variable present into the cluster
#
#*********************************************************
Errors.Message.Property <- function(row, xml.errors, err.code, err.prop, xml.node)
{
  x.node <- tryCatch(
    {
      generate.msg <- is.null(xml.errors)

      # check if the message was already generated
      if (generate.msg == FALSE)
      {
        # search the combination <property, message code>
        error.node <- Errors.Xml.Search.Code( err.code, err.prop, row$Station, row$DayTime, xml.errors)
        generate.msg <- is.null(error.node)
        if (generate.msg == FALSE)
        {
          # if the message was already generate check the Status attribute for the property
          value.node <- Errors.Xml.Search.Property (err.prop, row$Station, row$DayTime, xml.errors)
          generate.msg <- is.null(value.node)
          if (!is.null(value.node))
          {
            generate.msg <- xmlGetAttr(value.node, "Status") == "M" | xmlGetAttr(value.node, "Status") == "W"
          }
        }
      }

      if (generate.msg == TRUE)
      {
        # get message node
        msg <- df.msg[ which( df.msg$Property == err.prop & df.msg$Code == err.code), ]
        msgLevel <- paste0(msg$Level)

        # add alert node and set new value
        newXMLNode("ALERT", attrs=c("Level"=msgLevel,
                                    "Property"=err.prop,
                                    "Code"=err.code,
                                    "Message"=paste0(msg$Text),
                                    "Status"="?"),
                   parent=xmlParent(xml.node))

        #manage the node status
        nodeStatus <- xmlGetAttr(xml.node, "Status")
        if (msgLevel == "W" |
            (msgLevel == "S" & !(nodeStatus == "W")) |
             (msgLevel == "A" & nodeStatus %in% c("A", "C") ))
        {
          xmlAttrs(xml.node) <- c(Status=msgLevel)
        }
      }

      return (xml.node)
    }
    ,error = function (err)
    {
      print (paste0('Errors.Message.Property - Error[Code=', err.code, ', Property=', err.prop, '] : ', err))
      return (xml.node)
    }
    ,warning = function (warn)
    {
      print (paste0('Errors.Message.Property - Warning: ', warn))
      return (xml.node)
    }
    )

  return (x.node)
}

#*********************************************************
# Create the XML node for the specific property and code
# station.data  [IN]  [DATA.FRAME] row of data.frame with station data
# p.name        [IN]  [STRING]     property name
# m.code        [IN]  [STRING]     message code
# errpars        [IN]  [List]    error parameters Pierluca De Palma 26.09.2019
#   RETURN      [OUT] [XML]        alert node
#
# !! ATTENTION df.msg is a variable present into the cluster
#
#*********************************************************
ErrorNode.HeavyChecks <- function(station.data, station.xml, error.xml, p.name, m.code, errpars)
{
  result <- tryCatch(
    {
      # search if need to generate the message if the error.xml is valued
      generate.msg <- TRUE
      if (!is.null(error.xml))
      {
        # search the ALERT node for current property and code
        error.prop <- getNodeSet(error.xml, paste0("//ALERT[(@Property=\"", p.name, "\" and @Code=\"", m.code, "\")]"))
        if (length(error.prop) > 0)
        {
          # get the node of the property to see if the value was forced
          node.prop <- getNodeSet(error.xml, paste0("/Observation/", p.name))
          if (length(node.prop) > 0)
          {
            generate.msg <- xmlGetAttr(node.prop[[1]], "Status") != "F"
          }
        }
      }

      if (generate.msg == TRUE)
      {
        # get the message
        msg <- df.msg[ which( df.msg$Property == p.name & df.msg$Code == m.code), ]
        msg.values <- ""

        # check if the message exists
        if (nrow(msg) > 0)
        {
          # check if is necessary to evaluate values,other than current property
          if ("Values" %in% colnames(df.msg))
          {
            if (!is.null(msg$Values) & !is.na(msg$Values) & length(msg$Values) > 0)
            {
              m.values <- str_replace_all(msg$Values, " ", "")
              s.values <- strsplit(m.values, ",")[[1]]
              for (s in 1:length(s.values))
              {
                if (s.values[s] %in% colnames(station.data))
                {
                  msg.values <- paste0(msg.values, s.values[s], "=", station.data[1, s.values[s]], ",")
                }
              }
              msg.values <- str_sub(msg.values, 1, str_length(msg.values)-1)
            }
          }


          #Pierluca De Palma 26.09.2019
          #put error parameters in the KO xml
          #msg$Text <- gsub("#Code#", err.code, msg$Text)

          if(length(errpars)>0)
          {
            for (t in 1:length(errpars))
            {
              tbR = paste0("#", t-1, "#")
              msg$Text <- gsub(tbR, errpars[t], msg$Text)
            }
          }

          msg$Text <- gsub("#Code#", p.name, msg$Text)

          # print("----------------")
          # print(errpars)
          # print (paste0(tbR,"-", msg$Text))
          # print("----------------")

          # create the alert node
          newXMLNode("ALERT", "", attrs=c("Level"=paste0(msg$Level),
                                                    "Property"=p.name,
                                                    "Code"=m.code,
                                                    "Message"=paste0(msg$Text),
                                                    "Values"=msg.values),
                     parent=station.xml)


          p.node <- getNodeSet(station.xml, paste0("//Observation/", p.name))
          xmlAttrs(p.node[[1]]) <- c(Status=paste0(msg$Level))
        }
        else
        {
          print (paste0('Missing configuration for the Property=', p.name, ' and Code=', m.code))
        }
      }

      return (station.xml)
    }
    ,error = function (err)
    {
      print (paste0('ErrorNode.HeavyChecks - Error : ', err))
      return (station.xml)
    }
    ,warning = function (err)
    {
      print (paste0('ErrorNode.HeavyChecks - Warning: ', err))
      return (station.xml)
    }
  )
}

#*********************************************************
# Create the XML node for the specific property and code
# station.data  [IN]  [DATA.FRAME] row of data.frame with station data
# station.xml   [IN]  [XML]        station  xml
# error.xml     [IN]  [XML]        station error xml
# p.name        [IN]  [STRING]     property name
# m.code        [IN]  [STRING]     message code
#   RETURN      [OUT] [XML]        alert node
#
# !! ATTENTION df.msg is a variable present into the cluster
#
#*********************************************************
ErrorNode.ThresholdChecks.Daily <- function(station.data, station.xml, error.xml, p.name, m.code, errpars)
{
  result <- tryCatch(
    {
      # search if need to generate the message if the error.xml is valued
      generate.msg <- TRUE
      if (!is.null(error.xml))
      {
        # search the ALERT node for current property and code
        error.prop <- getNodeSet(error.xml, paste0("//ALERT[(@Property=\"", p.name, "\" and @Code=\"", m.code, "\")]"))
        if (length(error.prop) > 0)
        {
          # get the node of the property to see if the value was forced
          node.prop <- getNodeSet(error.xml, paste0("/Observation/", p.name))
          if (length(node.prop) > 0)
          {
            generate.msg <- xmlGetAttr(node.prop[[1]], "Status") != "F"
          }
        }
      }

      if (generate.msg == TRUE)
      {
        # get the message
        msg <- df.daily.msg[ which( df.daily.msg$Property == p.name & df.daily.msg$Code == m.code), ]
        msg.values <- ""

        # check if is necessary to evaluate values,other than current property
        if ("Values" %in% colnames(df.daily.msg))
        {
          if (length(as.character(msg$Values)) > 0 & !is.na(msg$Values))
          {
            m.values <- str_replace_all(msg$Values, " ", "")
            s.values <- strsplit(m.values, ",")[[1]]
            for (s in 1:length(s.values))
            {
              if (s.values[s] %in% colnames(station.data))
              {
                msg.values <- paste0(msg.values, s.values[s], "=", station.data[1, s.values[s]], ",")
              }
            }

            msg.values <- str_sub(msg.values, 1, str_length(msg.values)-1)
          }
        }

        #Pierluca De Palma 26.09.2019
        #put error parameters in the KO xml
        if(length(errpars)>0)
        {
          for (t in 1:length(errpars))
          {
            tbR = paste0("#", t-1, "#")
            msg$Text <- gsub(tbR, errpars[t], msg$Text)
          }
        }
        msg$Text <- gsub("#Code#", p.name, msg$Text)

        # create the alert node
        newXMLNode("ALERT", "", attrs=c("Level"=paste0(msg$Level),
                                        "Property"=p.name,
                                        "Code"=m.code,
                                        "Message"=paste0(msg$Text),
                                        "Values"=msg.values),
                   parent=station.xml)


        p.node <- getNodeSet(station.xml, paste0("//Observation/", p.name))
        xmlAttrs(p.node[[1]]) <- c(Status=paste0(msg$Level))
      }

      return (station.xml)
    }
    ,error = function (err)
    {
      print (paste0('ErrorNode.ThresholdChecks.Daily - Error : ', err))
      return (station.xml)
    }
    ,warning = function (err)
    {
      print (paste0('ErrorNode.ThresholdChecks.Daily - Warning: ', err))
      return (station.xml)
    }
  )
}

#*********************************************************
# Create the XML node for the specific property and code
# station.data  [IN]  [DATA.FRAME] row of data.frame with station data
# station.xml   [IN]  [XML]        station  xml
# error.xml     [IN]  [XML]        station error xml
# p.name        [IN]  [STRING]     property name
# m.code        [IN]  [STRING]     message code
#   RETURN      [OUT] [XML]        alert node
#
# !! ATTENTION df.msg is a variable present into the cluster
#
#*********************************************************
ErrorNode.ThresholdChecks.Seasons <- function(station.data, station.xml, error.xml, p.name, m.code, errpars)
{
  result <- tryCatch(
    {
      # search if need to generate the message if the error.xml is valued
      generate.msg <- TRUE
      if (!is.null(error.xml))
      {
        # search the ALERT node for current property and code
        error.prop <- getNodeSet(error.xml, paste0("//ALERT[(@Property=\"", p.name, "\" and @Code=\"", m.code, "\")]"))
        if (length(error.prop) > 0)
        {
          # get the node of the property to see if the value was forced
          node.prop <- getNodeSet(error.xml, paste0("/Observation/", p.name))
          if (length(node.prop) > 0)
          {
            generate.msg <- xmlGetAttr(node.prop[[1]], "Status") != "F"
          }
        }
      }

      # get the message
      if (generate.msg == TRUE)
      {
        msg <- df.seasons.msg[ which( df.seasons.msg$Property == p.name & df.seasons.msg$Code == m.code), ]
        msg.values <- ""

        # check if is necessary to evaluate values,other than current property
        if ("Values" %in% colnames(df.seasons.msg))
        {
          if (!is.na(msg$Values) & length(msg$Values) > 0)
          {
            m.values <- str_replace_all(msg$Values, " ", "")
            s.values <- strsplit(m.values, ",")[[1]]
            for (s in 1:length(s.values))
            {
              if (s.values[s] %in% colnames(station.data))
              {
                msg.values <- paste0(msg.values, s.values[s], "=", station.data[1, s.values[s]], ",")
              }
            }
            msg.values <- str_sub(msg.values, 1, str_length(msg.values)-1)
          }
        }


        #Pierluca De Palma 26.09.2019
        #put error parameters in the KO xml
        #msg$Text <- gsub("#Code#", err.code, msg$Text)

        if(length(errpars)>0)
        {
          for (t in 1:length(errpars))
          {
            tbR = paste0("#", t-1, "#")
            msg$Text <- gsub(tbR, errpars[t], msg$Text)
          }
        }

        msg$Text <- gsub("#Code#", p.name, msg$Text)

        # print("----------------")
        # print(errpars)
        # print (paste0(tbR,"-", msg$Text))
        # print("----------------")

        # create the alert node
        newXMLNode("ALERT", "", attrs=c("Level"=paste0(msg$Level),
                                        "Property"=p.name,
                                        "Code"=m.code,
                                        "Message"=paste0(msg$Text),
                                        "Values"=msg.values),
                   parent=station.xml)


        p.node <- getNodeSet(station.xml, paste0("//Observation/", p.name))
        xmlAttrs(p.node[[1]]) <- c(Status=paste0(msg$Level))
      }

      return (station.xml)
    }
    ,error = function (err)
    {
      print (paste0('ErrorNode.ThresholdChecks.Seasons - Error : ', err))
      return (station.xml)
    }
    ,warning = function (err)
    {
      print (paste0('ErrorNode.ThresholdChecks.Seasons - Warning: ', err))
      return (station.xml)
    }
  )
}


#*********************************************************
# Search value into specific model
# station.xml   [IN]  [XML]        Xml structure of station data
# model.data    [IN]  [DATA.FRAME] Model data for the specific station
# p.name        [IN]  [STRING]     Property name
# ref.data      [IN]  [DATETIME]   Reference Date
#   RETURN      [OUT] [XML]        Xml structure of station data
#
#*********************************************************
Replace.Value.From.Model <- function(station.xml, model.data, p.name, ref.date)
{
  result <- tryCatch (
    {
      model.value <- NA
      mdl.df <- model.data[ which(strptime(model.data$DayTime, "%Y%m%d") == ref.date), ]
      if (nrow(mdl.df) > 0)
      {
        model.value <- mdl.df[1, p.name]
      }

      if (!is.na(model.value))
      {
        p.node <- getNodeSet(station.xml, paste0("//Observation/", p.name))
        xmlAttrs(p.node[[1]]) <- c(Status="R")
        xmlValue(p.node[[1]]) <- model.value
      }

      return (station.xml);
    }
    ,error = function (err)
    {
      print (paste0('Replace.Value.From.Model - Error : ', err))
      return (station.xml)
    }
    ,warning = function (err)
    {
      print (paste0('Replace.Value.From.Model - Warning: ', err))
      return (station.xml)
    }
  )

  return (result)
}

#*********************************************************
# Make the threshold checks for seasons values
# The checks will be done for a single station
# Parameters :
#  - station.data   [INPUT] [DATA.FRAME]	- station data
#  - station.xml    [INPUT] [XML]	        - station xml
#  - station.number [INPUT] [INT]	        - station number
#  - current.date   [INPUT] [INT]	        - day to analyze (like int in the format YYYYMMDD)
#*********************************************************
Get.Season <- function(day)
{
  iMonth <- as.numeric( format( day, "%m"))

  # default value Winter
  sSeason <- 'winter'

  # Spring
  if (iMonth >=3 & iMonth <= 5)
  {
    sSeason <- 'spring'
  }
  # Spring
  else if (iMonth >=6 & iMonth <= 8)
  {
    sSeason <- 'summer'
  }
  # Autumn
  else if (iMonth >=9 & iMonth <= 11)
  {
    sSeason <- 'autumn'
  }

  return (sSeason)
}


#---- NEW ----
#*********************************************************
# Manage the error for WeakChecks
# F - forced
# M - modified
# W - wrong
# Parameters :
# err.code       [IN]  [STRING]  error code
# property.name  [IN]  [STRING]  name of related property
# day.time       [IN]  [INT]     date time in format YYYYMMDDHH24
# station.errors [IN]  [DATA.FRAME] data frame with station errors
# errpars        [IN]  [List]    error parameters Pierluca De Palma 17.09.2019
#    					   [OUT] [LISt]     List with error level and error full text
#*********************************************************
WeakChecks.GetError <- function(err.code, property.name, day.time, station.errors, errpars)
{
  err.list <- tryCatch(
    {
      generate.msg <- is.null(station.errors)

      # check if the message was already generated
      if (generate.msg == FALSE)
      {
        # search the combination <property, message code, daytime>
        err.indexes <- which(station.errors$DayTime == day.time &
                             station.errors$Property == property.name &
                             str_detect(paste0(station.errors$Codes), err.code))

        print ( paste0('Station:', station.errors[1, "Station"],
                       ',Property:', property.name,
                       ', code:', err.code,
                       ', DayTime:', day.time,
                       ', Indexes:', length(err.indexes)))

        generate.msg <- (length(err.indexes) <= 0)
        if (generate.msg == FALSE)
        {
          # if the message was already generate check the Status attribute for the property
          error.row <- station.errors[err.indexes[1], ]
          generate.msg <- (error.row$Status == "M" | error.row$Status == "W" | error.row$Status == "S")
          #print ( paste0('Property:', property.name, ', code:', err.code, ', DayTime:', day.time,  ', Error.Status:', error.row$Status))
        }
      }

      if (generate.msg == TRUE)
      {
        # get message node
        msg <- df.msg[ which( df.msg$Property == property.name & df.msg$Code == err.code)[1], ]

        error.text <- paste0(msg$Text)
        if(length(errpars)>0)
        {
          for (t in 1:length(errpars))
          {
            tbR = paste0("#", t-1, "#")
            if (!is.na(errpars[t]))
            {
              error.text <- gsub(tbR, errpars[t], error.text)
            }
            else
            {
              error.text <- gsub(tbR, "NA", error.text)
            }
          }
        }

        error.text <- gsub("#Code#", property.name, error.text)

        r.list <- list()
        r.list[[1]] <- paste0(msg$Level)
        r.list[[2]] <- error.text
        return (r.list)
      }

      # return nothing, is not necessary to add a new message
      return (NULL)
    }
    ,error = function (err)
    {
      print (paste0('WeakCheks.GetError - Error[Code=', err.code, ', Property=', property.name, '] : ', err))
      return ( NULL )
    }
    ,warning = function (warn)
    {
      print (paste0('WeakCheks.GetError - Warning: ', warn))
      return ( NULL )
    }
  )

  return (err.list)
}

#*********************************************************
# Manage the error for HeavyChecks
# F - forced
# M - modified
# W - wrong
# Parameters :
# station.obs    [IN]  [DATA.FRAME]  station observation
# property       [IN]  [STRING]   name of related property
# error.code     [IN]  [STRING]   error code
# error.params   [IN]  [LIST]     error parameters list
# RETURN   				     [LIST]     List with error level and error full text
#*********************************************************
HeavyChecks.GetError <- function(station.obs, property, error.code, error.params)
{
  station.number <- station.obs[1, "Station"]
  day.time       <- station.obs[1, "DayTime"]

  err.list <- tryCatch(
    {
      generate.msg <- FALSE

      # search for same error
      station.error <- NULL
      if (!is.null(df.errors))
      {
        station.error <- subset (df.errors, df.errors$Station == station.number &
                                            df.errors$Property == property &
                                            df.errors$ErrorCode == error.code &
                                            df.errors$DayTime == day.time)
      }

      if (is.null(station.error))
      {
        generate.msg <- TRUE
      }
      else if (nrow(station.error) == 0)
      {
        generate.msg <- TRUE
      }
      print (generate.msg)

      # check if the message was already generated
      if (!generate.msg)
      {
        # if the message was already generate check the Status attribute for the property
        generate.msg <- (station.error$Flag == "M" | station.error$Flag == "W" | station.error$Flag == "S")
        print ( paste0('Property:', property, ', code:', error.code, ', DayTime:', day.time,  ', Error.Status:', station.error$Flag))
      }

      if (generate.msg)
      {
        # get message node
        msg <- df.msg[ which( df.msg$Property == property & df.msg$Code == error.code)[1], ]

        error.text <- paste0(msg$Text)
        if(length(error.params)>0)
        {
          for (t in 1:length(error.params))
          {
            tbR = paste0("#", t-1, "#")
            if (!is.na(error.params[t]))
            {
              error.text <- gsub(tbR, error.params[t], error.text)
            }
            else
            {
              error.text <- gsub(tbR, "NA", error.text)
            }
          }
        }

        error.text <- gsub("#Code#", property, error.text)

        values.text <- ""
        # check if is necessary to retrieve the values
        if (!is.na(msg$Values) & nchar(as.character(msg$Values)) > 0)
        {
          prop.values <- unlist(strsplit(as.character(msg$Values), "[,]"))
          if (length(prop.values) > 0 ) {  prop.values <- trimws(prop.values) }
          for (p in 1: length(prop.values))
          {
            if (prop.values[p] %in% colnames(station.obs))
            {
              values.text <- paste0(values.text, ifelse(nchar(values.text) > 0, ',', ''))
              values.text <- paste0(values.text, prop.values[p], "=", as.character(station.obs[1, prop.values[p]]))
            }
          }
        }

        return (list(paste0(msg$Level), error.text, values.text))
      }

      # return nothing, is not necessary to add a new message
      return (NULL)
    }
    ,error = function (err)
    {
      print (paste0('HeavyCheks.GetError - Error[Station=', station.number , ',Code=', error.code, ', Property=', property, '] : ', err))
      return ( NULL )
    }
    ,warning = function (warn)
    {
      print (paste0('HeavyCheks.GetError - Warning[Station=', station.number , ',Code=', error.code, ', Property=', property, '] : ', warn))
      return ( NULL )
    }
  )

  return (err.list)
}

#*********************************************************
# Manage the error for ThresholdChecks
# F - forced
# M - modified
# W - wrong
# Parameters :
# station.obs    [IN]  [DATA.FRAME]  station observations
# property       [IN]  [STRING]   name of related property
# error.code     [IN]  [STRING]   error code
# error.params   [IN]  [LIST]     error parameters list
# RETURN   				     [LIST]     List with error level and error full text
#*********************************************************
ThresholdChecks.Daily.GetError <- function(station.obs, property, error.code, error.params)
{
  station.number <- station.obs[1, "Station"]
  day.time       <- station.obs[1, "DayTime"]

  err.list <- tryCatch(
    {
      generate.msg <- FALSE

      # search for same error
      station.error <- NULL
      if (!is.null(df.errors))
      {
        station.error <- subset (df.errors, df.errors$Station == station.number &
                                   df.errors$Property == property &
                                   df.errors$ErrorCode == error.code &
                                   df.errors$DayTime == day.time &
                                   (df.errors$Area == "Daily" | df.errors$Area == "Unknown"))
      }

      if (is.null(station.error))
      {
        generate.msg <- TRUE
      }
      else if (nrow(station.error) == 0)
      {
        generate.msg <- TRUE
      }
      print (generate.msg)

      # check if the message was already generated
      if (!generate.msg)
      {
        # if the message was already generate check the Status attribute for the property
        generate.msg <- (station.error$Flag == "M" | station.error$Flag == "W" | station.error$Flag == "S")
        print ( paste0('Property:', property, ', code:', error.code, ', DayTime:', day.time,  ', Error.Status:', station.error$Flag))
      }

      if (generate.msg)
      {
        # get message node
        msg <- df.daily.msg[ which( df.daily.msg$Property == property & df.daily.msg$Code == error.code)[1], ]

        error.text <- paste0(msg$Text)
        if(length(error.params)>0)
        {
          for (t in 1:length(error.params))
          {
            tbR = paste0("#", t-1, "#")
            if (!is.na(error.params[t]))
            {
              error.text <- gsub(tbR, error.params[t], error.text)
            }
            else
            {
              error.text <- gsub(tbR, "NA", error.text)
            }
          }
        }

        error.text <- gsub("#Code#", property, error.text)

        values.text <- ""
        # check if is necessary to retrieve the values
        if (!is.na(msg$Values) & nchar(as.character(msg$Values)) > 0)
        {
          prop.values <- unlist(strsplit(as.character(msg$Values), "[,]"))
          if (length(prop.values) > 0 ) {  prop.values <- trimws(prop.values) }
          for (p in 1: length(prop.values))
          {
            if (prop.values[p] %in% colnames(station.obs))
            {
              values.text <- paste0(values.text, ifelse(nchar(values.text) > 0 , ",", ""))
              values.text <- paste0(values.text, prop.values[p], "=", as.character(station.obs[1, prop.values[p]]))
            }
          }
        }

        return (list(paste0(msg$Level), error.text, values.text))
      }

      # return nothing, is not necessary to add a new message
      return (NULL)
    }
    ,error = function (err)
    {
      print (paste0('ThresholdChecks.Daily.GetError - Error[Station=', station.number , ',Code=', error.code, ', Property=', property, '] : ', err))
      return ( NULL )
    }
    ,warning = function (warn)
    {
      print (paste0('ThresholdChecks.Daily.GetError - Warning[Station=', station.number , ',Code=', error.code, ', Property=', property, '] : ', warn))
      return ( NULL )
    }
  )

  return (err.list)
}

#*********************************************************
# Manage the error for ThresholdChecks
# F - forced
# M - modified
# W - wrong
# Parameters :
# station.obs    [IN]  [DATA.FRAME]  station observations
# property       [IN]  [STRING]   name of related property
# error.code     [IN]  [STRING]   error code
# error.params   [IN]  [LIST]     error parameters list
# RETURN   				     [LIST]     List with error level and error full text
#*********************************************************
ThresholdChecks.Seasons.GetError <- function(station.obs, property, error.code, error.params)
{
  station.number <- station.obs[1, "Station"]
  day.time       <- station.obs[1, "DayTime"]

  err.list <- tryCatch(
    {
      generate.msg <- FALSE

      # search for same error
      station.error <- NULL
      if (!is.null(df.errors))
      {
        station.error <- subset (df.errors, df.errors$Station == station.number &
                                   df.errors$Property == property &
                                   df.errors$ErrorCode == error.code &
                                   df.errors$DayTime == day.time &
                                   (df.errors$Area == "Season" | df.errors$Area == "Unknown"))
      }

      if (is.null(station.error))
      {
        generate.msg <- TRUE
      }
      else if (nrow(station.error) == 0)
      {
        generate.msg <- TRUE
      }
      print (generate.msg)

      # check if the message was already generated
      if (!generate.msg)
      {
        # if the message was already generate check the Status attribute for the property
        generate.msg <- (station.error$Flag == "M" | station.error$Flag == "W" | station.error$Flag == "S")
        #print ( paste0('Property:', property, ', code:', error.code, ', DayTime:', day.time,  ', Error.Status:', station.error$Flag))
      }

      if (generate.msg)
      {
        # get message node
        msg <- df.seasons.msg[ which( df.seasons.msg$Property == property & df.seasons.msg$Code == error.code), ]

        error.text <- paste0(msg$Text)
        if(length(error.params)>0)
        {
          for (t in 1:length(error.params))
          {
            tbR = paste0("#", t-1, "#")
            if (!is.na(error.params[t]))
            {
              error.text <- gsub(tbR, error.params[t], error.text)
            }
            else
            {
              error.text <- gsub(tbR, "NA", error.text)
            }
          }
        }

        error.text <- gsub("#Code#", property, error.text)

        values.text <- ""
        # check if is necessary to retrieve the values
        if (nchar(as.character(msg$Values)) > 0)
        {
          prop.values <- unlist(strsplit(as.character(msg$Values), "[,]"))
          if (length(prop.values) > 0 ) {  prop.values <- trimws(prop.values) }
          for (p in 1: length(prop.values))
          {
            if (prop.values[p] %in% colnames(station.obs))
            {
              values.text <- paste0(values.text, ifelse(nchar(values.text) > 0, ',', ''))
              values.text <- paste0(values.text, prop.values[p], '=', station.obs[1, prop.values[p]])
            }
          }
        }

        return (list(paste0(msg$Level), error.text, values.text))
      }

      # return nothing, is not necessary to add a new message
      return (NULL)
    }
    ,error = function (err)
    {
      print (paste0('ThresholdChecks.Seasons.GetError - Error[Station=', station.number , ',Code=', error.code, ', Property=', property, '] : ', err))
      return ( NULL )
    }
    ,warning = function (warn)
    {
      print (paste0('ThresholdChecks.Seasons.GetError - Warning[Station=', station.number , ',Code=', error.code, ', Property=', property, '] : ', warn))
      return ( NULL )
    }
  )

  return (err.list)
}
