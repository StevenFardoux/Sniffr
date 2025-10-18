#include <FSM.hpp>

void FSM::setState(unsigned char newState)
{
    if (this->changeStateCondition != nullptr)
        if (!this->changeStateCondition())
        {
            // if (debug)
            //     Serial.printf("[%s] State change condition not met\n", name);
            return;
        }

    if (newState != currentState)
    {
        if (debug)
            Serial.printf("[%s] changed from '%d' to '%d'\n", name, currentState, newState);
        lastUpdate = millis();
    }

    previousState = currentState;
    currentState = newState;
}

bool FSM::delay(int delayTime)
{
    if (timer == 0)
    {
        timer = millis();
        inDelay = true;
        return false;
    }

    if (millis() - timer >= delayTime)
    {
        timer = 0;
        inDelay = false;
        return true;
    }

    return false;
}

bool FSM::isOutOfDelay(int delayTime)
{
    return millis() - timer >= delayTime;
}

void FSM::resetTimer()
{
    timer = millis();
    inDelay = false;
}

FSM fsm;