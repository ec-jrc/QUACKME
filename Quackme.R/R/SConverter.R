#*********************************************************
#             S-File Converter
#*********************************************************
# Libraries
library (XML)
library (methods)
library (stringr)

#*********************************************************
#            Application main code
#*********************************************************
rm(list=objects())

# get the source path to know from which path to include sources
currentPath <- paste0(getwd() , '/')
print (currentPath)

# Import Modules
source( paste0(currentPath, "OptionParsing.R"))

# Set UTC time zone
Sys.setenv(TZ = "UTC")

# parse the command line options
options <- SConverter.Command.Parse()

# create the log file and log the input options
log.file <- file( paste0(options[1, ]$LogPath, 'SConverter.', format(Sys.time(), "%Y%m%d%H%M"), '.log'), open="a")
Log.Options (options, log.file)

# check if the input file is an xml or dat file
input.file <- as.character(options[1, "InputFile"])
input.ext <- substr( input.file, length(input.file) - 2, length(input.file))

# if the input file is an XML file transform it into .dat format
if (input.ext == "xml")
{
  # extract the date from the file name
  file.date <- strptime(unlist(strsplit(input.file, "[.]"))[4], "%Y%m%d")

  # convert XML file to DAT file
  dat.file <- paste0( otpions[1, "OutputPath"], "O.ThresholdChecks.", file.date, ".dat")
  Output.ThresholdChecks.Xml2DataFrame (input.file, dat.file)
  input.file <- dat.file
}

# extract from the file name the reference date
ref.date <- strptime(options[1, ]$ReferenceDate, "%Y%m%d")
#ref.date <- strptime(unlist(strsplit(input.file, "[.]"))[3], "%Y%m%d")
j.date <- format(ref.date, "%j")

# read the properties names from the aggregation configuration file
agg.config <- xmlParse(paste0(options[1, "ConfigPath"], "Aggregation.xml"))
agg.properties <- getNodeSet(agg.config, "//Aggregation/Property/Name")
properties.names <- c("Station", "DayTime")
for (p.n in 1:length(agg.properties))
{
  property.name <- xmlValue(agg.properties[[p.n]])
  properties.names <- c(properties.names, property.name)
}

# read the input file
input.data <- read.table(input.file, header=TRUE)
                         #col.names = properties.names)
cat(paste0('[', Sys.time(), ']I| Input data converted to data.table.'), file = log.file, sep="\n")

# get the S-File name and crate the file if not exists
s.file <- paste0( options[1, "OutputPath"], "S", format(ref.date, "%Y%m%d"), ".dat")
if (file.exists(s.file)) file.remove(s.file)

# open the output file
printer = file(s.file, "w")

# read records from input file and save them to the output file
for (i in 1:nrow(input.data))
{
  station.line <- paste0(str_pad( input.data[i, "Station"], 8, side = "left", pad = " "),
                         str_pad( format(ref.date, "%Y%m%d"), 9, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "N"]), "-99.0", round(input.data[i, "N"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "MSUN"]), "-99.0", round(input.data[i, "MSUN"], digits=1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "MRAD"]), "-99.0", round(input.data[i, "MRAD"], digits=1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "TN"]), "-99.0", input.data[i, "TN"]), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "TX"]), "-99.0", input.data[i, "TX"]), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "MVP"]), "-99.0", round(input.data[i, "MVP"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "FF"]), "-99.0", round(input.data[i, "FF"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "RRR"]), "-99.0", round(input.data[i, "RRR"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "TT06"]), "-99.0", round(input.data[i, "TT06"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "RH06"]), "-99.0", round(input.data[i, "RH06"], digits = 0)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "TT09"]), "-99.0", round(input.data[i, "TT09"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "RH09"]), "-99.0", round(input.data[i, "RH09"], digits = 0)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "TT12"]), "-99.0", round(input.data[i, "TT12"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "RH12"]), "-99.0", round(input.data[i, "RH12"], digits = 0)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "TT15"]), "-99.0", round(input.data[i, "TT15"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "RH15"]), "-99.0", round(input.data[i, "RH15"], digits = 0)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "TT18"]), "-99.0", round(input.data[i, "TT18"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "RH18"]), "-99.0", round(input.data[i, "RH18"], digits = 0)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "SOIL"]), "-99.0", round(input.data[i, "SOIL"], digits = 0)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "VPD"]), "-99.0", round(input.data[i, "VPD"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "SLOPE"]), "-99.0", round(input.data[i, "SLOPE"], digits=3)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "NDT"]), "-99.0", round(input.data[i, "NDT"], digits = 1)), 6, side = "left", pad = " "), # daytime mean of total cloud cover
                         str_pad( ifelse(is.na(input.data[i, "L"]), "-99.0", round(input.data[i, "L"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( "-99.0", 6, side = "left", pad = " "),                      # Cloud shadow
                         str_pad( "-99.0", 6, side = "left", pad = " "),                      # Calculated Sunshine
                         str_pad( ifelse(is.na(input.data[i, "CRAD"]), "-99.0", round(input.data[i, "CRAD"] / 1000.0, digits=1)), 6, side = "left", pad = " "),    # Global radiation in MJ/m2 day
                         str_pad( ifelse(is.na(input.data[i, "ET0"]), "-99.0", round(input.data[i, "ET0"], digits = 1)), 6, side = "left", pad = " "),             # Evapotranspiration from crop canopy
                         str_pad( ifelse(is.na(input.data[i, "VIS"]), "-99.0", round(input.data[i, "VIS"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( ifelse(is.na(input.data[i, "SNOW"]), "-99.0", round(input.data[i, "SNOW"], digits = 1)), 6, side = "left", pad = " "),
                         str_pad( "-99.0", 6, side = "left", pad = " ")                       # RAIN_MOS
                         )

  # write the line to the file
  write(station.line,printer,append=T)
}

# close the output file
close(printer)

if (file.info(s.file)$size > 0)
{ cat(paste0('[', Sys.time(), ']I| S-File created: ', s.file), file = log.file, sep="\n") }

if (file.info(s.file)$size <= 0)
  { cat(paste0('[', Sys.time(), ']I| S-File NOT created: ', s.file), file = log.file, sep="\n") }

cat(paste0('[', Sys.time(), ']I| Process end'), file = log.file, sep="\n")
close(log.file)
