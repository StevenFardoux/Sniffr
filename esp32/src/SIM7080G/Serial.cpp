#include <SIM7080G/Serial.hpp>

SIM7080GHardwareSerial Sim7080G = *((SIM7080GHardwareSerial *)(&Serial1));

SIM7080GHardwareSerial::SIM7080GHardwareSerial(uint8_t uart_nr) : HardwareSerial(uart_nr)
{
    _uart_nr = uart_nr;
    _uart = NULL;
    _rxBufferSize = 256;
    _txBufferSize = 0;
    _onReceiveCB = NULL;
    _onReceiveErrorCB = NULL;
    _onReceiveTimeout = false;
    _rxTimeout = 2;
    _rxFIFOFull = 0;
    _eventTask = NULL;

#if !CONFIG_DISABLE_HAL_LOCKS
    _lock = NULL;
#endif

#if !CONFIG_DISABLE_HAL_LOCKS
    if (_lock == NULL)
    {
        _lock = xSemaphoreCreateMutex();
        if (_lock == NULL)
        {
            log_e("xSemaphoreCreateMutex failed");
            return;
        }
    }
#endif

    if (uart_nr == 0)
        uartSetPins(0, SOC_RX0, SOC_TX0, -1, -1);
}

SIM7080GHardwareSerial::~SIM7080GHardwareSerial()
{
    end(); // explicit Full UART termination
#if !CONFIG_DISABLE_HAL_LOCKS
    if (_lock != NULL)
    {
        vSemaphoreDelete(_lock);
    }
#endif
};

void SIM7080GHardwareSerial::setup()
{
    fsm.name = "SIM7080G AT";
    fsm.debug = false;
    fsm.currentState = AT_FREE;
    fsm.previousState = AT_FREE;

    timedReadFSM.name = "TimedRead";
    timedReadFSM.debug = false;
    timedReadFSM.currentState = TIMED_READ_INIT;
    timedReadFSM.previousState = TIMED_READ_INIT;

    fsm.changeStateCondition = []()
    {
        return true; // Always return true for now
    };
}

int SIM7080GHardwareSerial::TimedRead()
{
    switch (timedReadFSM.currentState)
    {
    case TIMED_READ_INIT:
        timedReadStartTime = millis();
        timedReadFSM.setState(TIMED_READ_RUNNING);

    case TIMED_READ_RUNNING:
    {
        int c = read();
        if (c >= 0)
        {
            timedReadResult = c;
            timedReadFSM.setState(TIMED_READ_SUCCESS);
            return -1;
        }

        if (millis() - timedReadStartTime >= _timeout)
        {
            timedReadFSM.setState(TIMED_READ_TIMEOUT);
            timedReadResult = -1;
            return -1;
        }
        break;
    }

    case TIMED_READ_TIMEOUT:
        timedReadFSM.setState(TIMED_READ_INIT);
        return -1;

    case TIMED_READ_SUCCESS:
        timedReadFSM.setState(TIMED_READ_INIT);
        return timedReadResult;
    }

    return -1;
}

AT_RESPONSE SIM7080GHardwareSerial::sendATCommand(const char *command, unsigned long timeout)
{
    if (fsm.currentState == AT_FREE)
    {
        response.isFinished = false;
        response.message = "";
        write(command, strlen(command));
        write("\r\n", 2); // Send the command with a newline
        // Serial.println("AT Command sent: " + String(command));

        fsm.setState(AT_BUSY);
    }

    if (fsm.currentState == AT_BUSY)
    {
        if (response.isFinished == false)
        {
            int c = TimedRead();
            if (c >= 0)
            {
                response.message += (char)c;
            }

            if (millis() - fsm.lastUpdate > (timeout == -1 ? 1000 : timeout))
            {
                response.isFinished = true;
            }
        }
    }

    return response;
}

AT_RESPONSE SIM7080GHardwareSerial::sendTCPData(std::vector<std::uint8_t> data)
{
    if (fsm.currentState == AT_FREE)
    {
        response.isFinished = false;
        response.message = "";
        write(data.data(), data.size());
        Serial.println("TCP Data sent: " + String(data.size()) + " bytes");

        fsm.setState(AT_BUSY);
    }

    if (fsm.currentState == AT_BUSY)
    {
        if (response.isFinished == false)
        {
            int c = TimedRead();
            if (c >= 0)
            {
                response.message += (char)c;
            }

            if (millis() - fsm.lastUpdate > 10000)
            {
                response.isFinished = true;
                Serial.println("Response AT: " + response.message);
            }
        }
    }

    return response;
}

void SIM7080GHardwareSerial::freeATState()
{
    fsm.setState(AT_FREE);
}

String SIM7080GHardwareSerial::send_AT_bloquant(String message, int timeout)
{
    uint32_t startTime = millis();
    println(message);
    Serial.printf("AT Command sent: %s\n", message.c_str());

    String response = "";
    while (millis() - startTime < timeout)
    {
        if (timeout == 1000)
        {
            if (response.endsWith("OK\r"))
            {
                break;
            }
        }

        if (available())
        {

            char byte_recv = read();
            response += byte_recv;
        }
    }

#pragma region ANCIEN CODE PAS PROPRE ET PAS OPTI POUR POSTPROCESS LA REPONSE
    response = response.substring(response.indexOf("\r"), response.length());
    response.trim();

    if (timeout == 1000)
    {

        if (response.indexOf("\n") != -1)
        {
            response = response.substring(0, response.length() - 3);
            response.trim();
        }
    }
#pragma endregion

    return response;
}

void SIM7080GHardwareSerial::powerOn()
{
    digitalWrite(PWR_KEY, LOW);
    delay(200);
    digitalWrite(PWR_KEY, OUTPUT_OPEN_DRAIN);
    delay(3000);
}

void SIM7080GHardwareSerial::powerOff()
{
    if (Sim7080G.sendATCommand("AT+CPOWD=1").isFinished)
    {
        Sim7080G.freeATState();
    }
}

void SIM7080GHardwareSerial::hardReset()
{
    digitalWrite(PWR_KEY, LOW);
    delay(15000);
    digitalWrite(PWR_KEY, OUTPUT_OPEN_DRAIN);
    delay(3000);

    Sim7080G.flush();
}

json BATTERYData::to_json() const
{
    return json{
        {"b", batteryLevel}};
}

std::string BATTERYData::get_type() const
{
    return "BATTERY";
}