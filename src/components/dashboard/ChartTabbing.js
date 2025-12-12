import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { Col, Nav, Row, Tab } from "react-bootstrap";


function ChartTabbing() {

    const [options, setOptions] = useState({
        chart: {
            type: 'bar',
            height: 300,
            stacked: true,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: true
            }
        },

        xaxis: {
            categories: ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        },
        legend: {
            position: 'top', // top, bottom
            horizontalAlign: 'right', // left, right
        },
        dataLabels: {
            enabled: false,
        },
        colors: ['var(--chart-color1)'],
    })
    //eslint-disable-next-line
    const [series, setSeries] = useState([{
        name: 'Ui/Ux Designer',
        data: [45, 25, 44, 23, 25, 41, 32, 25, 22, 65, 22, 29]
    },
        // {
        //     name: 'App Development',
        //     data: [45, 12, 25, 22, 19, 22, 29, 23, 23, 25, 41, 32]
        // }, {
        //     name: 'Quality Assurance',
        //     data: [45, 25, 32, 25, 22, 65, 44, 23, 25, 41, 22, 29]
        // }, {
        //     name: 'Web Developer',
        //     data: [32, 25, 22, 11, 22, 29, 16, 25, 9, 23, 25, 13]
        // }
    ])

    const [options1, setOptions1] = useState({
        chart: {
            type: 'bar',
            height: 300,
            stacked: true,
            toolbar: {
                show: false
            },
            zoom: {
                enabled: true
            }
        },

        xaxis: {
            categories: ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
        },
        legend: {
            position: 'top', // top, bottom
            horizontalAlign: 'right', // left, right
        },
        dataLabels: {
            enabled: false,
        },
        colors: ['var(--chart-color3)'],
    })
    //eslint-disable-next-line
    const [series1, setSeries1] = useState([{
        name: 'Ui/Ux Designer',
        data: [45, 25, 44, 23, 25, 41, 32, 25, 22, 65, 22, 29]
    },
        // {
        //     name: 'App Development',
        //     data: [45, 12, 25, 22, 19, 22, 29, 23, 23, 25, 41, 32]
        // }, {
        //     name: 'Quality Assurance',
        //     data: [45, 25, 32, 25, 22, 65, 44, 23, 25, 41, 22, 29]
        // }, {
        //     name: 'Web Developer',
        //     data: [32, 25, 22, 11, 22, 29, 16, 25, 9, 23, 25, 13]
        // }
    ])

    return (
        <>
            <div className="card mt-3 mb-3">
                <div className="card-body" style={{ position: 'relative' }}>
                    <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                        <Row>
                            <Col sm={12}>
                                <div className="card-header py-3 px-0 d-flex justify-content-between align-items-center bg-transparent border-bottom-0" >
                                    <div className="card-header p-0 d-flex justify-content-between align-items-center bg-transparent border-bottom-0">
                                        <h6 className="m-0 fw-bold">Popular Categories & Interests</h6>
                                    </div>
                                    <Nav variant="pills" >
                                        <Nav.Item>
                                            <Nav.Link eventKey="first">Categories</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link eventKey="second">Interests</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                </div>
                            </Col>
                            <Col sm={12}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="first">
                                        <div>
                                            <Chart
                                                options={options}
                                                series={series}
                                                type='bar'
                                                width='100%'
                                                height={300}
                                            />
                                        </div>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="second">
                                        <div>
                                            <Chart
                                                options={options1}
                                                series={series1}
                                                type='bar'
                                                width='100%'
                                                height={300}
                                            />
                                        </div>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </div>
            </div>

        </>
    )
}

export default ChartTabbing