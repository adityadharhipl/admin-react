import React from 'react';
import { ActiveUserStatusData } from '../Data/Data';


function ActiveUsersStatus() {
    return (
        <div className="card position-sticky" style={{ top: '20px' }}>
            <div className="card-header py-3 d-flex justify-content-between align-items-center bg-transparent border-bottom-0">
                <h6 className="m-0 fw-bold">Active Users Status</h6>
            </div>
            <div className="card-body">
                <div className="p-4 active-user bg-lightblue rounded-2 mb-2">
                    <span className="fw-bold d-flex justify-content-center fs-3">1345</span>
                </div>
                <div className="table-responsive">
                    <table className="table">
                        {/* <thead>
                            <tr>
                                <th scope="col">Active pages</th>
                                <th scope="col"></th>
                            </tr>
                        </thead> */}
                        <thead>
                            <tr>
                                <th scope="col">Average daily interactions</th>
                                <th scope="col">Avg.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                ActiveUserStatusData.map((d, i) => {
                                    return <tr key={"images" + i}>
                                        <td>{d.Link}</td>
                                        <td>{d.user}</td>

                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
export default ActiveUsersStatus;