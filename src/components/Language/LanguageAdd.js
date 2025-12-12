import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

function LanguageEdit() {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [isPrefilling, setIsPrefilling] = useState(false); 

  const token = localStorage.getItem('User-admin-token');

  useEffect(() => {
    
    if (id) {
      setIsPrefilling(true); 
      const fetchLanguage = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BASEURL}/admin/language/${id}`,
            {
              headers: {
                Authorization: token,
                'Content-Type': 'application/json',
              },
            }
          );
          const languageData = response?.data?.data;
          setValue('languageName', languageData?.languageName); 
        } catch (error) {
          toast.error('Failed to fetch language details');
        } finally {
          setIsPrefilling(false); 
        }
      };

      fetchLanguage();
    }
  }, [id, setValue, token]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (id) {
        
        await axios.patch(
          `${process.env.REACT_APP_BASEURL}/admin/language/${id}`,
          { languageName: data.languageName },
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        toast.success('Language updated successfully!');
      } else {
        
        await axios.post(
          `${process.env.REACT_APP_BASEURL}/admin/language`,
          { languageName: data.languageName },
          {
            headers: {
              Authorization: `${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        toast.success('Language added successfully!');
      }
      navigate('/language-list');
    } catch (error) {
      toast.error(id ? 'Failed to update language' : 'Language is already added');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster  />
      <div className="card-body">
        {isPrefilling ? ( 
          <p>Loading...</p>
        ) : (
          <form className="row g-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="col-sm-6">
              <label className="form-label">Language Name</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter language name (e.g. Hindi)"
                {...register('languageName', { required: 'Language Name is required' })}
              />
              {errors.languageName && <span className="text-danger">{errors.languageName.message}</span>}
            </div>

            {/* Submit Button */}
            <div className="col-12 mt-4">
              <button type="submit" className="btn btn-primary text-uppercase px-3" disabled={isLoading}>
                {isLoading ? (id ? 'Updating...' : 'Adding...') : (id ? 'Update' : 'Add')}
              </button>
              <button
                type="button"
                className="btn btn-secondary text-uppercase px-3 mx-2"
                onClick={() => navigate('/language-list')}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

export default LanguageEdit;
