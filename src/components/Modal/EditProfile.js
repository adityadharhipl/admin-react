import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { uploadImagecertifates } from '../../Redux/Actions/Action';
import { useDispatch } from 'react-redux';

export const EditProfile = ({ ismodal, setIsmodal, editProfile, profile, setProfileData, phoneInput }) => {
    const dispatch = useDispatch();

    const [disableBtn, setDisableBtn] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = async (e) => {
        setDisableBtn(true);
        const file = e.target.files[0];
        if (file) {
            try {
                const imageUrl = await dispatch(uploadImagecertifates(file));
                if (imageUrl) {
                    setDisableBtn(false);
                    setProfileData(prevData => ({
                        ...prevData,
                        media: imageUrl,
                    }));
                }
            } catch (error) {
                console.error("Image upload failed:", error);
            }
        }
    };

    return (
        <>
            <Modal show={ismodal} onHide={() => { setIsmodal(false) }} style={{ display: 'block' }}>
                <div className="modal-content">
                    <Modal.Header className="modal-header" closeButton>
                        <h5 className="modal-title  fw-bold" id="expeditLabel1111"> Edit Profile</h5>
                    </Modal.Header>
                    <Modal.Body className="modal-body">
                        <div className="deadline-form">
                            <form>
                                <div className="row g-3 mb-3">
                                    <div className="col-sm-6">
                                        <label htmlFor="item100" className="form-label">First Name</label>
                                        <input type="text"
                                            className="form-control"
                                            id="item100"
                                            placeholder="write your first name"
                                            name='firstName'
                                            defaultValue={profile?.firstName}
                                            onChange={handleInputChange} />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="item100" className="form-label">Last Name</label>
                                        <input type="text" className="form-control" id="item100"
                                            placeholder="write your last name"
                                            onChange={handleInputChange}
                                            name='lastName'
                                            defaultValue={profile?.lastName} />
                                    </div>
                                    <div className="col-sm-12">
                                        <label htmlFor="taxtno200" className="form-label">Profile</label>
                                        <input type="file" className="form-control" id="taxtno200" onChange={handleImageChange} />
                                    </div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-sm-12">
                                        <label className="form-label">Address</label>
                                        <textarea className="form-control" rows="3"
                                            placeholder="write your address"
                                            name='address'
                                            defaultValue={profile?.pickupAddressBook}
                                            onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-sm-6">
                                        <label className="form-label">Country</label>
                                        <input type="text" className="form-control"
                                            placeholder="write your country"
                                            name="country"
                                            defaultValue={profile?.country}
                                            onChange={handleInputChange} />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="abc1" className="form-label">Birthday date</label>
                                        <input type="date" className="form-control w-100"
                                            id="abc1"
                                            max={new Date().toISOString().split('T')[0]}
                                            placeholder="1980-03-19"
                                            defaultValue={profile?.birthday}
                                            name="birthday"
                                            onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="row g-3 mb-3">
                                    <div className="col-sm-6">
                                        <label htmlFor="mailid" className="form-label">Mail</label>
                                        <input type="text" disabled
                                            className="form-control"
                                            id="mailid"
                                            defaultValue={profile?.email} />
                                    </div>
                                    <div className="col-sm-6">
                                        <label htmlFor="phoneid" className="form-label">Phone</label>
                                        <PhoneInput
                                            inputProps={{
                                                name: "phone",
                                                required: true,
                                                className: "form-control w-100",
                                                autoFocus: true,
                                            }}
                                            value={`${profile?.dialCode}${profile?.contactNumber}`}
                                            onChange={phoneInput}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                    </Modal.Body>
                    <div className="modal-footer" onClick={() => { setIsmodal(false) }}>
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        {!disableBtn ? <button type="submit" className="btn btn-primary"
                            onClick={() => {
                                editProfile();
                            }}>Save
                        </button> : <button disabled type="submit" className="btn btn-primary">Loading...
                        </button>}
                    </div>
                </div>
            </Modal>
        </>
    );
};