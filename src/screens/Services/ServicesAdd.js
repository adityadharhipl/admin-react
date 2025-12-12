import React, { useState } from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import BasicInformation from '../../components/Services/ServiceAdd/BasicInformation';
import Images from '../../components/Services/ServiceAdd/Images';
import { useDispatch } from 'react-redux';
import { Service } from '../../Redux/Actions/Action';
import { useNavigate } from 'react-router';
import toast, { Toaster } from 'react-hot-toast';
import AdditionalInfo from '../../components/Services/ServiceAdd/AdditionalInfo';

function ServicesAdd() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    const [basicDetails, setBasicDetails] = useState({});
    const [imagesData, setImagesData] = useState([]);
    const [additionalInfo, setAdditionalInfo] = useState({});

    const updateImagesData = (newImagesData) => {
        setImagesData(newImagesData);
    };

    const updateBasicDetail = (details) => {
        setBasicDetails(details);
    };

    const handleAdditionalInfo = (info) => {
        setAdditionalInfo(info);
    };

    const validateBasicDetails = () => {
        const requiredFields = ['categoryId', 'subCategoryId', 'serviceName', 'attributeId', 'description', 'included', 'regularPrice', 'salesPrice'];
        return requiredFields.every(field => basicDetails[field] && basicDetails[field].length > 0);
    };

    const validateImages = () => imagesData.length > 0;

    const validateAdditionalInfo = () => {
        const requiredFields = ['about'];
        return requiredFields.every(field => additionalInfo[field] && additionalInfo[field].length > 0);
    };

    const handleSubmit = () => {
        if (!validateBasicDetails()) {
            toast.error("Please fill in all the required basic details.");
            return;
        }
        if (!validateImages()) {
            toast.error("Please upload at least one image.");
            return;
        }
        if (!validateAdditionalInfo()) {
            toast.error("Please fill in all the required additional information.");
            return;
        }

        dispatch(Service({
            ...basicDetails,
            ...additionalInfo,
            sellerId: localData?._id,
            imageGallery: imagesData,
        }))
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
                            <AdditionalInfo additionalInfo={handleAdditionalInfo} />
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

export default ServicesAdd;