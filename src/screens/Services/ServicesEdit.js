import React, { useState } from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import BasicInformation from '../../components/Services/ServiceEdit/BasicInformation';
import Images from '../../components/Services/ServiceEdit/Images';
import { useDispatch, useSelector } from 'react-redux';
import { Service } from '../../Redux/Actions/Action';
import { useNavigate, useParams } from 'react-router';
import toast, { Toaster } from 'react-hot-toast';
import Variants from '../../components/Services/ServiceEdit/Variants';

function Services() {
    const params = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const service = useSelector((state) => state?.ServiceReducer?.services);

    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    const [basicDetails, setBasicDetails] = useState([]);
    const [imagesData, setImagesData] = useState(service?.imageGallery || []);
    const [additionalInfo, setAdditionalInfo] = useState([]);

    const updateImagesData = (newImagesData) => {
        setImagesData(newImagesData);
    };

    const updateBasicDetail = (details) => {
        setBasicDetails(details);
    };

    const handleAddtionalInfo = (additionalInfo) => {
        setAdditionalInfo(additionalInfo);
    };

    const handleSubmit = () => {
        const finalImagesData = imagesData.length > 0 ? imagesData : service?.imageGallery;
        dispatch(Service({
            ...basicDetails,
            ...additionalInfo,
            sellerId: localData?._id,
            imageGallery: finalImagesData,
        }, params?.id ? `?id=${params.id}` : ''))
            .then(responseData => {
                toast.success(responseData?.message);
                if (responseData?.status) {
                    navigate("/service-list");
                }
            })
            .catch(error => {
                console.error('Error adding service:', error.message);
                toast.error(error?.message);
            });
    };

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={true}
                duration="10000"
            />
            <div className="container-xxl">
                <PageHeader1 pagetitle='Service Add' />
                <div className="row g-3">
                    <div className="col">
                        <div className="card mb-3">
                            <BasicInformation updateBasicDetail={updateBasicDetail} />
                        </div>
                        <div className="card mb-3">
                            <Images updateImagesData={updateImagesData} />
                        </div>
                        <div className="card mb-3 position-relative">
                            <Variants additionalInfo={handleAddtionalInfo} />
                        </div>
                        <div className="d-flex justify-content-end">
                            <button type="submit"
                                onClick={handleSubmit}
                                className="btn btn-primary btn-set-task w-sm-100 text-uppercase px-5">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Services;