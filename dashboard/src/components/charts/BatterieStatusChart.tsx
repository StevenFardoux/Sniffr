import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Chart from "react-apexcharts";

/**
 * Response interface for battery history API endpoint
 */
interface BatteryHistoryResponse {
    return: {
        devices: {
            name: string;
            battery: number;
        }[];
        date: string;
    }[];
}

/**
 * BatterieStatusChart component that displays an area chart showing battery levels per device over time
 * @returns {JSX.Element | null} The chart component or null if data is not available
 */
const BatterieStatusChart = () => {
    const [data, setData] = useState<BatteryHistoryResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const d = await axios.get<BatteryHistoryResponse>("http://localhost:3001/batteryHistory",
                    { withCredentials: true }
                );
                console.log(d.data);
                setData(d.data);
            } catch (error) {
                console.error("Failed to fetch battery history:", error);
                setData(null);
            }
        };
        fetchData();
    }, []);

    /**
     * Chart configuration options
     */
    const options = useMemo(() => {
        console.log("test", data?.return);
        if (!data?.return) return {};
        
        return {
            chart: {
                id: 'battery-history',
            },
            stroke: {
                curve: 'smooth' as const,
                width: 2
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                categories: data.return.map(item => item.date),
                labels: {
                    show: false
                }
            },
            yaxis: {
                title: {
                    text: 'Niveau de batterie (%)'
                },
                min: 0,
                max: 100
            },
            tooltip: {
                y: {
                    formatter: function(value: number) {
                        return value + "%";
                    }
                }
            }
        };
    }, [data]);

    /**
     * Chart series data - transforms device battery data into chart format
     */
    const series = useMemo(() => {
        if (!data?.return) return null;
        
        const deviceData: { [key: string]: number[] } = {};
        
        data.return.forEach((item, index) => {
            item.devices.forEach(device => {
                if (!deviceData[device.name]) {
                    deviceData[device.name] = new Array(data.return.length).fill(0);
                }
                deviceData[device.name][index] = device.battery;
            });
        });
        
        return Object.entries(deviceData).map(([name, data]) => ({
            name,
            data
        }));
    }, [data]);

    if (!options || !series) return null;

    return (
        <Chart
            options={options}
            series={series}
            type="area"
            width="100%"
        />
    );
};

export default BatterieStatusChart;

