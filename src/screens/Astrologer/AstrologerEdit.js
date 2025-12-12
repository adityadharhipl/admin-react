import React from 'react';
import Astrologer from '../../components/Astrologer/AstrologerEdit';
import PageHeader1 from '../../components/common/PageHeader1';

function AstrologerEdit() {
    return (
        <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
                <PageHeader1 pagetitle='Coupons Edit' />
                <div className="row clearfix g-3">
                    <div className="col-lg-12">
                        <Astrologer />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AstrologerEdit;