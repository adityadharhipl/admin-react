import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import Skills from '../../components/Skills/SkillsAdd';

function SkillsAdd() {
    return (
        <div className="container-xxl">
            <PageHeader1 />
            <div className="row g-3">
                <div className="col-xl-12 col-lg-12">
                    <div className="card mb-3">
                        <Skills />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default SkillsAdd;