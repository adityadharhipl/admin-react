import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Select from 'react-select';
import { fetchTag } from '../../../Redux/Reducers/TagReducer';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupon } from '../../../Redux/Reducers/CouponReducer';
import { useParams } from 'react-router';
import { editProducts } from '../../../Redux/Reducers/ProductReducer';
import { fetchCommission } from '../../../Redux/Reducers/CommissionReducer';

function BasicInformation(props) {
    let params = useParams();
    const dispatch = useDispatch();
    const tags = useSelector((state) => state?.TagReducer?.tag);
    const products = useSelector((state) => state?.ProductReducer?.products);
    const commission = useSelector((state) => state?.CommissionReducer?.commission);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchTag());
        dispatch(fetchCoupon());
        dispatch(editProducts(params?.id));
        dispatch(fetchCommission(localData._id));
    }, [dispatch, params?.id]);

    useEffect(() => {
        if (products) {
            setFormData({
                categoryId: products?.categoryId?._id || '',
                subCategoryId: products?.subCategoryId?._id || '',
                productName: products?.productName || '',
                description: products?.description || '',
                additionalDes: products?.additionalDes || "",
                tags: products?.tags || []
            });
            setSelectedCategoryId(products?.categoryId?._id || '');
            setSelectedTags(
                products?.tags?.map(tag => ({
                    value: tag._id,
                    label: tag.tagName
                }))
            );
        }
    }, [products]);

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [formData, setFormData] = useState({
        categoryId: '',
        subCategoryId: '',
        productName: '',
        description: '',
        additionalDes: "",
        tags: []
    });

    const handleCategoryChange = (event) => {
        const categoryId = event.target.value;
        setSelectedCategoryId(categoryId);
        handleInputChange('categoryId', categoryId);
    };

    const handleSubCategoryChange = (event) => {
        props?.handleSubCategoryId(event?.target?.value);
    };

    const handleInputChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
        props?.updateBasicDetail(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleProductDescriptionChange = (event, editor) => {
        const description = editor?.getData();
        handleInputChange('description', description);
    };

    const handleTagsChange = (selectedOptions) => {
        const tags = selectedOptions ? selectedOptions?.map(option => option.value) : [];
        setSelectedTags(selectedOptions);
        handleInputChange('tags', tags);
    };

    const handleAdditionalDescriptionChange = (event, editor) => {
        const additionalDes = editor?.getData();
        handleInputChange('additionalDes', additionalDes);
    };

    const filteredSubCategories = commission?.filter(subCategory => subCategory.categoryId?._id === selectedCategoryId);

    return (
        <>
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h6 className="mb-0 fw-bold">Basic information</h6>
            </div>
            <div className="card-body">
                <form>
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <label className="form-label">Category</label>
                            <span style={{ color: "red" }}>*</span>
                            <select className="form-select"
                                name='categoryId'
                                value={formData?.categoryId}
                                onChange={(e) => {
                                    handleCategoryChange(e);
                                    handleInputChange('categoryId', e.target.value);
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
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Sub Category</label>
                            <span style={{ color: "red" }}>*</span>
                            <select className="form-select"
                                name='subCategoryId'
                                value={formData.subCategoryId}
                                onChange={(e) => {
                                    handleSubCategoryChange(e);
                                    handleInputChange('subCategoryId', e.target.value);
                                }}>
                                <option value="">Select a Sub Category</option>
                                {filteredSubCategories.map((subCategory) => (
                                    <option key={subCategory?.subCategoryId?._id} value={subCategory?.subCategoryId?._id}>{subCategory?.subCategoryId?.subCategoryName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Product Title</label><span style={{ color: "red" }}>*</span>
                            <input type="text" value={formData.productName} className="form-control" placeholder='Add a title' onChange={(e) => handleInputChange('productName', e.target.value)} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Tags</label>
                            <Select
                                closeMenuOnSelect={false}
                                isMulti
                                value={selectedTags}
                                options={tags?.map(tag => ({
                                    value: tag._id,
                                    label: tag.tagName
                                }))}
                                placeholder="Select tags"
                                onChange={handleTagsChange}
                            />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">Product Description</label>
                            <span style={{ color: "red" }}>*</span>
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData.description}
                                config={{
                                    toolbar: [
                                        "heading",
                                        "|",
                                        "bold",
                                        "italic",
                                        "link",
                                        "bulletedList",
                                        "numberedList",
                                        "|",
                                        "blockQuote",
                                        "insertTable",
                                        "|",
                                        "imageTextAlternative"
                                    ],
                                    placeholder: "Enter your description here..."
                                }}
                                onChange={handleProductDescriptionChange}
                            />
                        </div>
                        <div className="col-md-12">
                            <label className="form-label">Additional Description</label>
                            <CKEditor
                                data={formData.additionalDes}
                                editor={ClassicEditor}
                                config={{
                                    toolbar: [
                                        "heading",
                                        "|",
                                        "bold",
                                        "italic",
                                        "link",
                                        "bulletedList",
                                        "numberedList",
                                        "|",
                                        "blockQuote",
                                        "insertTable",
                                        "|",
                                        "imageTextAlternative"
                                    ],
                                    placeholder: "Enter your description here..."
                                }}
                                onChange={handleAdditionalDescriptionChange}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default BasicInformation;