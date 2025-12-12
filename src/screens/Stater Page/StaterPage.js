import React from 'react';
import NODATA from '../../assets/images/no-data.svg'
import Header from '../../components/common/Header';

function StaterPage() {
    return (
        <>
            <Header />
            <div className='body d-flex py-lg-3 py-md-2'>
                <div className="container-xxl">
                    <div className="col-12">
                        <div className="card mb-3">
                            <div className="card-body text-center p-5">
                                <img src={NODATA} className="img-fluid mx-size" alt="No Data" />
                                <div className="mt-4 mb-2">
                                    <h1 className="text-muted">404</h1>
                                    <span className="text-muted">Not Found</span>
                                </div>
                                <button type="button" className="btn btn-primary border lift mt-1">Back to Home</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default StaterPage;