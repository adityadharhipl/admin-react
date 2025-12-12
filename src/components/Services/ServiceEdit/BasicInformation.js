import React, { useEffect, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Select from 'react-select';
import { fetchTag } from '../../../Redux/Reducers/TagReducer';
import { useDispatch, useSelector } from 'react-redux';
import { editService } from '../../../Redux/Reducers/ServiceReducer';
import { useParams } from 'react-router';
import { fetchAttribute } from '../../../Redux/Reducers/AttributeReducer';
import { fetchCommission } from '../../../Redux/Reducers/CommissionReducer';

function BasicInformation(props) {
    let params = useParams();
    const dispatch = useDispatch();
    const attribute = useSelector((state) => state?.AttributeReducer?.attribute);
    const tags = useSelector((state) => state?.TagReducer?.tag);
    const service = useSelector((state) => state?.ServiceReducer?.services);
    const commission = useSelector((state) => state?.CommissionReducer?.commission);
    let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    useEffect(() => {
        dispatch(fetchTag());
        dispatch(editService(params?.id));
        dispatch(fetchAttribute());
        dispatch(fetchCommission(localData._id));
    }, [dispatch, params?.id]);

    useEffect(() => {
        if (service) {
            setFormData({
                categoryId: service?.categoryId?._id || '',
                subCategoryId: service?.subCategoryId?._id || '',
                serviceName: service?.serviceName || '',
                attributeId: service?.attributeId || [],
                tags: service?.tags || [],
                description: service?.description || "",
                included: service?.included || "",
                excluded: service?.excluded || "",
                regularPrice: service?.regularPrice || "",
                salesPrice: service?.salesPrice || "",
                discount: service?.discount || "",
            });
            setSelectedCategoryId(service?.categoryId?._id || '');
            setSelectedSubCategoryId(service?.subCategoryId?._id || "");
            setSelectedTags(
                service?.tags?.map(tag => ({
                    value: tag._id,
                    label: tag.tagName
                })) || []
            );
            setSelectedAttributes(
                service?.attributeId?.map(attribute => ({
                    value: attribute._id,
                    label: attribute.attributeName
                })) || []
            );
        }
    }, [service]);

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [selectedAttributes, setSelectedAttributes] = useState([]);
    const [formData, setFormData] = useState({});

    const handleCategoryChange = (event) => {
        const categoryId = event.target.value;
        setSelectedCategoryId(categoryId);
        handleInputChange('categoryId', categoryId);
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
        if (description) {
            handleInputChange('description', description);
        };
    };

    const handleTagsChange = (selectedOptions) => {
        setSelectedTags(selectedOptions);
        const tags = selectedOptions ? selectedOptions.map(option => option.value) : [];
        handleInputChange('tags', tags);
    };

    const handleAttributesChange = (selectedOptions) => {
        setSelectedAttributes(selectedOptions);
        const attributes = selectedOptions ? selectedOptions.map(option => option.value) : [];
        handleInputChange('attributeId', attributes);
    };

    const filteredSubCategories = commission?.filter(subCategory => subCategory.categoryId?._id === selectedCategoryId);
    const filteredAttributes = attribute?.filter(attr => attr.subCategoryId?._id === selectedSubCategoryId);

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
                                value={formData?.categoryId}
                                onChange={(e) => {
                                    handleCategoryChange(e);
                                }}>
                                <option value="">Select a Category</option>
                                {commission?.map((item, index) => (
                                    <option key={index} value={item?.categoryId?._id}>{item?.categoryId?.categoryName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Sub Category</label>
                            <span style={{ color: "red" }}>*</span>
                            <select className="form-select"
                                value={formData?.subCategoryId}
                                onChange={(e) => {
                                    handleInputChange('subCategoryId', e.target.value);
                                    setSelectedSubCategoryId(e.target.value);
                                }}>
                                <option value="">Select a Sub Category</option>
                                {filteredSubCategories.map((subCategory) => (
                                    <option key={subCategory?.subCategoryId?._id} value={subCategory?.subCategoryId?._id}>{subCategory?.subCategoryId?.subCategoryName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Attribute</label>
                            <Select
                                closeMenuOnSelect={false}
                                isMulti
                                options={filteredAttributes.map(attribute => ({
                                    value: attribute._id,
                                    label: attribute.attributeName
                                }))}
                                value={selectedAttributes}
                                onChange={handleAttributesChange}
                            />
                        </div>

                        <div className="col-md-6" style={{ zIndex: "9" }}>
                            <label className="form-label">Tags</label>
                            <Select
                                closeMenuOnSelect={false}
                                isMulti
                                options={tags?.map(tag => ({
                                    value: tag._id,
                                    label: tag.tagName
                                }))}
                                value={selectedTags}
                                placeholder="Select tags"
                                onChange={handleTagsChange}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Service Name</label>
                            <span style={{ color: "red" }}>*</span>
                            <input type="text"
                                value={formData?.serviceName}
                                className="form-control" placeholder='Add a title'
                                onChange={(e) => handleInputChange('serviceName', e.target.value)}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Service Description</label>
                            <span style={{ color: "red" }}>*</span>
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData?.description}
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
                            <label className="form-label">Included</label>
                            <span style={{ color: "red" }}>*</span>
                            <input type="text"
                                value={formData?.included}
                                className="form-control" placeholder='Whats included'
                                onChange={(e) => handleInputChange('included', e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Excluded</label>
                            <input type="text"
                                value={formData?.excluded}
                                className="form-control" placeholder='Whats Excluded'
                                onChange={(e) => handleInputChange('excluded', e.target.value)}
                            />
                        </div> */}

                        <div className="col-md-12">
                            <label className="form-label">Included</label><span style={{ color: "red" }}>*</span>
                            <CKEditor
                                editor={ClassicEditor}
                                data={formData?.included}
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
                                data={formData?.excluded}
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
                            <label className="form-label">Regular Price</label>
                            <span style={{ color: "red" }}>*</span>
                            <input type="number"
                                value={formData?.regularPrice}
                                min={0} className="form-control" placeholder='Enter Regular Price'
                                onChange={(e) => handleInputChange('regularPrice', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Sales Price</label>
                            <span style={{ color: "red" }}>*</span>
                            <input type="number"
                                value={formData?.salesPrice}
                                min={0} className="form-control" placeholder="Enter Sales Price"
                                onChange={(e) => handleInputChange('salesPrice', e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Discount</label>
                            <input type="number"
                                value={formData?.discount}
                                min={0} className="form-control" placeholder="Enter Discount Price"
                                onChange={(e) => handleInputChange('discount', e.target.value)}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

export default BasicInformation;