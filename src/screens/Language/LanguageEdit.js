import React from 'react';
import Language from '../../components/Language/LanguageEdit';
import PageHeader1 from '../../components/common/PageHeader1';

function LanguageEdit() {
    return (
        <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
                <PageHeader1 pagetitle='Language Edit' />
                <div className="row clearfix g-3">
                    <div className="col-lg-12">
                        <Language />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default LanguageEdit;