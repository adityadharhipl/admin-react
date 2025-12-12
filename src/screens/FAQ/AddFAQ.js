import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import FAQAdd from '../../components/FAQ/FAQAdd';

function AddFAQ() {
    return (
        <div className="container-xxl">
            {/* <PageHeader1 pagetitle='Add FAQ' /> */}
            <div className="row g-3">
                <div className="col-xl-12 col-lg-12">
                    <div className="card mb-3">
                        <FAQAdd />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddFAQ;