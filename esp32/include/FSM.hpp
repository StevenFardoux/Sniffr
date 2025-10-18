#pragma once
#ifndef FSM_H
#define FSM_H
#include <Arduino.h>
// #include <SIM7080G/Serial.hpp>

/**
 * @brief Basic State Machine
 */
enum BasicState
{
    ENTRYPOINT,
    START,
    IDLE,

    GET_GNSS_DATA,
    TURN_OFF_GNSS,

    GET_BATTERY_STATUS,
    
    MODULE_CATM1,

    MODULE_TCP,

    GET_BATTERY_DATA,
    PAUSED,
    STOPPED,
    RESTART,
};

/**
 * @brief State Machine
 *
 * @details This is a simple state machine implementation that allows for state transitions based on conditions.
 */
struct FSM
{
    /**
     * @brief Name of the FSM
     *
     * @details This is the name of the FSM. It is used for debugging purposes.
     */
    const char *name = "FSM"; // Name of the FSM

    /**
     * @brief Current state of the FSM
     */
    unsigned char currentState = 0;

    /**
     * @brief Previous state of the FSM
     */
    unsigned char previousState = 0;

    /**
     * @brief Debug flag
     *
     * @details This flag is used to enable or disable debug messages.
     */
    bool debug = false;

    /**
     * @brief Delay flag
     *
     * @details This flag is used to determine if the FSM is in a delay state.
     */
    bool inDelay = false;

    /**
     * @brief Timer for the FSM
     *
     * @details This timer is used for delay without blocking the main loop.
     */
    int timer = 0;

    /**
     * @brief Last update time
     *
     * @details This variable stores the last update time of the FSM.
     */
    int lastUpdate = 0;

    /**
     * @brief Function pointer for the condition to change state
     *
     * @details This function should return true if the state can be changed, false otherwise.
     */
    bool (*changeStateCondition)() = []()
    { return true; }; // Default condition function

    /**
     * @brief Set the state of the FSM
     *
     * @param newState The new state to set
     *
     * @details This function sets the new state of the FSM. It checks if the condition to change state is met before changing the state.
     */
    void setState(unsigned char newState);

    /**
     * @brief Delay function for the FSM
     *
     * @param delayTime The time to delay in milliseconds
     *
     * @details This function is used to delay the FSM without blocking the main loop.
     */
    bool delay(int delayTime);

    /**
     * @brief Check if the FSM is out of delay
     *
     * @param delayTime The time to check if the FSM is out of delay in milliseconds
     *
     * @return true if the FSM is out of delay, false otherwise
     */
    bool isOutOfDelay(int delayTime);

    /**
     * @brief Reset timer
     */
    void resetTimer();
};

extern FSM fsm;

#endif // FSM_H