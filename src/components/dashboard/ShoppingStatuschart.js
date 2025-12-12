import React, { useState } from 'react';
import Chart from 'react-apexcharts';

function ShoppingStatuschart() {
    //eslint-disable-next-line
    const [options, setOptions] = useState({
        chart: {
            type: 'line',
            toolbar: {
                show: false,
            }
        },

        stroke: {
            width: 2,
            curve: 'smooth',

        },
        xaxis: {
            categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        },
        markers: {
            size: 4,
            colors: ["#FFA41B"],
            strokeColors: "#ffffff",
            hover: {
                size: 7,
            }
        },

        yaxis: {
            show: false,
            min: -10,
            max: 50,
        },
        legend: {
            position: 'top', // top, bottom
            horizontalAlign: 'right', // left, right
        }
    })
    //eslint-disable-next-line
    const [series, setseries] = useState([{
        name: 'User Retention',
        data: [15, 19, 11, 17, 21, 18, 20],
    }])
    return (
        <div className="card mb-3">
            <div className="card-header py-3 d-flex justify-content-between align-items-center bg-transparent border-bottom-0">
                <h6 className="m-0 fw-bold">User Retention</h6>
            </div>
            <div className="card-body" style={{ position: 'relative' }}>
                <Chart
                    options={options}
                    series={series}
                    width='100%'
                    height={300}
                />
            </div>
        </div>
    )
}

export default ShoppingStatuschart;