import React, { useEffect } from 'react';
import { Tab, Nav, Row, Col } from 'react-bootstrap';
import ShoppingStatuschart from '../../components/dashboard/ShoppingStatuschart';
import TopShellingProductChart from '../../components/dashboard/TopShellingProductChart';
import AvgexpenceChart from '../../components/dashboard/AvgexpenceChart';
import BranchLocation from '../../components/dashboard/BranchLocation';
import ActiveUsersStatus from '../../components/dashboard/ActiveUsersStatus';
import RecentTransaction from '../../components/dashboard/RecentTransaction';
import SalesStatus from '../../components/dashboard/SalesStatus';
import { DashboardStatusData, MonthData, TodayData, WeekData, YearData } from '../../components/Data/Data';
import ChartTabbing from '../../components/dashboard/ChartTabbing';
// Mixpanel tracking removed

function Dashboard() {
    // Mixpanel tracking removed

    return (
        <div className="body d-flex">
            <div className="container-xxl">
                <div className="row g-3 mb-3 row-cols-1 row-cols-sm-2 row-cols-md-2 row-cols-lg-2 row-cols-xl-4">
                    {
                        DashboardStatusData.map((d, i) => {
                            return <div key={'statuscard' + i} className="col">
                                <div className={`${d.bgClass} alert mb-0`}>
                                    <div className="d-flex align-items-center">
                                        <div className={`avatar rounded no-thumbnail ${d.iconBgClass} text-light`}><i className={d.iconClass}></i></div>
                                        <div className="flex-fill ms-3 text-truncate">
                                            <div className="h6 mb-0">{d.title}</div>
                                            <span className="small">{d.value}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        })
                    }
                </div>
                
                <div className="row g-3 mb-3">
                    <div className="col-xxl-8 col-xl-8 col-md-12">
                        <TopShellingProductChart />
                        <ChartTabbing />
                        <ShoppingStatuschart />
                        <SalesStatus />
                        <RecentTransaction />
                    </div>
                    <div className="col-lg-4 col-md-12">
                        <ActiveUsersStatus />
                    </div>
                    {/* <div className='col-xxl-4 col-xl-4'>
                        <BranchLocation />
                    </div> */}
                </div>
                <div className="row g-3 mb-3">
                    {/* <div className="col-lg-4 col-md-12">
                        <ActiveUsersStatus />
                    </div> */}
                    {/* <div className='col-lg-8 col-md-12'>
                        <AvgexpenceChart />
                    </div> */}
                </div>
                <div className="row g-3 mb-3">
                    <div className="col-md-12">
                        {/* <RecentTransaction /> */}
                    </div>
                </div>
            </div>
        </div>

    )
}
export default Dashboard;