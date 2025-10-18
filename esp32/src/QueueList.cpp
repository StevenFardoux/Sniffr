#include <QueueList.hpp>
#include <SIM7080G/Serial.hpp>

QueueList queueList = QueueList();

QueueList::QueueList() : head(nullptr), tail(nullptr), count(0) {}

QueueList::~QueueList()
{
    clear();
}

bool QueueList::isEmpty() const
{
    return head == nullptr;
}

json QueueList::to_json() const
{
    json dataArray = json::array();

    Node *current = head;
    while (current != nullptr)
    {
        DataItem *item = static_cast<DataItem *>(current->data);
        json dataItem = {
            {"t", current->type},
            {"d", item->to_json()}};
        dataArray.push_back(dataItem);
        current = current->next;
    }

    json result = {
        {"t", static_cast<long>(std::time(nullptr))},
        {"c", count},
        {"it", dataArray},
        {"i", Sim7080G.imei.c_str()},
    };

    return result;
}

std::vector<uint8_t> QueueList::to_cbor() const
{
    json j = to_json();
    return json::to_cbor(j);
}

bool QueueList::send(void *client)
{
    auto cbor_data = to_cbor();

    /* To edit in the future to send the data to the server */
    Serial.printf("Contenu CBOR (%d bytes): ", cbor_data.size());
    for (auto &byte : cbor_data)
    {
        Serial.printf("0x%02X ", byte);
    }
    Serial.println();

    return true;
}

void QueueList::clear()
{
    Node *current = head;
    while (current != nullptr)
    {
        Node *temp = current;
        current = current->next;

        if (temp->data != nullptr)
        {
            delete static_cast<DataItem *>(temp->data);
            temp->data = nullptr;
        }

        delete temp;
    }

    head = tail = nullptr;
    count = 0;
}