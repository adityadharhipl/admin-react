import axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import 'react-phone-input-2/lib/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategory } from '../../Redux/Reducers/CategoryReducer';

function SkillsEdit() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const category = useSelector((state) => state?.CategoryReducer?.category);

    useEffect(() => {
        dispatch(fetchCategory(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (category) {
            setValue('name', category?.category?.name || '');
        }
    }, [category, setValue]);

    const onSubmit = (data) => {
        const config = {
            method: 'PUT',
            maxBodyLength: Infinity,
            url: `${process.env.REACT_APP_BASEURL}/categories/${id}?name=${data.name}`,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        axios.request(config)
            .then((response) => {
                toast.success("Updated Successfully");
                if (response.status) {
                    navigate('/skills-list');
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error(error.response.data.msg);
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
                        <button type="submit" className="btn btn-primary text-uppercase px-3">SAVE</button>
                        <Link to="/skills-list" className="btn btn-primary text-uppercase px-3 mx-2">Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default SkillsEdit;