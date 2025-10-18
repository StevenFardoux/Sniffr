#pragma once
#ifndef SIM7080G_TCP_H
#define SIM7080G_TCP_H
#include <SIM7080G/Serial.hpp>
#include <QueueList.hpp>

enum TCPState
{
    TCP_OPEN,
    TCP_CLOSE,
    TCP_SEND,
    TCP_SEND_SIZE,
    TCP_SEND_DATA,
};

class SIM7080GTCP
{
private:
public:
    /**
     * @brief Default constructor
     */
    SIM7080GTCP();

    /**
     * @brief Destructor
     */
    ~SIM7080GTCP();

    /**
     * @brief FSM for TCP
     */
    FSM fsmTCP;

    /**
     * @brief Open socket
     */
    void openSocket();

    /**
     * @brief Close socket
     */
    void closeSocket();

    /**
     * @brief Send data
     */
    void sendData();

    /**
     * @brief Loop of the TCP State Machine
     */
    void loop();

    /**
     * @brief Url to the TCP server
     */
    const char *URL = "2.tcp.eu.ngrok.io";

    /**
     * @brief Port to the TCP server
     */
    const int PORT = 12596;

    /**
     * @brief Token to the TCP server
     */
    const char *TOKEN = "";
};

extern SIM7080GTCP TCP;

#endif