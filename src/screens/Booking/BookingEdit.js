import React from 'react';
import Booking from '../../components/Booking/BookingEdit';
import PageHeader1 from '../../components/common/PageHeader1';

function BookingEdit() {
    return (
        <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
                <PageHeader1 pagetitle='Coupons Edit' />
                <div className="row clearfix g-3">
                    <div className="col-lg-12">
                        <Booking />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default BookingEdit;