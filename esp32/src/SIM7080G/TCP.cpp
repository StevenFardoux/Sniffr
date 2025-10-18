#include <SIM7080G/TCP.hpp>

#pragma region TCP
SIM7080GTCP TCP = SIM7080GTCP();

SIM7080GTCP::SIM7080GTCP()
{
    fsmTCP.name = "TCP";
    fsmTCP.debug = true;
    fsmTCP.currentState = TCP_OPEN;
    fsmTCP.previousState = TCP_OPEN;
}

SIM7080GTCP::~SIM7080GTCP()
{
}

void SIM7080GTCP::openSocket()
{
    // Serial.println("open socket");
    // String command = "AT+CAOPEN=0,0,\"TCP\",\"" + String(URL) + "\"," + String(PORT) + "";

    String command = "AT+CAOPEN=0,0,\"TCP\",\"" + String(URL) + "\"," + String(PORT);

    AT_RESPONSE response = Sim7080G.sendATCommand(command.c_str(), 10000);

    if (response.isFinished)
    {
        Sim7080G.freeATState();
        Serial.println("socket opened : " + response.message);
        if (response.message.indexOf("+CAOPEN: 0,0") != -1)
        {
            fsmTCP.setState(TCP_SEND);
            return;
        }
        else
        {
            Serial.println("Error opening socket: " + response.message);
            fsmTCP.setState(TCP_CLOSE);
            return;
        }
    }
}

void SIM7080GTCP::sendData()
{
    std::vector<std::uint8_t> cborData = queueList.to_cbor();
    // static String message = "";

    if (fsmTCP.currentState == TCP_SEND)
    {
        // Initial state, start with sending size
        // message = "";
        // for (std::uint8_t i : cborData)
        // {
        //     message += (char)i;
        // }

        fsmTCP.setState(TCP_SEND_SIZE);
        return;
    }

    if (fsmTCP.currentState == TCP_SEND_SIZE)
    {
        String sizeCommand = "AT+CASEND=0," + String(cborData.size());
        AT_RESPONSE response = Sim7080G.sendATCommand(sizeCommand.c_str());

        if (response.isFinished)
        {
            Serial.println("Size sent: " + response.message);
            Sim7080G.freeATState();
            if (!response.message.isEmpty())
            {
                fsmTCP.setState(TCP_SEND_DATA);
            }
        }
    }
    else if (fsmTCP.currentState == TCP_SEND_DATA)
    {
        AT_RESPONSE response = Sim7080G.sendTCPData(cborData);

        if (response.isFinished)
        {
            queueList.clear();

            for (std::uint8_t i : cborData)
            {
                Serial.printf("%02X ", i);
            }
            Serial.println();

            Serial.println("Data sent: " + response.message);
            Sim7080G.freeATState();
            fsmTCP.setState(TCP_CLOSE);
        }
    }
}

void SIM7080GTCP::closeSocket()
{
    // Serial.println("close socket");
    AT_RESPONSE response = Sim7080G.sendATCommand("AT+CACLOSE=0");

    if (response.isFinished)
    {
        Serial.println("socket closed : " + response.message);

        Sim7080G.freeATState();
        if (!response.message.isEmpty())
        {
            fsmTCP.setState(TCP_OPEN);
            fsm.setState(BasicState::PAUSED);
        }
    }
}

void SIM7080GTCP::loop()
{
    switch (fsmTCP.currentState)
    {
    case TCP_OPEN:
        openSocket();
        break;
    case TCP_CLOSE:
        closeSocket();
        break;
    case TCP_SEND:
    case TCP_SEND_SIZE:
    case TCP_SEND_DATA:
        sendData();
        break;
    }
}