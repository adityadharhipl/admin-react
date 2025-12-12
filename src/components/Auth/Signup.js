import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
// Mixpanel tracking removed

function Signup() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setError } = useForm();

    const [showPassword, setShowPassword] = useState(false);

    // Mixpanel tracking removed

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const onSubmit = (data) => {
        axios.post(`${process.env.REACT_APP_BASEURL}/seller_signup`, data)
            .then((response) => {
                if (response?.data?.status) {
                    navigate(process.env.PUBLIC_URL + `/verification/${response.data?.result?._id}`)
                } else {
                    toast.error(response?.data?.message)
                }
            })
            .catch((error) => {
                setError("submitError", {
                    type: "manual",
                    message: "Failed to sign up. Please try again later."
                });
            });
    };

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={true}
                duration="10000"
            />
            <div className="col-lg-6 d-flex justify-content-center align-items-center border-0 rounded-lg auth-h100">
                <div className="w-100 p-3 p-md-5 card border-0 shadow-sm" style={{ maxWidth: '32rem' }}>
                    <form onSubmit={handleSubmit(onSubmit)} className="row g-1 p-3 p-md-4">
                        <div className="col-12 text-center mb-5">
                            <h1>Create your account</h1>
                            <span>Free access to our dashboard.</span>
                        </div>
                        <div className="col-12">
                            <div className="mb-2">
                                <label className="form-label">Email address</label>
                                <input {...register("email", { required: "Email is required." })}
                                    type="email"
                                    className="form-control form-control-lg"
                                    placeholder="name@example.com"
                                    onChange={(e) => e.target.value = e?.target?.value.toLowerCase()} />
                                {errors.email && <span className="text-danger">{errors.email.message}</span>}
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="mb-2 position-relative">
                                <label className="form-label">Password</label>
                                <input
                                    {...register("password", { required: "Password is required." })}
                                    type={showPassword ? "text" : "password"}
                                    className="form-control form-control-lg"
                                    placeholder="6+ characters required"
                                />
                                <span
                                    className="position-absolute end-0 top-50 bottom-50 translate-middle-y me-3 cursor-pointer"
                                >
                                    <i className={`icofont-${showPassword ? 'eye' : 'eye-blocked'}`}
                                        onClick={togglePasswordVisibility}
                                    ></i>
                                </span>
                                {errors.password && <span className="text-danger">{errors.password.message}</span>}
                            </div>
                        </div>
                        <div className="mb-2 position-relative">
                            <label className="form-label">Confirm Password</label>
                            <input
                                {...register("confirmPassword", { required: "Confirm Password is required." })}
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control form-control-lg"
                                placeholder="6+ characters required"
                            />
                            <span
                                className="position-absolute end-0 top-50 bottom-50 translate-middle-y me-3 cursor-pointer"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                <i className={`icofont-${showConfirmPassword ? 'eye' : 'eye-blocked'}`}></i>
                            </span>
                            {errors.confirmPassword && <span className="text-danger">{errors.confirmPassword.message}</span>}
                        </div>
                        <div className="col-12">
                            <div className="form-check">
                                <input {...register("acceptTerms", { required: "You must accept the terms and conditions." })} className="form-check-input" type="checkbox" id="acceptTerms" />
                                <label className="form-check-label" htmlFor="acceptTerms">
                                    I accept the <Link to="#" title="Terms and Conditions" className="text-secondary">Terms and Conditions</Link>
                                </label>
                                {errors.acceptTerms && <span className="text-danger">{errors.acceptTerms.message}</span>}
                            </div>
                        </div>
                        <div className="col-12 text-center mt-4">
                            <button type="submit" className="btn btn-lg btn-block btn-light lift text-uppercase">SIGN UP</button>
                            {errors.submitError && <span className="text-danger">{errors.submitError.message}</span>}
                        </div>
                        <div className="col-12 text-center mt-4">
                            <span>Already have an account? <Link to={process.env.PUBLIC_URL + '/sign-in'} title="Sign in" className="text-secondary">Sign in here</Link></span>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
export default Signup;