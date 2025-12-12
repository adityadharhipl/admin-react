// import React, { useRef, useState } from 'react';
// import { ImEye, ImEyeBlocked } from "react-icons/im";
// import { Link } from 'react-router-dom';
// import axios from 'axios';
// import { useForm } from 'react-hook-form';
// import toast, { Toaster } from 'react-hot-toast';

// function SignIn() {
//     const { register, handleSubmit, formState: { errors } } = useForm({
//         mode: "onSubmit",
//         reValidateMode: "onChange"
//     });

//     const dashboardLinkRef = useRef(null);
//     const [showPassword, setShowPassword] = useState(false);

//     const onSubmit = (data) => {
//         const isSpecialAdmin =
//             data.email.toLowerCase() === process.env.REACT_APP_SPECIAL_ADMIN_EMAIL?.toLowerCase();

//         const loginUrl = isSpecialAdmin
//             ? `${process.env.REACT_APP_BASEURL}/admin/login/`
//             : `${process.env.REACT_APP_BASEURL}/admin/member/login/`;

//         axios
//             .post(loginUrl, {
//                 email: data.email,
//                 password: data.password,
//             })
//             .then((response) => {
//                 const isSuccess = response?.data?.status || response?.data?.success;

//                 if (!isSuccess) {
//                     toast.error(response?.data?.message || "Login failed");
//                     return;
//                 }

//                 let token = "";
//                 let userData = null;
//                 console.log(response.data, 'response.data');

//                 // ✅ Case 1: Admin Login Format
//                 if (response.data.accessToken && response.data.userData) {
//                     token = response.data.accessToken;
//                     userData = { ...response.data.userData, parentId: response?.data?.parentId || '' };
//                 }

//                 // ✅ Case 2: Member Login Format
//                 else if (response.data.data?.token && response.data.data?.user) {
//                     token = response.data.data.token;
//                     userData = { ...response.data.data.user, parentId: response.data.data?.parentId || '' };
//                 }

//                 // ❌ Missing token or userData
//                 if (!token || !userData) {
//                     toast.error("Login response missing token or user data");
//                     return;
//                 }


//                 localStorage.setItem("User-admin-token", token);
//                 localStorage.setItem("User-admin-data", JSON.stringify(userData));


//                 const privileges = Array.isArray(userData?.role?.privileges)
//                     ? userData.role.privileges
//                     : [];

//                 const firstRoute = privileges[0] || "/dashboard";
//                 console.log("Redirecting to:", firstRoute);
//                 window.location.href = firstRoute;
//             })
//             .catch((error) => {
//                 toast.error(error?.response?.data?.message || "Login failed");
//             });
//     };



//     const inputGroupStyle = {
//         display: 'flex',
//         alignItems: 'center',
//         position: 'relative'
//     };

//     const inputStyle = {
//         paddingRight: '40px'
//     };

//     const iconStyle = {
//         position: 'absolute',
//         right: '10px',
//         cursor: 'pointer'
//     };

//     return (
//         <>
//             <Toaster position="top-center" reverseOrder={true} duration="10000" />
//             <div className="col-lg-6 d-flex justify-content-center align-items-center border-0 rounded-lg auth-h100">
//                 <div className="w-100 p-3 p-md-5 card border-0 shadow-sm" style={{ maxWidth: "32rem" }}>
//                     <form className="row g-1 p-3 p-md-4 mt-5" onSubmit={handleSubmit(onSubmit)}>
//                         <div className="col-12 text-center mb-0">
//                             <h1>Sign in</h1>
//                         </div>

//                         <div className="col-12">
//                             <div className="mb-2">
//                                 <label className="form-label">Email address</label>
//                                 <input
//                                     {...register("email", { required: "Email is required." })}
//                                     type="email"
//                                     className="form-control form-control-lg"
//                                     placeholder="name@example.com"
//                                     onChange={(e) => e.target.value = e.target.value.toLowerCase()}
//                                 />
//                                 {errors.email && <span className="text-danger">{errors.email.message}</span>}
//                             </div>
//                         </div>

//                         <div className="col-12">
//                             <div className="mb-2">
//                                 <div className="form-label d-flex justify-content-between align-items-center">
//                                     Password
//                                     <Link className="text-secondary" to="/reset-password">Forgot Password?</Link>
//                                 </div>
//                                 <div style={inputGroupStyle}>
//                                     <input
//                                         {...register("password", { required: "Password is required." })}
//                                         type={showPassword ? "text" : "password"}
//                                         className="form-control form-control-lg"
//                                         placeholder="Pa$$w0rd!"
//                                         style={inputStyle}
//                                     />
//                                     <div style={iconStyle}>
//                                         {showPassword
//                                             ? <ImEyeBlocked onClick={() => setShowPassword(false)} />
//                                             : <ImEye onClick={() => setShowPassword(true)} />}
//                                     </div>
//                                 </div>
//                                 {errors.password && <span className="text-danger">{errors.password.message}</span>}
//                             </div>
//                         </div>

//                         <div className="col-12 text-center mt-4">
//                             <button type="submit" className="btn btn-lg btn-block btn-light lift text-uppercase">SIGN IN</button>
//                             <a ref={dashboardLinkRef} href="/dashboard" style={{ display: 'none' }}>Go to Dashboard</a>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </>
//     );
// }

// export default SignIn;
import React, { useState } from 'react';
import { ImEye, ImEyeBlocked } from "react-icons/im";

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = () => {
        // Simply redirect to dashboard
        window.location.href = "/dashboard";
    };

    const inputGroupStyle = {
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
    };

    const inputStyle = {
        paddingRight: '40px'
    };

    const iconStyle = {
        position: 'absolute',
        right: '10px',
        cursor: 'pointer'
    };

    return (
        <div className="col-lg-6 d-flex justify-content-center align-items-center auth-h100">
            <div className="w-100 p-3 p-md-5 card border-0 shadow-sm" style={{ maxWidth: "32rem" }}>
                <div className="row g-1 p-3 p-md-4 mt-5">
                    <div className="col-12 text-center mb-0">
                        <h1>Sign in</h1>
                    </div>

                    <div className="col-12">
                        <div className="mb-2">
                            <label className="form-label">Email address</label>
                            <input
                                type="email"
                                className="form-control form-control-lg"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="col-12">
                        <div className="mb-2">
                            <label className="form-label">Password</label>
                            <div style={inputGroupStyle}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control form-control-lg"
                                    placeholder="Pa$$w0rd!"
                                    style={inputStyle}
                                />
                                <div style={iconStyle}>
                                    {showPassword
                                        ? <ImEyeBlocked onClick={() => setShowPassword(false)} />
                                        : <ImEye onClick={() => setShowPassword(true)} />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 text-center mt-4">
                        <button
                            onClick={handleSignIn}
                            className="btn btn-lg btn-block btn-light lift text-uppercase"
                        >
                            SIGN IN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
