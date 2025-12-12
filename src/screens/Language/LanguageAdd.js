import React from 'react';
import PageHeader1 from '../../components/common/PageHeader1';
import Language from '../../components/Language/LanguageAdd';

function LanguageAdd() {
    return (
        <div className="body d-flex py-lg-3 py-md-2">
            <div className="container-xxl">
                <div className="d-flex justify-content-between align-items-center">
                    <PageHeader1 pagetitle='Language Add' />
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            marginBottom: "10px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "monospace",
                            fontSize: "18px",
                            color: "#007bff",
                            display: "flex",
                            alignItems: "center",
                            position: "relative",
                            borderRadius: "8px 8px 0 0",
                            backgroundColor: "#fff",
                        }}
                    >
                        <span style={{ marginRight: "8px" }}>&lt;</span>
                        <span style={{ position: "relative", display: "inline-block" }}>
                            Back
                            <span
                                style={{
                                    content: "''",
                                    position: "absolute",
                                    left: 0,
                                    bottom: -2,
                                    width: "100%",
                                    height: "1px",
                                    borderBottom: "2px solid #007bff",
                                }}
                            ></span>
                        </span>
                    </button>
                </div>
                <div className="row clearfix g-3 mt-1">
                    <div className="col-lg-12">
                        <Language />
                    </div>
                </div>
            </div>
        </div>
    )
}
export default LanguageAdd;