@echo off

start powershell -NoExit -Command "$Host.UI.RawUI.WindowTitle = 'orden-de-compra'; cd C:/Kafka; .\bin\windows\kafka-console-consumer.bat --topic orden-de-compra --bootstrap-server localhost:9092"
start powershell -NoExit -Command "$Host.UI.RawUI.WindowTitle = 'solicitudes'; cd C:/Kafka; .\bin\windows\kafka-console-consumer.bat --topic solicitudes --bootstrap-server localhost:9092"
start powershell -NoExit -Command "$Host.UI.RawUI.WindowTitle = 'despacho'; cd C:/Kafka; .\bin\windows\kafka-console-consumer.bat --topic despacho --bootstrap-server localhost:9092"
start powershell -NoExit -Command "$Host.UI.RawUI.WindowTitle = 'recepcion'; cd C:/Kafka; .\bin\windows\kafka-console-consumer.bat --topic recepcion --bootstrap-server localhost:9092"
start powershell -NoExit -Command "$Host.UI.RawUI.WindowTitle = 'novedades'; cd C:/Kafka; .\bin\windows\kafka-console-consumer.bat --topic novedades --bootstrap-server localhost:9092"

pause
