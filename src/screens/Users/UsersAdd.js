import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import UsersAdd from '../../components/Users/UsersAdd';

function UserAdd() {
    return (
        <div className="container-xxl">
            {/* <PageHeader1 pagetitle='Add a user' /> */}
            <div className="row g-3">
                <div className="col-xl-12 col-lg-12">
                    <div className=" mb-3">
                        <UsersAdd />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default UserAdd;