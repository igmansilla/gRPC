@echo off

start cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-server-start.bat .\config\server.properties"

pause
