@echo off

start cmd /k "cd /d C:\Kafka && .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties"

pause
