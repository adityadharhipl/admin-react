import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../Redux/Reducers/ProductReducer';
import { fetchSubCategory } from '../../Redux/Reducers/SubCategoryReducer';
import { fetchCommission } from '../../Redux/Reducers/CommissionReducer';

function BookingAdd() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const subCategory = useSelector((state) => state?.SubCategoryReducer?.subCategory);
    const products = useSelector((state) => state?.ProductReducer?.products);
    const commission = useSelector((state) => state?.CommissionReducer?.commission);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchSubCategory());
        dispatch(fetchProducts());
        dispatch(fetchCommission(localData._id));
    }, [dispatch]);

    useEffect(() => {
        if (selectedCategory) {
            setFilteredSubCategories(subCategory?.filter(sc => sc?.categoryId?._id === selectedCategory?.value));
            setFilteredProducts([]);
            setSelectedSubCategory(null);
        } else {
            setFilteredSubCategories([]);
            setFilteredProducts([]);
        }
    }, [selectedCategory, subCategory]);

    useEffect(() => {
        if (selectedSubCategory) {
            setFilteredProducts(products?.filter(p => p?.subCategoryId?._id === selectedSubCategory?.value));
        } else {
            setFilteredProducts([]);
        }
    }, [selectedSubCategory, products]);

    const onSubmit = async (data) => {
        data.sellerId = localData?._id
        setIsLoading(true);
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASEURL}/coupon`, data, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success(response.data.message);
            if (response.data.status) {
                navigate("/coupons-list");
            }
        } catch (error) {
            toast.error(error?.response?.data || 'Something went wrong!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={true} duration="10000" />
            <div className="card-body">
                <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <span style={{ color: "red" }}>*</span>
                        <Select
                            options={Array.from(new Map(commission?.map(cat => [cat.categoryId._id, cat])).values())
                                ?.map(cat => ({
                                    value: cat.categoryId._id,
                                    label: cat.categoryId.categoryName
                                }))}
                            placeholder="Select Category"
                            onChange={(selectedOption) => {
                                setSelectedCategory(selectedOption);
                                setValue('categoryId', selectedOption.value);
                            }}
                        />
                        {errors.categoryId && <span className="text-danger">{errors.categoryId.message}</span>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Sub Category</label>
                        <span style={{ color: "red" }}>*</span>
                        <Select
                            options={filteredSubCategories.map(sCat => ({
                                value: sCat?._id,
                                label: sCat?.subCategoryName
                            }))}
                            placeholder="Select Sub Category"
                            onChange={(selectedOption) => {
                                setSelectedSubCategory(selectedOption);
                                setValue('subCategoryId', selectedOption.value);
                            }}
                        />
                        {errors.subCategoryId && <span className="text-danger">{errors.subCategoryId.message}</span>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Product</label>
                        <span style={{ color: "red" }}>*</span>
                        <Select
                            options={filteredProducts?.map(prod => ({
                                value: prod._id,
                                label: prod.productName
                            }))}
                            placeholder="Select Product"
                            onChange={(selectedOption) => setValue('productsId', [selectedOption.value])}
                        />
                        {errors.productsId && <span className="text-danger">{errors.productsId.message}</span>}
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Coupon Code</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                type="text"
                                placeholder='Enter coupon name'
                                {...register('couponCodeName', {
                                    required: 'Coupon Name is required',
                                })}
                                onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                            />
                            {errors.couponCodeName && <span className="text-danger">{errors.couponCodeName.message}</span>}
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Coupon Title</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                type="text"
                                placeholder='Enter coupon title'
                                {...register('couponTitle', {
                                    required: 'Coupon Title is required',
                                })}
                            />
                            {errors.couponTitle && <span className="text-danger">{errors.couponTitle.message}</span>}
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Discount value</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                type="number"
                                min="0"
                                placeholder='Enter discount value'
                                {...register('discountValue', {
                                    required: 'Discount value is required',
                                })}
                            />
                            {errors.discountValue && <span className="text-danger">{errors.discountValue.message}</span>}
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Start date</label> <span className="text-danger">*</span>
                            <input
                                min={new Date().toISOString().split("T")[0]}
                                className="form-control"
                                type="date"
                                {...register('startDate', {
                                    required: 'Start Date is required',
                                })}
                            />
                            {errors.startDate && <span className="text-danger">{errors.startDate.message}</span>}
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">End date</label> <span className="text-danger">*</span>
                            <input
                                min={new Date().toISOString().split("T")[0]}
                                className="form-control"
                                type="date"
                                {...register('endDate', {
                                    required: 'End date is required',
                                })}
                            />
                            {errors.endDate && <span className="text-danger">{errors.endDate.message}</span>}
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Min. order value</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                min="0"
                                type="number"
                                placeholder='Enter minimum order value'
                                {...register('minOrderVal', {
                                    required: 'Min order value is required',
                                })}
                            />
                            {errors.minOrderVal && <span className="text-danger">{errors.minOrderVal.message}</span>}
                        </div>
                    </div>

                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary text-uppercase px-3" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                        <Link to="/coupons-list" className="btn btn-secondary text-uppercase px-3 mx-2">Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default BookingAdd;