@echo off

cd /d C:\Kafka

start cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-topics.bat --create --topic orden-de-compra --bootstrap-server localhost:9092"
start cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-topics.bat --create --topic solicitudes --bootstrap-server localhost:9092"
start cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-topics.bat --create --topic despacho --bootstrap-server localhost:9092"
start cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-topics.bat --create --topic recepcion --bootstrap-server localhost:9092"
start cmd /k "cd /d C:\Kafka && .\bin\windows\kafka-topics.bat --create --topic novedades --bootstrap-server localhost:9092"

pause
