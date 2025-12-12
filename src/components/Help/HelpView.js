import React from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

function HelpView() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();
    // let localData = JSON.parse(localStorage.getItem("User-admin-data"));

    const onSubmit = async (data) => {
        try {
            // data.sellerId = localData?._id;

            let jsonData = JSON.stringify(data);

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                // url: `${process.env.REACT_APP_BASEURL}/teamStaff_signup`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: jsonData
            };

            const response = await axios.request(config);
            toast.success(response?.data?.message);
            if (response?.data?.status) {
                navigate("/users-list");
            }
        } catch (error) {
            console.error('Team staff submission error: ', error);
            toast.error(error?.message);
        }
    };

    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={true}
                duration="10000"
            />
            <div className="card-body">
                <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input
                                className="form-control"
                                type="email"
                                id="email"
                                name="email"
                                placeholder='Staff email'
                                {...register('email', {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
                                        message: "Invalid Email Address"
                                    },
                                    onChange: (e) => {
                                        e.target.value = e.target.value.toLowerCase();
                                    }
                                })}
                            />
                            {errors.email && <span className="text-danger">{errors.email.message}</span>}
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Password </label>
                            <input
                                className="form-control"
                                type="password"
                                name='password'
                                placeholder='Enter your password'
                                {...register('password', {
                                    required: "Password is required",
                                })}
                            />
                            {errors.password && <span className="text-danger">{errors.password.message}</span>}
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Confirm Password </label>
                            <input
                                className="form-control"
                                type="password"
                                name='cPassword'
                                placeholder='Enter confirm password'
                                {...register('cPassword', {
                                    required: "Confirm password is required",
                                })}
                            />
                            {errors.cPassword && <span className="text-danger">{errors.cPassword.message}</span>}
                        </div>
                    </div>
                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary text-uppercase px-5">SAVE</button>
                        <Link to="/users-list" type="button" className="btn btn-primary text-uppercase px-5 mx-2">CANCEL</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default HelpView;