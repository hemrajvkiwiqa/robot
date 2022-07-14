.. default-role:: code

.. code:: robotframework

    *** Settings ***
    #Suite Setup       Clear Login Database
    #Test Teardown     Clear Login Database
    Suite Setup       Open Serial Port
    Suite Teardown    Close Serial Port

    Force Tags        quickstart
    Default Tags      example    smoke

    Library           OperatingSystem
    Library           String
    Library           lib/LoginLibrary.py
    Library           SerialLibrary    encoding=ascii


    *** Variables ***
    ${USERNAME}               janedoe
    ${PASSWORD}               J4n3D0e
    ${NEW PASSWORD}           e0D3n4J
    ${DATABASE FILE}          ${TEMPDIR}${/}techblocks-tests-db.txt
    ${PWD INVALID LENGTH}     Password must be 7-12 characters long
    ${PWD INVALID CONTENT}    Password must be a combination of lowercase and uppercase letters and numbers
    ${SERIAL_PORT}            /dev/tty.usbmodem14202
    #${SERIAL_PORT}            /dev/tty.usbmodem14102


User keywords

.. code:: robotframework

    *** Keywords ***
    Open Serial Port
        Add Port   ${SERIAL_PORT}     baudrate=115200    bytesize=8    parity=N    stopbits=1    timeout=999

    Close Serial Port
        Delete All Ports

    Read Until Single
        [Arguments]    ${expected}
        ${read} =         Read Until    terminator=${expected}
        Should Contain    ${read}    ${expected}
        #Log               ${read}    console=yes
        [Return]       ${read}

    Read Temperature
        Write Data  CMD+TEMP
        Write Data  0D 0A  encoding=hexlify
        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

    Read Acceleration
        Write Data  CMD+ACCEL
        Write Data  0D 0A  encoding=hexlify
        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

    Read XAngle
        Write Data  CMD+X
        Write Data  0D 0A  encoding=hexlify
        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

    Read YAngle
        Write Data  CMD+Y
        Write Data  0D 0A  encoding=hexlify
        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

    Read ZAngle
        Write Data  CMD+Z
        Write Data  0D 0A  encoding=hexlify
        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

    Read HeartBeats
        Write Data  CMD+HRTBT
        Write Data  0D 0A  encoding=hexlify
        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

    Set TESTTemperature
        Write Data  CMD+SET+ON
        Write Data  0D 0A  encoding=hexlify

        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

        Write Data  CMD+SET+TEMP+20
        Write Data  0D 0A  encoding=hexlify
        ${read} =    Read Until Single    OK
        @{words} =  Split String    ${read}   + 
        IF   "${words}[0]" == "CMDRESP"
                @{propValues} =  Split String    ${words}[1]   =
                #Log To Console   ${words}[1]
                #Log To Console   ${propValues}[0]
                Log To Console    ${propValues}[1]
        END

    Log ON
        Write Data  CMD+ON
        Write Data  0D 0A  encoding=hexlify

    Log OFF
        Write Data  CMD+OFF
        Write Data  0D 0A  encoding=hexlify

    Log Temperature
        Log ON
        WHILE    True
            ${read} =    Read Until Single    OK
            @{words} =  Split String    ${read}   + 

            IF   "${words}[0]" == "LOG"
                 @{propValues} =  Split String    ${words}[1]   =

                #Log To Console   ${words}[1]
                Log To Console   ${propValues}[0]
                Log To Console   ${propValues}[1] 
            END
        END
        Log OFF


    Run Shell Command
        [Arguments]    ${command}
        Write Data       ${command}\n
        Read Until       terminator=${command}
        ${result} =      Read Until    terminator=${PROMPT}
        @{words} =       Split String From Right     ${result}    \n    max_split=1
        ${stripped} =    Strip String    ${words}[0]
        Log              ${stripped}    console=yes
        [Return]       ${stripped}

    Clear login database
        Remove file    ${DATABASE FILE}

    Create valid user
        [Arguments]    ${username}    ${password}
        Create user    ${username}    ${password}
        Status should be    SUCCESS

    Creating user with invalid password should fail
        [Arguments]    ${password}    ${error}
        Create user    example    ${password}
        Status should be    Creating user failed: ${error}

    Login
        [Arguments]    ${username}    ${password}
        Attempt to login with credentials    ${username}    ${password}
        Status should be    Logged In

    # Keywords below used by higher level tests. Notice how given/when/then/and
    # prefixes can be dropped. And this is a comment.

    A user has a valid account
        Create valid user    ${USERNAME}    ${PASSWORD}

    She changes her password
        Change password    ${USERNAME}    ${PASSWORD}    ${NEW PASSWORD}
        Status should be    SUCCESS

    She can log in with the new password
        Login    ${USERNAME}    ${NEW PASSWORD}

    She cannot use the old password anymore
        Attempt to login with credentials    ${USERNAME}    ${PASSWORD}
        Status should be    Access Denied

    Database Should Contain
        [Arguments]    ${username}    ${password}    ${status}
        ${database} =     Get File    ${DATABASE FILE}
        Should Contain    ${database}    ${username}\t${password}\t${status}\n


.. code:: robotframework

    *** Test Cases ***
    Temperature shall be in range
        [Tags]    sanity    temperature
        Read Temperature

    Check person is running or not
        [Tags]    sanity    acceleration
        Read Acceleration

    Check Person is sleeping
        [Tags]    sanity    sleep
        Read XAngle
        Read YAngle
        Read ZAngle
    
    Check Body temperature is correct
        [Tags]    sanity    heartbeat
        Read Temperature

    Check Body temperature is constant
        [Tags]    sanity    heartbeat
        #Log Temperature
        Set TESTTemperature
        Read Temperature

