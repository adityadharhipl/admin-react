import React from 'react';
import { IoIosCloseCircle } from "react-icons/io";
import defaultImg from "../../../assets/images/product/defaultImg.svg";
import { Loader } from '../../../custom-component/Loader';

const ImageUpload = ({ images, onRemoveImage, onUploadImages, loading }) => {
    return (
        <div className="col-lg-6">
            <div className="col-md-12">
                <h6 style={{ fontWeight: '700' }}>Image</h6>
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
                        onChange={onUploadImages}
                        name="file"
                        type="file"
                        accept=".jpg, .png, .jpeg, .gif, .bmp, .tif, .tiff, .mp4, .webm, .mp3, .wav, .ogg, .glb"
                        multiple
                    />
                </div>
            </div>
            <div className="row g-3">
                {images?.map((image, index) => (
                    <div className='col-lg-3 col-md-6' key={index}>
                        <div className='position-relative border p-3' style={{ borderRadius: "0.95rem" }}>
                            <img className='img-fluid' src={image || defaultImg} alt={`uploaded-img-${index}`} />
                            {image && (
                                <button
                                    className='position-absolute end-0 top-0 padding-0 pt-1 bg-transparent border-0'
                                    onClick={() => onRemoveImage(index)}>
                                    <IoIosCloseCircle style={{ fontSize: '26px', color: "#727070" }} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageUpload;