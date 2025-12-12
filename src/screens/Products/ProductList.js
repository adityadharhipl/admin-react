import React, { useEffect } from 'react';
import CardBlock from '../../components/Products/ProductList/CardBlock';
import PageHeader1 from '../../components/common/PageHeader1';
// Mixpanel tracking removed

function ProductList() {
    // Mixpanel tracking removed

    return (
        <div className="container-xxl">
            <PageHeader1 pagetitle='Products' productlist={true} />
            <div className="row g-3 mb-3">
                <div className="col-md-12 col-lg-12 col-xl-12 col-xxl-12">
                    <CardBlock />
                </div>
            </div>
        </div>
    )
}
export default ProductList;