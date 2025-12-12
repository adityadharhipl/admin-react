import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../Redux/Reducers/ProductReducer';
import { fetchSubCategory } from '../../Redux/Reducers/SubCategoryReducer';
import { editCoupon } from '../../Redux/Reducers/CouponReducer';
import { fetchCommission } from '../../Redux/Reducers/CommissionReducer';

function LanguageEdit() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const coupon = useSelector((state) => state?.CouponReducer?.coupon);
    const commission = useSelector((state) => state?.CommissionReducer?.commission);
    const product = useSelector((state) => state?.ProductReducer?.products);

    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(editCoupon(id));
        }
        dispatch(fetchSubCategory());
        dispatch(fetchProducts());
        dispatch(fetchCommission(localData._id));
    }, [dispatch, id, localData._id]);

    useEffect(() => {
        if (coupon) {
            setValue('categoryId', coupon?.categoryId?._id || '');
            setValue('subCategoryId', coupon?.subCategoryId?._id || '');
            setValue('productsId', coupon?.productsId?.map(prod => prod._id) || []);
            setValue('couponCodeName', coupon?.couponCodeName || '');
            setValue('couponTitle', coupon?.couponTitle || '');
            setValue('discountValue', coupon?.discountValue || '');
            setValue('startDate', coupon?.startDate || '');
            setValue('endDate', coupon?.endDate || '');
            setValue('minOrderVal', coupon?.minOrderVal || '');
            setSelectedCategoryId(coupon?.categoryId?._id || '');
            setSelectedProductId(coupon?.subCategoryId?._id || '');
            setSelectedProduct(coupon?.productsId?.map(prod => prod._id) || [])
        }
    }, [coupon, setValue]);

    const onSubmit = async (data) => {
        data.sellerId = localData?._id;
        setIsLoading(true);
        try {
            const response = await axios.patch(`${process.env.REACT_APP_BASEURL}/coupon?id=${id}`, data, {
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

    const filteredSubCategories = commission?.filter(subCategory => subCategory.categoryId?._id === selectedCategoryId);
    const filteredProducts = product?.filter(prod => prod.subCategoryId?._id === selectedProductId);

    const handleCategoryChange = (event) => {
        const selectedCategory = event.target.value;
        setSelectedCategoryId(selectedCategory);
        setSelectedProductId("");
        setValue('subCategoryId', '');
        setValue('productsId', []);
    };

    return (
        <>
            <Toaster position="top-right" reverseOrder={true} duration="10000" />
            <div className="card-body">
                <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <span style={{ color: "red" }}>*</span>
                        <select className="form-select"
                            value={selectedCategoryId}
                            name='categoryId'
                            onChange={(e) => {
                                handleCategoryChange(e);
                                setValue('categoryId', e.target.value);
                            }}>
                            <option value="">Select a Category</option>
                            {commission?.reduce((acc, item) => {
                                const category = item?.categoryId;
                                if (category && !acc.find(c => c._id === category._id)) {
                                    acc.push(category);
                                }
                                return acc;
                            }, []).map((uniqueItem) => (
                                <option key={uniqueItem._id} value={uniqueItem._id}>
                                    {uniqueItem.categoryName}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && <span className="text-danger">{errors.categoryId.message}</span>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Sub Category</label>
                        <span style={{ color: "red" }}>*</span>
                        <select className="form-select"
                            value={selectedProductId}
                            name='subCategoryId'
                            onChange={(e) => {
                                setSelectedProductId(e.target.value);
                                setValue('subCategoryId', e.target.value);
                            }}>
                            <option value="">Select a Sub Category</option>
                            {filteredSubCategories?.map((item, index) => (
                                <option key={index} value={item?.subCategoryId?._id}>{item?.subCategoryId?.subCategoryName}</option>
                            ))}
                        </select>
                        {errors.subCategoryId && <span className="text-danger">{errors.subCategoryId.message}</span>}
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Product</label>
                        <span style={{ color: "red" }}>*</span>
                        <select
                            className="form-select"
                            value={selectedProduct}
                            onChange={(e) => {
                                setSelectedProduct(e.target.value)
                                setValue('productsId', [e.target.value])
                            }} >
                            <option value="">Select a Product</option>
                            {filteredProducts?.map((prod) => (
                                <option key={prod._id} value={prod._id}>
                                    {prod.productName}
                                </option>
                            ))}
                        </select>

                        {errors.productsId && <span className="text-danger">{errors.productsId.message}</span>}
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Coupon Code</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                type="text"
                                placeholder='Enter coupon name'
                                {...register('couponCodeName')}
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
                                {...register('couponTitle')}
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
                                {...register('discountValue')}
                            />
                            {errors.discountValue && <span className="text-danger">{errors.discountValue.message}</span>}
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Start date</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                type="date"
                                {...register('startDate')}
                            />
                            {errors.startDate && <span className="text-danger">{errors.startDate.message}</span>}
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">End date</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                type="date"
                                {...register('endDate')}
                            />
                            {errors.endDate && <span className="text-danger">{errors.endDate.message}</span>}
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Min Order Value</label> <span className="text-danger">*</span>
                            <input
                                className="form-control"
                                type="number"
                                min="0"
                                placeholder='Enter min order value'
                                {...register('minOrderVal')}
                            />
                            {errors.minOrderVal && <span className="text-danger">{errors.minOrderVal.message}</span>}
                        </div>
                    </div>

                    <div className="col-12 text">
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Save'}
                        </button>
                        <Link to="/coupons-list" className="btn btn-secondary ms-2">Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default LanguageEdit;