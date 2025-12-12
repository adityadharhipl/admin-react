import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Select from 'react-select';
import { fetchTag } from '../../../Redux/Reducers/TagReducer';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCoupon } from '../../../Redux/Reducers/CouponReducer';
import { fetchAttribute } from '../../../Redux/Reducers/AttributeReducer';
import { fetchCommission } from '../../../Redux/Reducers/CommissionReducer';

function BasicInformation(props) {
    const dispatch = useDispatch();
    const tags = useSelector((state) => state?.TagReducer?.tag);
    const attribute = useSelector((state) => state?.AttributeReducer?.attribute);
    const commission = useSelector((state) => state?.CommissionReducer?.commission);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchTag());
        dispatch(fetchCoupon());
        dispatch(fetchAttribute());
        dispatch(fetchCommission(localData._id));
    }, [dispatch]);

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [subCategoryId, setSubCategoryId] = useState('');

    const handleCategoryChange = (event) => {
        setSelectedCategoryId(event?.target?.value);
    };

    const handleSubCategoryChange = (event) => {
        setSubCategoryId(event?.target?.value);
    };

    const handleInputChange = (name, value) => {
        props?.updateBasicDetail(prevState => ({
            ...prevState,
            [name]: value,
        }))
    };

    const handleProductDescriptionChange = (event, editor) => {
        const description = editor?.getData();
        handleInputChange('description', description);
    };

    const filteredSubCategories = commission?.filter(subCategory => subCategory.categoryId?._id === selectedCategoryId);
    const filteredAttribute = attribute?.filter(attribute => attribute.subCategoryId?._id === subCategoryId);

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
                                onChange={(e) => {
                                    handleCategoryChange(e);
                                    handleInputChange('categoryId', e.target.value);
                                }}>
                                <option value="">Select a Category</option>
                                {commission?.reduce((acc, item) => {
                                    const category = item?.categoryId;
                                    if (category && !acc.find(c => c?._id === category?._id)) {
                                        acc.push(category);
                                    }
                                    return acc;
                                }, [])?.map((uniqueItem) => (
                                    <option key={uniqueItem?._id} value={uniqueItem?._id}>
                                        {uniqueItem?.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Sub Category</label>
                            <span style={{ color: "red" }}>*</span>
                            <select className="form-select"
                                onChange={(e) => {
                                    handleSubCategoryChange(e);
                                    handleInputChange('subCategoryId', e.target.value);
                                }}>
                                <option value="">Select a Sub Category</option>
                                {filteredSubCategories?.map((subCategory) => (
                                    <option key={subCategory?.subCategoryId?._id} value={subCategory?.subCategoryId?._id}>{subCategory?.subCategoryId?.subCategoryName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6" style={{ zIndex: "9" }}>
                            <label className="form-label">Attribute</label>
                            <span style={{ color: "red" }}>*</span>
                            <Select
                                closeMenuOnSelect={false}
                                isMulti
                                options={filteredAttribute?.map(attribute => ({
                                    value: attribute._id,
                                    label: attribute.attributeName
                                }))}
                                onChange={(selectedOption) => handleInputChange('attributeId', selectedOption.map(option => option.value))}
                            />
                        </div>

                        <div className="col-md-6" style={{ zIndex: "9" }}>
                            <label className="form-label">Tags</label>
                            <Select
                                styles={{ zIndex: "999" }}
                                closeMenuOnSelect={false}
                                isMulti
                                options={tags.map(tag => ({
                                    value: tag._id,
                                    label: tag.tagName
                                }))}
                                placeholder="Select tags"
                                onChange={(selectedOptions) => handleInputChange('tags', selectedOptions.map(option => option.value))}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Service Name</label><span style={{ color: "red" }}>*</span>
                            <input type="text" className="form-control" placeholder='Add a title'
                                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Service Description</label>
                            <span style={{ color: "red" }}>*</span>
                            <CKEditor
                                editor={ClassicEditor}
                                data=""
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

                        {/* <div className="col-md-6">
                            <label className="form-label">Included</label><span style={{ color: "red" }}>*</span>
                            <input type="text" className="form-control" placeholder='Whats included'
                                onChange={(e) => handleInputChange('included', e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Excluded</label><span style={{ color: "red" }}>*</span>
                            <input type="text" className="form-control" placeholder='Whats Excluded'
                                onChange={(e) => handleInputChange('excluded', e.target.value)}
                            />
                        </div> */}

                        <div className="col-md-12">
                            <label className="form-label">Included</label><span style={{ color: "red" }}>*</span>
                            <CKEditor
                                editor={ClassicEditor}
                                data=""
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
                                    placeholder: "Enter what's included here..."
                                }}
                                onChange={(event, editor) => handleInputChange('included', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Excluded</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data=""
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
                                    placeholder: "Enter what's excluded here..."
                                }}
                                onChange={(event, editor) => handleInputChange('excluded', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Regular Price</label><span style={{ color: "red" }}>*</span>
                            <input type="number" min={0} className="form-control" placeholder='Enter Regular Price'
                                onChange={(e) => handleInputChange('regularPrice', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Sales Price</label><span style={{ color: "red" }}>*</span>
                            <input type="number" min={0} className="form-control" placeholder="Enter Sales Price"
                                onChange={(e) => handleInputChange('salesPrice', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Discount</label>
                            <input type="number" min={0} className="form-control" placeholder="Enter Discount Price"
                                onChange={(e) => handleInputChange('discount', e.target.value)}
                            />
                        </div>
                    </div>
                </form >
            </div >
        </>
    );
}

export default BasicInformation;