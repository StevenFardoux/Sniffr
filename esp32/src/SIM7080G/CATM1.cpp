#include <SIM7080G/CATM1.hpp>

#pragma region CATM1
SIM7080GCATM1 CATM1 = SIM7080GCATM1();

SIM7080GCATM1::SIM7080GCATM1()
{
    fsmCATM1.name = "CATM1";
    fsmCATM1.debug = true;
    fsmCATM1.currentState = CATM1_ON;
    fsmCATM1.previousState = CATM1_ON;
}

SIM7080GCATM1::~SIM7080GCATM1()
{
}

void SIM7080GCATM1::powerOn()
{
    AT_RESPONSE response = Sim7080G.sendATCommand("AT+CNMP=38;+CMNB=1;+CNACT=0,0;+CGDCONT=1,\"IP\",\"iot.1nce.net\";+CNCFG=0,1,iot.1nce.net");

    if (response.isFinished)
    {
        Serial.println(response.message);
        fsmCATM1.setState(PDP);
        Sim7080G.freeATState();
    }
}

void SIM7080GCATM1::powerOff()
{
    Serial.println("Powering off CATM1");
    AT_RESPONSE response = Sim7080G.sendATCommand("AT+CNACT=0,0");

    if (response.isFinished)
    {
        fsmCATM1.setState(CATM1_ON);
        fsm.setState(MODULE_TCP);
        Sim7080G.freeATState();
    }
}

void SIM7080GCATM1::pdp()
{
    AT_RESPONSE response = Sim7080G.sendATCommand("AT+CNACT=0,1", 15000);

    if (response.isFinished)
    {
        Sim7080G.freeATState();
        if (response.message.indexOf("ERROR") != -1)
        {
            Serial.println("[x] PDP context error");
        }
        else if (response.message.indexOf("DEACTIVE") != -1)
        {
            Serial.println("[x] PDP context is not active");
        }
        else if (response.message.indexOf("ACTIVE") != -1)
        {
            Serial.println("[+] PDP context is active");
            fsmCATM1.setState(CEREG);
        }
        else
        {
            Serial.println("[!] PDP context not detected!");
        }
    }
}

void SIM7080GCATM1::cereg()
{
    if (fsmCATM1.isOutOfDelay(2000))
    {
        AT_RESPONSE response = Sim7080G.sendATCommand("AT+CEREG?");
        // AT+CEREG?
        if (response.isFinished)
        {
            // Serial.println("Raw msg : " + response.message);

            response.message = response.message.substring(response.message.indexOf(",") + 1);
            response.message = response.message.substring(0, response.message.indexOf("\n"));

            response.message.trim();

            // Serial.println(response.message);

            Sim7080G.freeATState();

            if (atoi(response.message.c_str()) == 5)
            {
                Serial.println("[+] Cereg OK");

                // fsm.setState(PAUSED);
                fsmCATM1.setState(IP);
                fsmCATM1.resetTimer();
            }
            else
            {
                Serial.println("[!] Cereg not ok : " + response.message);
    
                int delay = 0;
                switch (atoi(response.message.c_str()))
                {
                case 0:
                    delay = 7000;
                    break;
                case 2:
                    delay = 242000;
                case 3:
                    delay = 22000;
                    break;

                default:
                    break;
                }

                if (fsmCATM1.isOutOfDelay(delay))
                {
                    fsmCATM1.resetTimer();
                    // Serial.println("Reset");
                    fsmCATM1.setState(CATM1_ON);
                    fsm.setState(RESTART);
                }
            }
        }
    }
}

void SIM7080GCATM1::getIp()
{
    if (fsmCATM1.isOutOfDelay(2000))
    {
        AT_RESPONSE response = Sim7080G.sendATCommand("AT+CNACT?");

        if (response.isFinished)
        {
            String fullResponse = response.message;
            // Serial.println("res ip : " + response.message);
            response.message = response.message.substring(response.message.indexOf(",") + 1);
            response.message = response.message.substring(response.message.indexOf(",") + 1);
            response.message = response.message.substring(0, response.message.indexOf("\n"));
            response.message = response.message.substring(response.message.indexOf("\"") + 1);
            response.message = response.message.substring(0, response.message.indexOf("."));
            // Serial.println("substring : " + response.message);

            Sim7080G.freeATState();
            fsmCATM1.resetTimer();

            if (response.message != "0")
            {
                Serial.println("IP : " + fullResponse);
                fsm.setState(MODULE_TCP);
                // fsmCATM1.setState(CATM1_ON);
            }
        }
    }
}

void SIM7080GCATM1::loop()
{
    switch (fsmCATM1.currentState)
    {
    case CATM1_ON:
        powerOn();
        fsmCATM1.resetTimer();
        fsmCATM1.timer = millis() - 1000;

        break;
    case PDP:
        pdp();
        break;
    case CEREG:
    {
        cereg();

        break;
    }
    case IP:
    {
        getIp();
        break;
    }
    case CATM1_OFF:
        powerOff();
        break;

    default:
        break;
    }
}