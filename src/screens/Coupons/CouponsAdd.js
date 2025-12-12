import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import CouponsStatus from '../../components/Coupons/CouponAdd/CouponsStatus';

function CouponsAdd() {
    return (
        <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
                <PageHeader1 pagetitle='Coupons Add' />
                <div className="row clearfix g-3">
                    <div className="col-lg-12">
                        <CouponsStatus />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default CouponsAdd;