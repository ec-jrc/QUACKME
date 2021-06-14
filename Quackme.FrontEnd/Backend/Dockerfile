#!CONTEXT=../..
FROM openjdk:11

WORKDIR /root

COPY target/mars-obspro-quackmeweb-backend-0.0.1-SNAPSHOT.jar . 

ENTRYPOINT ["java","-Xmx3500m", "-jar","mars-obspro-quackmeweb-backend-0.0.1-SNAPSHOT.jar"]