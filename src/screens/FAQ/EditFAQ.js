import React from 'react';
import FAQEdit from '../../components/FAQ/FAQEdit';

function EditFAQ() {
    return (
        <div className="container-xxl">
            <div className="row g-3">
                <div className="col-xl-12 col-lg-12">
                    <div className="card mb-3">
                        <FAQEdit />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default EditFAQ;