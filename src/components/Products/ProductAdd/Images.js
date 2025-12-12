import React, { useState } from 'react';
import { connect } from 'react-redux';
import { OnchangeAddimage, deleteImage, uploadImagecertifates } from '../../../Redux/Actions/Action';
import defaultImg from "../../../assets/images/product/defaultImg.svg";
import { IoIosCloseCircle } from "react-icons/io";
import { Loader } from '../../../custom-component/Loader';

function Images(props) {
    const initialImages = props?.Mainreducer?.images?.length === 0
        ? Array(10).fill(null)
        : props?.Mainreducer?.images;

    const [localImages, setLocalImages] = useState(initialImages);
    const [loading, setLoading] = useState(false);

    const allImagesFilled = localImages?.every(img => img !== null);

    const handleInputChange = (event) => {
        setLoading(true);
        const files = Array.from(event.target.files);
        Promise.all(
            files?.map(async (file) => {
                const uploadedImageUrl = await props?.uploadImagecertifates(file);
                return uploadedImageUrl;
            })
        ).then((uploadedImageUrls) => {
            const updatedImages = [...localImages];
            uploadedImageUrls?.forEach((imageUrl, index) => {
                const emptyIndex = updatedImages.indexOf(null);
                if (emptyIndex !== -1) {
                    updatedImages[emptyIndex] = imageUrl;
                }
            });
            setLoading(false);
            setLocalImages(updatedImages);
            props.updateImagesData(updatedImages);
            props.OnchangeAddimage(updatedImages);
        });
    };

    const handleRemoveImage = (index) => {
        const updatedImages = localImages?.map((img, imgIndex) => (imgIndex === index ? null : img));
        setLocalImages(updatedImages);
        props.OnchangeAddimage(updatedImages);
        props.updateImagesData(updatedImages);
    };

    return (
        <>
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h6 className="mb-0 fw-bold">Images
                    <span style={{ color: "red" }}>*</span>
                </h6>
            </div>
            <div className="card-body">
                <form>
                    <div className="row g-3 align-items-center">
                        <div className="col-md-12">
                            <label className="form-label">Product Images Upload
                            </label>
                            <small className="d-block text-muted mb-2">Select upto 10 images only.</small>

                            <div id='create-token' className='dropzone'>
                                <div className='dz-message d-flex align-items-center justify-content-center flex-column'>
                                    <i className="fa fa-picture-o m-0" aria-hidden="true"></i>
                                    <h5 style={{ fontSize: '17px', color: '#E7B242', fontWeight: '600', marginTop: '8px' }}>
                                        {loading ? <Loader /> : "Upload a file"}
                                    </h5>
                                    <h6 style={{ fontSize: '14px' }}>PNG, JPG, WEBP, SVG...</h6>
                                </div>
                                <input
                                    id='filesize'
                                    onChange={handleInputChange}
                                    name="file"
                                    type="file"
                                    accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff, .mp4, .webm, .mp3, .wav, .ogg, .glb"
                                    multiple
                                    disabled={allImagesFilled}
                                />
                            </div>
                        </div>
                        {localImages?.map((image, index) => (
                            <div className='col-lg-2 col-md-4' key={index}>
                                <div className='position-relative border p-3' style={{ borderRadius: "0.95rem" }}>
                                    <img className='img-fluid' src={image || defaultImg} alt={`uploaded-img-${index}`} />
                                    {image && (
                                        <button
                                            className='position-absolute end-0 top-0 padding-0 pt-1 bg-transparent border-0'
                                            onClick={() => handleRemoveImage(index)}>
                                            <IoIosCloseCircle style={{ fontSize: '26px', color: "#727070" }} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </form>
            </div>
        </>
    );
}

const mapStateToProps = ({ Mainreducer }) => ({
    Mainreducer
});

export default connect(mapStateToProps, {
    OnchangeAddimage,
    deleteImage,
    uploadImagecertifates
})(Images);