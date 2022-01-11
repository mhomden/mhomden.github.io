@ECHO OFF
ECHO Checking connection, please wait...
PING 8.8.8.8 | FIND "Reply from " > NUL
IF NOT ERRORLEVEL 1 ECHO You have an active connection to the internet
IF     ERRORLEVEL 1 ECHO You have NO active connection to the internet
