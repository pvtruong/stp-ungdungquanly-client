
:CheckOS
IF "%PROCESSOR_ARCHITECTURE%"=="x86" (GOTO 32BIT) ELSE (GOTO 64BIT)

:64BIT
start nwjs/64/nw.exe administrator
GOTO END

:32BIT
start nwjs/32/nw.exe administrator
GOTO END

:END