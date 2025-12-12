import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

function SkillsAdd() {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            let jsonData = JSON.stringify(data);
            console.log(jsonData, "jsonData")
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.REACT_APP_BASEURL}/categories/?name=${data.name}`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: jsonData
            };

            const response = await axios.request(config);
            toast.success("Category created successfully");
            if (response?.status == 200) {
                navigate("/skills-list");
            }
        } catch (error) {
            console.error('Team staff submission error: ', error);
            toast.error(error?.response?.data?.name[0]);
        }
    };

    return (
        <>
            <div className="card-body">
                <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Category Name <span className="text-danger">*</span></label>
                            <input
                                className="form-control"
                                type="text"
                                name="name"
                                placeholder='Enter category name'
                                {...register('name', {
                                    required: "This field is required",
                                })}
                            />
                            {errors.name && <span className="text-danger">{errors.name.message}</span>}
                        </div>
                    </div>

                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary text-uppercase px-5">SAVE</button>
                        <Link to="/skills-list" type="button" className="btn btn-primary text-uppercase px-5 mx-2">CANCEL</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default SkillsAdd;