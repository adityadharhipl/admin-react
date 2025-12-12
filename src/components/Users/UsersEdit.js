import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import 'react-phone-input-2/lib/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from "../../Redux/Reducers/UsersReducer";

function EditInformation() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const user = useSelector((state) => state?.UsersReducer?.users?.data);
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    useEffect(() => {
        dispatch(fetchUsers(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (user) {
            setValue('fullName', user?.fullName);
            setValue('email', user?.email);
            setValue('mobileNumber', user?.mobileNumber);
            setValue('dob', user?.dob);
            setValue('pincode', user?.pincode);
            setValue('state', user?.state);
            setValue('city', user?.city);
            setValue('houseNo', user?.houseNo);
            setValue('landmark', user?.landmark);
            setValue('street', user?.street);
        }
    }, [user, setValue]);

    const onSubmit = (data) => {
        const formData = new FormData();
        if (data.fullName) formData.append('fullName', data.fullName);
        if (data.mobileNumber) formData.append('mobileNumber', data.mobileNumber);
        if (data.dob) formData.append('dob', data.dob);
        if (data.pincode) formData.append('pincode', data.pincode);
        if (data.state) formData.append('state', data.state);
        if (data.city) formData.append('city', data.city);
        if (data.houseNo) formData.append('houseNo', data.houseNo);
        if (data.landmark) formData.append('landmark', data.landmark);
        if (data.street) formData.append('street', data.street);
        const config = {
            method: 'patch',
            maxBodyLength: Infinity,
            url: `${process.env.REACT_APP_BASEURL}/user/profile/${id}/`,
            headers: {
                'accept': 'application/json',
            },
            data: formData,
        };

        axios.request(config)
            .then((response) => {
                toast.success("Updated Successfully");
                if (response.status) {
                    navigate('/users-list');
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error(error.response.data);
            });
    };

    return (
        <>
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h6 className="mb-0 fw-bold">Edit information</h6>
            </div>
            <div className="card-body">
                <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                className="form-control"
                                type="text"
                                {...register('fullName', {
                                    required: 'First Name is required',
                                })}
                            />
                            {errors.fullName && <span className="text-danger">{errors.fullName.message}</span>}
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                className="form-control"
                                type="email"
                                id="email"
                                name="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                })}
                            />
                            {errors.email && <span className="text-danger">{errors.email.message}</span>}
                            {errors.email?.type === 'pattern' && <span className="text-danger">Invalid Email Address</span>}
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Mobile number</label>
                            <input
                                placeholder='Enter Mobile No.'
                                className="form-control"
                                name="mobileNumber"
                                disabled
                                {...register('mobileNumber')}
                            />
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Date of birth</label>
                            <input
                                className="form-control"
                                name="dob"
                                type='date'
                                {...register('dob')}
                            />
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Pincode</label>
                            <input
                                placeholder='Enter Pincode'
                                className="form-control"
                                name="pincode"
                                {...register('pincode')}
                            />
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                                placeholder='Enter City'
                                className="form-control"
                                name="city"
                                {...register('city')}
                            />
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">State</label>
                            <input
                                placeholder='Enter State'
                                className="form-control"
                                name="state"
                                {...register('state')}
                            />
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Street</label>
                            <input
                                placeholder='Enter Street'
                                className="form-control"
                                name="street"
                                {...register('street')}
                            />
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">House No.</label>
                            <input
                                placeholder='Enter House no.'
                                className="form-control"
                                name="houseNo"
                                {...register('houseNo')}
                            />
                        </div>
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Landmark</label>
                            <input
                                placeholder='Enter Landmark'
                                className="form-control"
                                name="landmark"
                                {...register('landmark')}
                            />
                        </div>
                    </div>

                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary text-uppercase px-3">SAVE</button>
                        <Link to="/users-list" className="btn btn-primary text-uppercase px-3 mx-2">Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default EditInformation;