import React, { useState } from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import BasicInformation from '../../components/Products/ProductAdd/BasicInformation';
import Images from '../../components/Products/ProductAdd/Images';
import { useDispatch } from 'react-redux';
import { Product } from '../../Redux/Actions/Action';
import { useNavigate } from 'react-router';
import toast, { Toaster } from 'react-hot-toast';
import Variants from '../../components/Products/ProductAdd/Variants';

function ProductAdd() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    const [basicDetails, setBasicDetails] = useState([]);
    const [imagesData, setImagesData] = useState([]);
    const [productVariants, setProductVariants] = useState([]);
    const [subCatId, setSubCatId] = useState("");
    const [catId, setCatId] = useState("");
    const [errors, setErrors] = useState({});

    const validateFields = () => {
        let errors = {};
        if (!basicDetails?.categoryId) errors.categoryId = "Category is required";
        if (!basicDetails?.subCategoryId) errors.subCategoryId = "Sub Category is required";
        if (!basicDetails?.productName) errors.productName = "Product Title is required";
        if (!basicDetails?.description) errors.description = "Product Description is required";

        if (!imagesData || imagesData?.every(img => img === null)) {
            errors.images = "At least one image is required";
        }

        productVariants?.forEach((variant, index) => {
            if (!variant?.retailPrice) errors[`retailPrice${index}`] = `Retail Price is required for variant ${index + 1}`;
            if (!variant?.salePrice) errors[`salePrice${index}`] = `Sale Price is required for variant ${index + 1}`;
            if (!variant?.inventory) errors[`inventory${index}`] = `Inventory is required for variant ${index + 1}`;
            if (variant?.images.every(img => img === null)) {
                errors[`images${index}`] = `At least one image is required for variant ${index + 1}`;
            }
        });

        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const updateImagesData = (newImagesData) => {
        setImagesData(newImagesData);
    };
    const updateBasicDetail = (details) => {
        setBasicDetails(details);
    };
    const variantDetails = (variants) => {
        setProductVariants(variants);
    };
    const handleSubCategoryId = (id) => {
        setSubCatId(id);
    };

    const handleCategoryId = (id) => {
        setCatId(id);
    };

    const handleSubmit = () => {
        if (validateFields()) {
            dispatch(Product({
                ...basicDetails,
                sellerId: localData?._id,
                imageGallery: imagesData,
                productVariants: productVariants
            }))
                .then(responseData => {
                    toast.success(responseData?.message);
                    if (responseData?.status) {
                        navigate("/product-list");
                    }
                })
                .catch(error => {
                    console.error('Error adding product:', error.message);
                    toast.error(error?.message);
                });
        } else {
            toast.error("Please fill all required fields");
        }

    };

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={true}
                duration="10000"
            />
            <div className="container-xxl">
                <PageHeader1 pagetitle='Products Add' />
                <div className="row g-3">
                    <div className="col">
                        <div className="card mb-3">
                            <BasicInformation updateBasicDetail={updateBasicDetail}
                                handleSubCategoryId={handleSubCategoryId}
                                handleCategoryId={handleCategoryId}
                            />
                        </div>
                        <div className="card mb-3">
                            <Images updateImagesData={updateImagesData} />
                        </div>
                        <div className="card mb-3 position-relative">
                            <Variants
                                variantDetails={variantDetails}
                                subCatId={subCatId}
                                setSubCatId={setSubCatId}
                                catId={catId} />
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

export default ProductAdd;