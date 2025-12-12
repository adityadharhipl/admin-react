import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import CommissionAdd from '../../components/Commission/CommissionAdd';

function AddCommission() {
    return (
        <div className="container-xxl">
            <PageHeader1 pagetitle='Add Commission' />
            <div className="row g-3">
                <div className="col-xl-12 col-lg-12">
                    <div className="card mb-3">
                        <CommissionAdd />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddCommission;