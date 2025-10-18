#ifndef QUEUE_LIST_HPP
#define QUEUE_LIST_HPP
#include <nlohmann/json.hpp>
#include <Arduino.h>

using json = nlohmann::json;

struct Node
{
    /**
     * @brief Pointer to the data
     */
    void *data;
    /**
     * @brief Type of the data
     */
    std::string type;
    /**
     * @brief Pointer to the next node
     */
    Node *next;

    /**
     * @brief Constructor
     * @param d Pointer to the data
     * @param t Type of the data
     */
    Node(void *d, const std::string &t) : data(d), type(t), next(nullptr) {}
};

class DataItem
{
public:
    /**
     * @brief Destructor
     */
    virtual ~DataItem() = default;
    /**
     * @brief Convert to json
     * @return Json object
     */
    virtual json to_json() const = 0;
    /**
     * @brief Get the type of the data
     * @return Type of the data
     */
    virtual std::string get_type() const = 0;
};

/**
 * @brief Queue list
 */
class QueueList
{
private:
    /**
     * @brief Pointer to the head of the queue
     */
    Node *head;
    /**
     * @brief Pointer to the tail of the queue
     */
    Node *tail;
    /**
     * @brief Count of the queue
     */
    size_t count;

    /**
     * @brief Clone the data
     * @param item Item to clone
     * @return Cloned item
     */
    template <typename T>
    static T *clone(const T &item)
    {
        return new T(item);
    };

    /**
     * @brief Convert to the data
     * @param ptr Pointer to the data
     * @return Data
     */
    template <typename T>
    static T *as(void *ptr)
    {
        return static_cast<T *>(ptr);
    };

public:
    /**
     * @brief Constructor
     */
    QueueList();
    /**
     * @brief Destructor
     */
    ~QueueList();

    /**
     * @brief Enqueue an item
     * @param item Item to enqueue
     */
    template <typename T>
    void enqueue(const T &item)
    {
        static_assert(std::is_base_of<DataItem, T>::value, "T must derive from DataItem");

        T *data_copy = clone(item);
        std::string type = data_copy->get_type();

        Node *new_node = new Node(static_cast<void *>(data_copy), type);

        if (tail == nullptr)
        {
            head = tail = new_node;
        }
        else
        {
            tail->next = new_node;
            tail = new_node;
        }

        count++;
    };

    /**
     * @brief Check if the queue is empty
     * @return True if the queue is empty, false otherwise
     */
    bool isEmpty() const;

    /**
     * @brief Get the size of the queue
     * @return Size of the queue
     */
    json to_json() const;

    /**
     * @brief Convert to cbor
     * @return Cbor object
     */
    std::vector<uint8_t> to_cbor() const;

    /**
     * @brief Send the queue to a client
     * @param client Client to send the queue to
     * @return True if the queue was sent, false otherwise
     */
    bool send(void *client);

    /**
     * @brief Clear the queue
     */
    void clear();
};

extern QueueList queueList;

#endif
