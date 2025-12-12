import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import UsersEdit from '../../components/Users/UsersEdit';

function UserEdit() {
    return (
        <div className="container-xxl">
            <PageHeader1 pagetitle='' />
            <div className="row g-3">
                <div className="col-xl-12 col-lg-12">
                    <div className="card mb-3">
                        <UsersEdit />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default UserEdit;