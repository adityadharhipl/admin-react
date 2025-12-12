import React, { useEffect, useState } from 'react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchTermsConditions, postTermsConditions } from '../../Redux/Reducers/TermsConditionsReducer';

export const TermsAndCondition = () => {
    const dispatch = useDispatch();
    const { content, status, error } = useSelector((state) => state.TermsConditionsReducer || {});
    const About = useSelector((state) => state); 
    const [data, setData] = useState("");
    useEffect(() => {
        dispatch(fetchTermsConditions());
    }, [dispatch]);

    useEffect(() => {
        if (content) {
            setData(content || "");  
        }
    }, [content]);

    // Handle Save action
    const handlePostTermsConditions = (e) => {
        e.preventDefault();
        dispatch(postTermsConditions({ key: "terms_conditions", title: "Terms and Conditions", content: data }));

        // Show toast based on status
        if (status === "succeeded") {
            toast.success("Terms and Conditions content saved successfully!");
        } else if (status === "failed") {
            toast.error(error || "Failed to save Terms and Conditions content.");
        }
    };

    // Handle CKEditor content change
    const handleTextChange = (event, editor) => {
        const text = editor?.getData();
        setData(text);
    };

    return (
        <>
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h3 className="mb-0 fw-bold">Terms and Conditions</h3>
            </div>
            <hr />
            <div className="card-body">
                <form>
                    <div className="row g-3 align-items-center">
                        <div className="col-md-12">
                            <CKEditor
                                editor={ClassicEditor}
                                data={data}
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
                                    ],
                                    placeholder: "Enter Terms and Conditions content here..."
                                }}
                                onChange={handleTextChange}
                            />
                        </div>
                    </div>
                    <br />
                    <div className="d-flex justify-content-end">
                        <button
                            type="submit"
                            onClick={handlePostTermsConditions}
                            className="btn btn-primary btn-set-task w-sm-100 text-uppercase px-5"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default TermsAndCondition;
