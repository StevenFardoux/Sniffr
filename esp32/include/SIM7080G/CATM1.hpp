#pragma once
#ifndef SIM7080G_CATM1_H
#define SIM7080G_CATM1_H
#include <SIM7080G/Serial.hpp>
#include <QueueList.hpp>

enum CATM1State
{
    CATM1_OFF,
    CATM1_ON,

    PDP,
    CEREG,
    IP,
    // CATM1_INFO,
};

class SIM7080GCATM1
{
private:
public:
    /**
     * @brief Default construcor
     */
    SIM7080GCATM1();

    /**
     * @brief Destructor
     */
    ~SIM7080GCATM1();

    /** 
    * @brief FSM for CATM1 (4G connection)
    */
    FSM fsmCATM1;

    /**
     * @brief Power on CATM1
     * 
     */
    void powerOn();

    /**
     * @brief Power off CATM1
     * 
     */
    void powerOff();

    /**
     * @brief Setup PDP context
     */
    void pdp();

    /**
     * @brief Get CEREG
     */
    void cereg();

    /**
     * @brief Get IP
     */
    void getIp();

    /**
     * @brief Loop of the CATM1 State Machine
     */
    void loop();
};

extern SIM7080GCATM1 CATM1;

#endif
