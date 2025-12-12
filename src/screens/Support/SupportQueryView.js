import React, { useEffect } from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCustomerSupport } from "../../Redux/Reducers/SupportQueryReducer";

function SupportQueryView() {
    const { id } = useParams(); 
    const dispatch = useDispatch();
    const queryData = useSelector((state) => state?.SupportQueryReducer?.queries);
    const loading = useSelector((state) => state?.SupportQueryReducer?.loading);

    useEffect(() => {
        dispatch(fetchCustomerSupport(id));
    }, [dispatch, id]);

    const renderKeyValue = (key, value) => (
        <div className="row mb-2">
            <div className="col-sm-3">
                <strong>{key}:</strong>
            </div>
            <div className="col-sm-9">
                <span>{value || 'NA'}</span>
            </div>
        </div>
    );

   
    const filteredData = queryData?.data?.filter((query) => query?._id === id);

    return (
        <div className="container mt-4">
            <h3>Query Details</h3>

            {loading ? (
                <p>Loading...</p>
            ) : filteredData?.length > 0 ? (
                filteredData.map((query, index) => (
                    <div key={query?._id} className="card mb-4">
                        <div className="card-header">
                          
                        </div>
                        <div className="card-body">
                            {renderKeyValue('ID', query?._id)}
                            {renderKeyValue('Name', query?.name)}
                            {renderKeyValue('Email', query?.email)}
                            {renderKeyValue('Mobile', query?.mobile)}
                            {renderKeyValue('Description', query?.description)}
                      
                        </div>
                    </div>
                ))
            ) : (
                <p>No matching query found for the provided ID.</p>
            )}
        </div>
    );
}

export default SupportQueryView;
