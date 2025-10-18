#pragma once
#ifndef SIM7080G_SERIAL_H
#define SIM7080G_SERIAL_H
#include <Arduino.h>
#include <FSM.hpp>
#include <nlohmann/json.hpp>
#include <QueueList.hpp>
using json = nlohmann::json;

#define SIM7080G_BAUD 57600
#define PWR_KEY 7
#define RX0 20
#define TX0 21

/**
 * @brief AT command response
 *
 * This struct is used to store the response of an AT command.
 */
struct AT_RESPONSE
{
    String message;
    bool isFinished;
};

/**
 * @brief Finite State Machine (FSM) states for AT commands
 *
 * This enum is used to define the states of the FSM for AT commands.
 */
enum AT_COMMAND
{
    AT_FREE,
    AT_BUSY
};

/**
 * @brief States for TimedRead FSM
 */
enum TimedReadState
{
    TIMED_READ_INIT,
    TIMED_READ_RUNNING,
    TIMED_READ_TIMEOUT,
    TIMED_READ_SUCCESS
};


struct BATTERYData : public DataItem
{
    /**
     * @brief Battery level 
     */
    uint8_t batteryLevel;

    /**
     * @brief Convert to JSON
     *
     * @return The JSON
     */
    json to_json() const override;

    /**
     * @brief Get the type
     *
     * @return The type
     */
    std::string get_type() const override;
};

/**
 * @brief HardwareSerial class for IoT devices
 *
 * This class is used to create a serial port for IoT devices.
 * It is defined as a global variable so that it can be accessed from anywhere in the code.
 */
class SIM7080GHardwareSerial : public HardwareSerial
{
public:
    SIM7080GHardwareSerial(uint8_t uart_nr);
    ~SIM7080GHardwareSerial();

    /**
     * @brief Finite State Machine (FSM) for AT commands
     *
     * This struct is used to store the state of the FSM for AT commands.
     */
    FSM fsm;

    /**
     * @brief Finite State Machine (FSM) for TimedRead
     *
     * This struct is used to store the state of the FSM for TimedRead.
     */
    FSM timedReadFSM;

    /**
     * @brief AT command response
     *
     * This struct is used to store the response of an AT command.
     */
    AT_RESPONSE response;

    /**
     * @brief Result of the last TimedRead operation
     */
    int timedReadResult = -1;

    /**
     * @brief Start time of the last TimedRead operation
     */
    unsigned long timedReadStartTime = 0;

    /**
     * @brief IMEI of the IoT device
     */
    String imei;

    /**
     * @brief Setup function
     *
     * This function is used to set some variables.
     */
    void setup();

    /**
     * @brief Send AT command
     *
     * This function is used to send an AT command to the IoT device.
     * DO NOT CALL INSIDE DELAY() FUNCTION
     *
     * @param command AT command to be sent
     * @param timeout Timeout in milliseconds
     * @return AT_RESPONSE Response of the AT command
     */
    AT_RESPONSE sendATCommand(const char *command, unsigned long timeout = 1000);

    /**
     * @brief Send TCP Data
     *
     * This fuction is used to send data to this TCP server.
     * DO NOT CALL INSIDE DELAY() FUNCTION
     */
    AT_RESPONSE sendTCPData(std::vector<std::uint8_t> data);
    /**
     * @brief Free the AT command state
     *
     * This function is used to reset the state of the FSM for AT commands.
     * Most of the time called when you've fully processed the response.
     */
    void freeATState();

    /**
     * @brief Read from the serial port with timeout
     *
     * This function is used to read from the serial port with a timeout.
     *
     * @return int Character read from the serial port
     */
    int TimedRead();

    /**
     * @brief Send AT command without FSM architecture
     *
     * This function is used to send an AT command to the IoT device without using the FSM architecture.
     * Should not be called except for debugging purposes.
     *
     * @param message AT command to be sent
     * @param timeout Timeout in milliseconds
     * @return String Response of the AT command
     */
    String send_AT_bloquant(String message, int timeout);

    void powerOn();

    void powerOff();

    void hardReset();
};

/**
 * @brief Serial port for SIM7080G
 *
 * This is the serial port used to communicate with the SIM7080G module.
 * It is defined as a global variable so that it can be accessed from anywhere in the code.
 */
extern SIM7080GHardwareSerial Sim7080G;

#endif // SIM7080G_SERIAL_H
