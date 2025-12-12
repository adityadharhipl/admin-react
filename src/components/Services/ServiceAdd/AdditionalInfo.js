import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const Variants = (props) => {
    const [variants, setVariants] = useState({
        about: "",
        benefits: "",
        precautions: "",
        fyi: "",
        upgrades: "",
        recommended: "",
    });

    useEffect(() => {
        props.additionalInfo(variants);
    }, [variants]);

    const handleInputChange = (field, value) => {
        setVariants(prevState => ({
            ...prevState,
            [field]: value
        }));
    };

    const handleAdditionalDescriptionChange = (event, editor) => {
        const additionalDes = editor?.getData();
        handleInputChange('about', additionalDes);
    };

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
                                    placeholder: "Enter your about here..."
                                }}
                                onChange={handleAdditionalDescriptionChange}
                            />
                        </div>

                        {/* <div className="col-md-6">
                            <label className="form-label">Benefits</label>
                            <input
                                type="textarea"
                                className="form-control"
                                placeholder="Add a title"
                                onChange={(e) => handleInputChange('benefits', e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">After care tips & Precautions</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="After care tips & Precautions"
                                onChange={(e) => handleInputChange('precautions', e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">FYI</label>
                            <input
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
                                    placeholder: "Enter the benefits here..."
                                }}
                                onChange={(event, editor) => handleInputChange('benefits', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">After care tips & Precautions</label>
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
                                    placeholder: "Enter the after care tips & precautions here..."
                                }}
                                onChange={(event, editor) => handleInputChange('precautions', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">FYI</label>
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
                                    placeholder: "Enter FYI here..."
                                }}
                                onChange={(event, editor) => handleInputChange('fyi', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Add Ons / Upgrades</label>
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
                                    placeholder: "Enter Add Ons / Upgrades here..."
                                }}
                                onChange={(event, editor) => handleInputChange('upgrades', editor?.getData())}
                            />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Recommended for</label>
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
                                    placeholder: "Enter recommended for here..."
                                }}
                                onChange={(event, editor) => handleInputChange('recommended', editor?.getData())}
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