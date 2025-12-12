import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import Booking from '../../components/Booking/BookingAdd';

function BookingAdd() {
    return (
        <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
                <PageHeader1 pagetitle='Booking' />
                <div className="row clearfix g-3">
                    <div className="col-lg-12">
                        <Booking />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default BookingAdd;