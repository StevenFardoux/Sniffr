#ifndef SIM7080G_GNSS_H
#define SIM7080G_GNSS_H
#include <SIM7080G/Serial.hpp>
#include <QueueList.hpp>

/**
 * @brief GNSS response
 *
 * @details This struct is used to store the GNSS response.
 */
struct GNSSResponse;

/**
 * @brief GNSS state
 */
enum GNSSState
{
    GNSS_OFF,
    GNSS_ON,
    GNSS_GET_POSITION,
};

/**
 * @brief GNSS position state
 */
enum GNSSPositionState
{
    GNSS_POSITION_FREE,
    GNSS_POSITION_BUSY
};

/**
 * @brief DateTime
 *
 * @details This class is used to store the date and time.
 */
class DateTime
{
public:
    short year;
    uint8_t month;
    uint8_t day;
    uint8_t hour;
    uint8_t minute;
    uint8_t second;
    unsigned short millisecond;

    /**
     * @brief Default constructor
     */
    DateTime() : year(0), month(0), day(0), hour(0), minute(0), second(0), millisecond(0) {}

    /**
     * @brief Constructor with parameters
     */
    DateTime(short year, uint8_t month, uint8_t day, uint8_t hour, uint8_t minute, uint8_t second, unsigned short millisecond) : year(year), month(month), day(day), hour(hour), minute(minute), second(second), millisecond(millisecond) {}

    /**
     * @brief Constructor with AT+CGNSINF response time string
     */
    DateTime(String value);

    /**
     * @brief Destructor
     */
    ~DateTime() {}

    /**
     * @brief Convert to Unix time
     *
     * @return The Unix time
     */
    long long int toUnixTime() const;

    /**
     * @brief Convert to String
     *
     * @return The String
     */
    String toString();
};

/**
 * @brief GNSS data
 *
 * @details This class is used to store the GNSS data.
 */
struct GNSSData : public DataItem
{
    /**
     * @brief GNSS run status
     */
    bool gnssRunStatus;

    /**
     * @brief Fix status
     */
    bool fixStatus;

    /**
     * @brief UTC date and time
     */
    DateTime utcDateTime;

    /**
     * @brief Latitude
     */
    float latitude;

    /**
     * @brief Longitude
     */
    float longitude;

    /**
     * @brief HDOP
     */
    float hdop;

    /**
     * @brief VPA
     */
    float hpa;

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
 * @brief SIM7080G GNSS
 *
 * @details This class is used to control the GNSS.
 */
class SIM7080GGNSS
{
private:
public:
    /**
     * @brief Default constructor
     */
    SIM7080GGNSS();

    /**
     * @brief Destructor
     */
    ~SIM7080GGNSS();

    /**
     * @brief FSM for power
     */
    FSM fsmPower;

    /**
     * @brief FSM for get position
     */
    FSM fsmGetPosition;

    /**
     * @brief Power on
     *
     * @return True if the power is on, false otherwise
     */
    bool PowerOn();

    /**
     * @brief Power off
     *
     * @return True if the power is off, false otherwise
     */
    bool PowerOff();

    /**
     * @brief Get data
     *
     * @return The GNSS response
     */
    GNSSResponse GetData();

    /**
     * @brief Free data
     */
    void freeData();
};

extern SIM7080GGNSS GNSS;

/**
 * @brief GNSS response
 *
 * @details This struct is used to store the GNSS response.
 */
struct GNSSResponse
{
    /**
     * @brief True if the data is finished, false otherwise
     */
    bool isFinished;

    /**
     * @brief The GNSS data
     */
    GNSSData data;

    /**
     * @brief Free the data
     */
    void (*free)() = []()
    { GNSS.freeData(); };
};

#endif // SIM7080G_GNSS_H