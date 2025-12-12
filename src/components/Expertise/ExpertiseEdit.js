import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import CreatableSelect from "react-select/creatable";
import Select from 'react-select';
import 'react-phone-input-2/lib/style.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInterests } from '../../Redux/Reducers/InterestsReducer';
import { fetchCategory } from '../../Redux/Reducers/CategoryReducer';

function EditInformation() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const categories = useSelector(state => state?.CategoryReducer?.category);
    const interest = useSelector(state => state?.InterestsReducer?.interests);

    const [interests, setInterests] = useState([]);
    const [initialInterests, setInitialInterests] = useState([]);

    useEffect(() => {
        dispatch(fetchInterests(id));
        dispatch(fetchCategory(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (interest && interest.results?.length > 0) {
            const existingInterests = categories?.interests?.map((int) => ({
                label: int.name,
                value: int._id
            }));
            setInterests(existingInterests);
            setInitialInterests(existingInterests);
        }
    }, [interest]);

    const handleInterestChange = (selectedOptions) => {
        const updatedInterests = selectedOptions || [];
        const removedInterests = initialInterests.filter(
            initial => !updatedInterests.find(option => option.value === initial.value)
        );
        removedInterests.forEach(interest => {
            deleteInterest(interest.value);
        });
        setInterests(updatedInterests);
    };

    const onSubmit = (data) => {
        let newInterests = interests.filter(interest => !initialInterests.some(initial => initial.value === interest.value));
        data.interests = newInterests?.map(interest => interest.label);

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.REACT_APP_BASEURL}/interests/add-interests/?category_id=${id}`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: JSON.stringify(data.interests),
        };

        axios.request(config)
            .then((response) => {
                toast.success("Added Successfull!");
                if (response.status) {
                    navigate('/expertise-list');
                }
            })
            .catch((error) => {
                console.error(error);
                toast.error(error.response.data);
            });
    };

    async function deleteInterest(id) {
        try {
            await axios.delete(`${process.env.REACT_APP_BASEURL}/interests/${id}/`);
            toast.success("Interest deleted successfully");
        } catch (error) {
            console.error('Error deleting interest:', error);
        }
    }

    return (
        <>
            <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                <h6 className="mb-0 fw-bold">Edit information</h6>
            </div>
            <div className="card-body">
                <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <span style={{ color: "red" }}>*</span>
                        <Select
                            isDisabled
                            placeholder="Select Category"
                            {...register("category")}
                            value={{
                                label: categories?.category?.name,
                                value: categories?.category?._id,
                            }}
                        />
                        {errors.category && <span className="text-danger">{errors.category.message}</span>}
                    </div>

                    <div className="col-sm-6">
                        <div className="form-group">
                            <label className="form-label">Interests</label>
                            <span style={{ color: "red" }}>*</span>
                            <CreatableSelect
                                value={interests}
                                isMulti
                                noOptionsMessage={() => "Type to create"}
                                placeholder="Type to create"
                                onChange={handleInterestChange}
                            />
                            {errors.interests && (
                                <span className="text-danger">
                                    {errors.interests.message}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary text-uppercase px-3">SAVE</button>
                        <Link to="/expertise-list" className="btn btn-primary text-uppercase px-3 mx-2">Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

export default EditInformation;