FROM tomcat:10.1.34-jdk17
RUN rm -rf /usr/local/tomcat/webapps/*
COPY target/SWP391-1.0-SNAPSHOT.war /usr/local/tomcat/webapps/ROOT.war
EXPOSE 8080
CMD ["catalina.sh", "run"]