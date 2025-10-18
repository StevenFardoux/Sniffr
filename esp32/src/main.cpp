#include <Arduino.h>
#include <SIM7080G/Serial.hpp>
#include <SIM7080G/GNSS.hpp>
#include <SIM7080G/CATM1.hpp>
#include <FSM.hpp>
#include <QueueList.hpp>
#include <SIM7080G/TCP.hpp>
#include <Color.hpp>

#define BAUD_RATE 115200

FSM sendFSM;

void setup()
{
  // Initialize pins
  pinMode(PWR_KEY, OUTPUT);

  // Initialize the serial port
  Serial.begin(BAUD_RATE);

  // Set up the state machine
  fsm.name = "Master FSM";
  fsm.debug = true;
  fsm.currentState = AT_FREE;
  fsm.changeStateCondition = []()
  { return Sim7080G.fsm.currentState == AT_FREE; };

  sendFSM.name = "Send FSM";
  sendFSM.debug = true;
  sendFSM.changeStateCondition = []()
  { return queueList.isEmpty() && Sim7080G.fsm.currentState == AT_FREE; };

  // Initialize the SIM7080G serial port
  Sim7080G.begin(SIM7080G_BAUD, SERIAL_8N1, RX0, TX0);
  Sim7080G.flush();
  Sim7080G.setup();
}

void loop()
{
  switch (fsm.currentState)
  {
  case ENTRYPOINT: // Entry point of the FSM
  {
    Sim7080G.powerOn();
    fsm.setState(BasicState::START);
  }
  case START: // Start state of the FSM
  {
    // Serial.println(Sim7080G.send_AT_bloquant("AT+GSN", 300));

    AT_RESPONSE response = Sim7080G.sendATCommand("AT+GSN");

    if (response.isFinished)
    {
      response.message = response.message.substring(response.message.indexOf("\r\n") + 2);
      response.message.trim();
      Sim7080G.imei = response.message.substring(0, 15);

      Serial.printf("IMEI: %s\n", Color::green(Sim7080G.imei));
      Sim7080G.freeATState();

      fsm.setState(BasicState::GET_GNSS_DATA);
      // fsm.setState(BasicState::MODULE_CATM1);
      // GNSSData gnssData;
      // gnssData.latitude = 45.645;
      // gnssData.longitude = 25.645;
      // gnssData.utcDateTime = DateTime(2023, 10, 1, 12, 0, 0, 0);
      // gnssData.gnssRunStatus = true;
      // gnssData.fixStatus = true;
      // queueList.enqueue<GNSSData>(gnssData);
    }
    break;
  }
  case GET_GNSS_DATA:
  {
    if (GNSS.PowerOn())
    {
      GNSSResponse response = GNSS.GetData();

      if (response.isFinished)
      {
        response.free();
        if (response.data.fixStatus && (response.data.hdop >= 0.2 && response.data.hdop <= 10) && response.data.hpa <= 20)
        {
          Serial.printf("%sGNSS Run Status%s: %d\n", Color::_GRAY, Color::_RESET, response.data.gnssRunStatus);
          Serial.printf("%sUTC DateTime%s: %s\n", Color::_GRAY, Color::_RESET, response.data.utcDateTime.toString().c_str());
          Serial.printf("%sLatitude%s: %.6f\n", Color::_GRAY, Color::_RESET, response.data.latitude);
          Serial.printf("%sLongitude%s: %.6f\n", Color::_GRAY, Color::_RESET, response.data.longitude);
          Serial.printf("%sFix Status%s: %d\n", Color::_GRAY, Color::_RESET, response.data.fixStatus);
          queueList.enqueue<GNSSData>(response.data);
          fsm.setState(BasicState::TURN_OFF_GNSS);
        }
      }
    }
    break;
  }
  case GET_BATTERY_STATUS:
  {
    AT_RESPONSE response = Sim7080G.sendATCommand("AT+CBC");
    if (response.isFinished)
    {
      BATTERYData batteryData;
      
      response.message = response.message.substring(response.message.indexOf(",") + 1);
      response.message = response.message.substring(0, response.message.indexOf(","));
      batteryData.batteryLevel = atoi(response.message.c_str());
      Serial.println(response.message);  
      Serial.println(batteryData.batteryLevel);  

      
      Serial.printf("%sBattery status%s: %d%%\n", Color::_GRAY, Color::_RESET, batteryData.batteryLevel);
      
      queueList.enqueue<BATTERYData>(batteryData);
      
      Sim7080G.freeATState();
      fsm.setState(BasicState::PAUSED);
    }
    break;
  }
  case TURN_OFF_GNSS:
  {
    if (GNSS.PowerOff())
    {
      fsm.setState(BasicState::PAUSED);
      // fsm.setState(BasicState::MODULE_CATM1);
    }
    break;
  }
  case MODULE_CATM1:
    CATM1.loop();
    break;

  case MODULE_TCP:
    TCP.loop();
    break;
  case PAUSED:
  {
    static bool init = false;

    if (sendFSM.delay(1000 * 60) && !queueList.isEmpty())
    {
      Serial.println(queueList.to_json().dump().c_str());
      fsm.setState(BasicState::MODULE_CATM1);
      break;
    }

    // Trigger every hours 
    if (fsm.delay(1000 * 60 * 60) || !init) 
    {
      fsm.setState(BasicState::GET_BATTERY_STATUS);
      init = true;
      break;
    }

    if (fsm.delay(1000 * 60))
    {
      fsm.setState(BasicState::GET_GNSS_DATA);
      break;
    }

    break;
  }
  case STOPPED:
  {
    Sim7080G.powerOff();
  }
  case RESTART:
  {
    Sim7080G.powerOff();
    fsm.setState(BasicState::ENTRYPOINT);
  }
  default:
    break;
  }
}
