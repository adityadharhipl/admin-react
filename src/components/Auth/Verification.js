import React from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Images from '../../assets/images/verify.svg';

function Verification() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const onSubmit = () => {
        axios.post(`${process.env.REACT_APP_BASEURL}/seller_verifyotp?id=${id}`, {
            mobileOtp: 1234
        }, {
            headers: { 'Content-Type': 'application/json' },
            maxBodyLength: Infinity
        }).then(() => {
            navigate("/sign-in");
        }).catch((error) => {
            console.error('Verification failed:', error);
        });
    };

    const handleInputChange = (e, index) => {
        const { value } = e.target;
        if (/^\d$/.test(value)) {
            setValue(`code${index}`, value);
            if (index < 4) {
                document.getElementById(`code${index + 1}`).focus();
            }
        } else if (value === '') {
            setValue(`code${index}`, '');
        }
    };

    const handleKeyDown = (e, index) => {
        const { key } = e;
        if (key === 'Backspace' && !e.target.value) {
            if (index > 1) {
                document.getElementById(`code${index - 1}`).focus();
            }
        }
    };

    return (
        <div className="w-100 p-3 p-md-5 card border-0 shadow-sm" style={{ maxWidth: '32rem' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="row g-1 p-3 p-md-4">
                <div className="col-12 text-center mb-5">
                    <img src={Images} className="w240 mb-4" alt="" />
                    <h1>Verification</h1>
                    <span>We sent a verification code to your email. Enter the code from the email in the field below.</span>
                </div>
                {[1, 2, 3, 4]?.map((index) => (
                    <div className="col" key={index}>
                        <div className="mb-2">
                            <input
                                {...register(`code${index}`, { required: "Code is required." })}
                                type="text"
                                id={`code${index}`}
                                maxLength="1"
                                className="form-control form-control-lg text-center"
                                placeholder="-"
                                onChange={(e) => handleInputChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                            {errors[`code${index}`] && <span className="text-danger">{errors[`code${index}`].message}</span>}
                        </div>
                    </div>
                ))}
                <div className="col-12 text-center mt-4">
                    <button type="submit" className="btn btn-lg btn-block btn-light lift text-uppercase">Verify my account</button>
                </div>
                <div className="col-12 text-center mt-4">
                    <span>Haven't received it? <Link to="#!" className="text-secondary">Resend a new code.</Link></span>
                </div>
            </form>
        </div>
    );
}

export default Verification;