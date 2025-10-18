#include <SIM7080G/GNSS.hpp>

#pragma region GNSS
SIM7080GGNSS GNSS = SIM7080GGNSS();

SIM7080GGNSS::SIM7080GGNSS()
{
    fsmPower.name = "GNSS";
    fsmPower.debug = true;
    fsmPower.currentState = GNSS_OFF;
    fsmPower.previousState = GNSS_OFF;
}

SIM7080GGNSS::~SIM7080GGNSS()
{
}

bool SIM7080GGNSS::PowerOn()
{
    if (fsmPower.currentState == GNSS_OFF)
    {
        AT_RESPONSE response = Sim7080G.sendATCommand("AT+CGNSPWR=1;+CGNSMOD=1,0,0,1,0", 2000);

        if (response.isFinished)
        {
            fsmPower.setState(GNSS_ON);
            Sim7080G.freeATState();
        }
    }

    return fsmPower.currentState == GNSS_ON;
}

bool SIM7080GGNSS::PowerOff()
{
    if (fsmPower.currentState == GNSS_ON)
    {
        AT_RESPONSE response = Sim7080G.sendATCommand("AT+CGNSPWR=0", 2000);

        if (response.isFinished)
        {
            fsmPower.setState(GNSS_OFF);
            Sim7080G.freeATState();
        }
        // Serial.println("CGNSMOD ==========================");
        // Serial.println(Sim7080G.send_AT_bloquant("AT+CGNSMOD=1,1,0,0,0", 2000));
        // Serial.println("CGNSPWR ==========================");
        // Serial.println(Sim7080G.send_AT_bloquant("AT+CGNSPWR=0", 2000));
    }

    return fsmPower.currentState == GNSS_OFF;
}

GNSSResponse SIM7080GGNSS::GetData()
{
    if (fsmPower.currentState == GNSS_ON)
    {
        AT_RESPONSE response = Sim7080G.sendATCommand("AT+CGNSINF", 2000);

        if (response.isFinished)
        {
            GNSSResponse gnssResponse;
            gnssResponse.isFinished = true;

            Serial.println(response.message);

            response.message = response.message.substring(response.message.indexOf(": ") + 2);

            gnssResponse.data.gnssRunStatus = strcmp(response.message.substring(0, 1).c_str(), "1") == 0;
            response.message = response.message.substring(response.message.indexOf(",") + 1);
            gnssResponse.data.fixStatus = strcmp(response.message.substring(0, 1).c_str(), "1") == 0;
            response.message = response.message.substring(response.message.indexOf(",") + 1);
            gnssResponse.data.utcDateTime = DateTime(response.message.substring(0, response.message.indexOf(",")));
            response.message = response.message.substring(response.message.indexOf(",") + 1);
            gnssResponse.data.latitude = response.message.substring(0, response.message.indexOf(",")).toFloat();
            response.message = response.message.substring(response.message.indexOf(",") + 1);
            gnssResponse.data.longitude = response.message.substring(0, response.message.indexOf(",")).toFloat();
            response.message = response.message.substring(response.message.indexOf(",") + 1);

            // Sauter les champs inutiles jusqu'à HDOP (8 champs à sauter)
            for (int i = 0; i < 5; ++i) {
                response.message = response.message.substring(response.message.indexOf(",") + 1);
            }

            // HDOP
            gnssResponse.data.hdop = response.message.substring(0, response.message.indexOf(",")).toFloat();
            response.message = response.message.substring(response.message.indexOf(",") + 1);

            // Sauter PDOP et VDOP (2 champs)
            for (int i = 0; i < 2; ++i) {
                response.message = response.message.substring(response.message.indexOf(",") + 1);
            }

            // Sauter jusqu'à HPA (8 champs à sauter)
            for (int i = 0; i < 8; ++i) {
                response.message = response.message.substring(response.message.indexOf(",") + 1);
            }

            // HPA
            gnssResponse.data.hpa = response.message.substring(0, response.message.indexOf(",")).toFloat();

            if (fsmGetPosition.currentState == GNSS_POSITION_FREE)
            {
                Sim7080G.freeATState();
            }

            return gnssResponse;
        }
        else
        {
            fsmGetPosition.setState(GNSS_POSITION_BUSY);
        }
    }

    return {};
}

void SIM7080GGNSS::freeData()
{
    fsmGetPosition.setState(GNSS_POSITION_FREE);
    Sim7080G.freeATState();
}

json GNSSData::to_json() const
{
    return json{
        {"t", utcDateTime.toUnixTime()},
        {"la", latitude},
        {"lo", longitude},
        {"hdop", hdop},
        {"hpa", hpa}
    };
}

std::string GNSSData::get_type() const
{
    return "GNSS";
}
#pragma endregion GNSS

#pragma region DateTime
DateTime::DateTime(String value)
{
    if (!value || value.length() == 0)
    {
        this->year = 0;
        this->month = 0;
        this->day = 0;
        this->hour = 0;
        this->minute = 0;
        this->second = 0;
        this->millisecond = 0;
        return;
    }

    this->year = atoi(value.substring(0, 4).c_str());
    value = value.substring(4);
    this->month = atoi(value.substring(0, 2).c_str());
    value = value.substring(2);
    this->day = atoi(value.substring(0, 2).c_str());
    value = value.substring(2);
    this->hour = atoi(value.substring(0, 2).c_str());
    value = value.substring(2);
    this->minute = atoi(value.substring(0, 2).c_str());
    value = value.substring(2);
    this->second = atoi(value.substring(0, 2).c_str());
    value = value.substring(2);
}

long long DateTime::toUnixTime() const
{
    struct tm t;
    t.tm_year = year - 1900;
    t.tm_mon = month - 1;
    t.tm_mday = day;
    t.tm_hour = hour;
    t.tm_min = minute;
    t.tm_sec = second;

    return mktime(&t);
}

String DateTime::toString()
{
    return String(year) + "-" + String(month) + "-" + String(day) + " " + String(hour) + ":" + String(minute) + ":" + String(second) + "." + String(millisecond) + " (Unix Time: " + String(toUnixTime()) + ")";
};
#pragma endregion DateTime
