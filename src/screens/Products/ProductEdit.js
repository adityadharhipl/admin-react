import React, { useEffect, useState } from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import BasicInformation from '../../components/Products/ProductEdit/BasicInformation';
import Images from '../../components/Products/ProductEdit/Images';
import { useNavigate, useParams } from 'react-router';
import { Product } from '../../Redux/Actions/Action';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Variants from '../../components/Products/ProductEdit/Variants';
import toast, { Toaster } from 'react-hot-toast';

function ProductEdit() {
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const existingImageData = useSelector((state) => state?.ProductReducer?.products);
    const [basicDetails, setBasicDetails] = useState([]);
    const [imagesData, setImagesData] = useState(existingImageData?.imageGallery);
    const [productVariants, setProductVariants] = useState(existingImageData?.productVariants);
    const [subCatId, setSubCatId] = useState("");
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (existingImageData) {
            setBasicDetails({
                categoryId: existingImageData?.categoryId || '',
                subCategoryId: existingImageData?.subCategoryId || '',
                productName: existingImageData?.productName || '',
                description: existingImageData?.description || ''
            });
            setImagesData(existingImageData?.imageGallery || []);
            setProductVariants(existingImageData?.productVariants || []);
        }
    }, [existingImageData]);

    const validateFields = () => {
        let errors = {};

        // Validate Basic Information
        if (!basicDetails?.categoryId) errors.categoryId = "Category is required";
        if (!basicDetails?.subCategoryId) errors.subCategoryId = "Sub Category is required";
        if (!basicDetails?.productName) errors.productName = "Product Title is required";
        if (!basicDetails?.description) errors.description = "Product Description is required";

        // Validate Images
        if (!imagesData || imagesData?.every(img => img === null)) {
            errors.images = "At least one image is required";
        }

        // Validate Variants
        productVariants?.forEach((variant, index) => {
            if (!variant.retailPrice) errors[`retailPrice${index}`] = `Retail Price is required for variant ${index + 1}`;
            if (!variant.salePrice) errors[`salePrice${index}`] = `Sale Price is required for variant ${index + 1}`;
            if (!variant.inventory) errors[`inventory${index}`] = `Inventory is required for variant ${index + 1}`;
            if (variant.images?.every(img => img === null)) {
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
    }
    const handleSubCategoryId = (id) => {
        setSubCatId(id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateFields()) {
            dispatch(Product({
                ...basicDetails,
                imageGallery: imagesData,
                productVariants: productVariants
            }, params?.id ? `?id=${params.id}` : ''))
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
                <PageHeader1 pagetitle='Products Edit' />
                <div className="row g-3">
                    <div className="col-xl-12 col-lg-12">
                        <div className="card mb-3">
                            <BasicInformation
                                id={params ?? ""}
                                updateBasicDetail={updateBasicDetail}
                                handleSubCategoryId={handleSubCategoryId}
                            />
                        </div>
                        <div className="card mb-3">
                            <Images
                                updateImagesData={updateImagesData}
                                id={params ?? ''}
                            />
                        </div>
                        <div className="card mb-3">
                            <Variants variantDetails={variantDetails}
                                subCatId={subCatId}
                            />
                        </div>

                        <div className="d-flex justify-content-end">
                            <button type="submit"
                                onClick={handleSubmit}
                                className="btn btn-primary btn-set-task w-sm-100 text-uppercase px-5">
                                Save
                            </button>
                            <Link to="/product-list" type="submit"
                                className="btn btn-primary btn-set-task w-sm-100 text-uppercase px-5 mx-2">
                                Cancel
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default ProductEdit;