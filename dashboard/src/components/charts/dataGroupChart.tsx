import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Chart from "react-apexcharts";

/**
 * Response interface for data per groups API endpoint
 */
interface DataGroupResponse {
    return: {
        groups: {
            name: string;
            data: number;
        }[];
        date: string;
    }[];
}

/**
 * DataGroupChart component that displays a bar chart showing data count per group over time
 * @returns {JSX.Element | null} The chart component or null if data is not available
 */
const DataGroupChart = () => {
    const [data, setData] = useState<DataGroupResponse | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const d = await axios.get<DataGroupResponse>("http://localhost:3001/dataPerGroups",
                    { withCredentials: true }
                );
                setData(d.data);
            } catch (error) {
                console.error("Failed to fetch data per groups:", error);
                setData(null);
            }
        };
        fetchData();
    }, []);

    /**
     * Chart configuration options
     */
    const options = useMemo(() => {
        if (!data?.return) return null;
        
        return {
            chart: {
                id: 'data-group'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 5,
                },
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            xaxis: {
                categories: data.return.map(item => item.date)
            },            yaxis: {
                title: {
                    text: 'Nombre de données par groupe'
                }
            }
        };
    }, [data]);

    /**
     * Chart series data - transforms grouped data into chart format
     */
    const series = useMemo(() => {
        if (!data?.return) return null;
        
        const groupData: { [key: string]: number[] } = {};
        
        data.return.forEach((item, index) => {
            item.groups.forEach(group => {
                if (!groupData[group.name]) {
                    groupData[group.name] = new Array(data.return.length).fill(0);
                }
                groupData[group.name][index] = group.data;
            });
        });
        
        return Object.entries(groupData).map(([name, data]) => ({
            name,
            data
        }));
    }, [data]);

    if (!options || !series) return null;

    return (
        <Chart
            options={options}
            series={series}
            type="bar"
            width="100%"
        />
    );
};

export default DataGroupChart;