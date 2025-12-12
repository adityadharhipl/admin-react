import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const Variants = (props) => {
    const service = useSelector((state) => state?.ServiceReducer?.services);

    const [info, setInfo] = useState({
        about: service?.about,
        benefits: service?.benefits,
        precautions: service?.precautions,
        fyi: service?.fyi,
        upgrades: service?.upgrades,
        recommended: service?.recommended,
    });

    useEffect(() => {
        props?.additionalInfo(info);
    }, [info]);

    const handleInputChange = (field, value) => {
        setInfo(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    // const handleAdditionalDescriptionChange = (event, editor) => {
    //     const additionalDes = editor?.getData();
    //     handleInputChange('about', additionalDes);
    // };

    return (
        <>
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h6 className="mb-0 fw-bold">Additional information</h6>
            </div>
            <div className="card-body">
                <form>
                    <div className="row g-3 align-items-center">
                        <div className="col-md-12">
                            <label className="form-label">About the Service</label>
                            <span style={{ color: "red" }}>*</span>
                            <CKEditor
                                editor={ClassicEditor}
                                data={service?.about}
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
                                    placeholder: "Enter your about here..."
                                }}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    handleInputChange('about', data);
                                }}
                            />
                        </div>

                        {/* <div className="col-md-6">
                            <label className="form-label">Benefits</label>
                            <input
                                defaultValue={service?.benefits}
                                type="textarea"
                                className="form-control"
                                placeholder="Add a title"
                                onChange={(e) => handleInputChange('benefits', e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">After care tips & Precautions</label>
                            <input
                                defaultValue={service?.precautions}
                                type="text"
                                className="form-control"
                                placeholder="After care tips & Precautions"
                                onChange={(e) => handleInputChange('precautions', e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">FYI</label>
                            <input
                                defaultValue={service?.fyi}
                                type="text"
                                min={0}
                                className="form-control"
                                placeholder="Things to know"
                                onChange={(e) => handleInputChange('fyi', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Add Ons / Upgrades</label>
                            <input
                                defaultValue={service?.upgrades}
                                type="text"
                                min={0}
                                className="form-control"
                                placeholder="Enter Add ons and upgrades"
                                onChange={(e) => handleInputChange('upgrades', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Recommended for</label>
                            <input
                                defaultValue={service?.recommended}
                                type="text"
                                min={0}
                                className="form-control"
                                placeholder="Recommended for"
                                onChange={(e) => handleInputChange('recommended', e.target.value)}
                            />
                        </div> */}

                        <div className="col-md-12">
                            <label className="form-label">Benefits</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={service?.benefits}
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
                                    placeholder: "Enter the benefits here..."
                                }}
                                onChange={(event, editor) => {
                                    const data = editor.getData();
                                    handleInputChange('benefits', data);
                                }}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">After care tips & Precautions</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={service?.precautions}
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
                                    placeholder: "Enter the after care tips & precautions here..."
                                }}
                                onChange={(editor) => handleInputChange('precautions', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">FYI</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={service?.fyi}
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
                                    placeholder: "Enter FYI here..."
                                }}
                                onChange={(editor) => handleInputChange('fyi', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Add Ons / Upgrades</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={service?.upgrades}
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
                                    placeholder: "Enter Add Ons / Upgrades here..."
                                }}
                                onChange={(editor) => handleInputChange('upgrades', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Recommended for</label>
                            <CKEditor
                                editor={ClassicEditor}
                                data={service?.recommended}
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
                                    placeholder: "Enter recommended for here..."
                                }}
                                onChange={(editor) => handleInputChange('recommended', editor?.getData())}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
};

const mapStateToProps = ({ Mainreducer }) => ({
    Mainreducer
});

export default connect(mapStateToProps)(Variants);