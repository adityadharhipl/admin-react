import FormData from 'form-data';

export const Product = (productData, id) => {
    return async (dispatch) => {
        dispatch({ type: 'ADD_PRODUCT_REQUEST' });
        try {
            const url = id ? `${process.env.REACT_APP_BASEURL}/product${id}` : `${process.env.REACT_APP_BASEURL}/product`;
            const method = id ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...productData })
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            const data = await response?.json();

            dispatch({
                type: 'ADD_PRODUCT_SUCCESS',
                payload: data,
            });
            return data;
        } catch (error) {
            dispatch({
                type: 'ADD_PRODUCT_FAILURE',
                payload: error.message
            });
            throw error;
        }
    };
};

export const Brands = (brandData, id) => {
    return async (dispatch) => {
        dispatch({ type: 'ADD_BRAND_REQUEST' });
        try {
            const url = id ? `${process.env.REACT_APP_BASEURL}/brand${id}` : `${process.env.REACT_APP_BASEURL}/brand`;
            const method = id ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...brandData })
            });

            if (!response.ok) {
                throw new Error('Failed to add brand');
            }

            const data = await response?.json();

            dispatch({
                type: 'ADD_BRAND_SUCCESS',
                payload: data,
            });
            return data;
        } catch (error) {
            dispatch({
                type: 'ADD_BRAND_FAILURE',
                payload: error.message
            });
            throw error;
        }
    };
};

export const Service = (serviceData, id) => {
    return async (dispatch) => {
        dispatch({ type: 'ADD_SERVICE_REQUEST' });
        try {
            const url = id ? `${process.env.REACT_APP_BASEURL}/service${id}` : `${process.env.REACT_APP_BASEURL}/service`;
            const method = id ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...serviceData })
            });

            if (!response.ok) {
                throw new Error('Failed to add service');
            }

            const data = await response?.json();

            dispatch({
                type: 'ADD_SERVICE_SUCCESS',
                payload: data,
            });
            return data;
        } catch (error) {
            dispatch({
                type: 'ADD_SERVICE_FAILURE',
                payload: error.message
            });
            throw error;
        }
    };
};

// Action for uploading images
export const uploadImagecertifates = (file) => async (dispatch) => {
    const data = new FormData();
    data.append('file', file);

    try {
        const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/imageUpload`, {
            method: 'POST',
            body: data
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const responseData = await response.json();
        const imgUrl = responseData?.data?.img;
        return imgUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const uploadMultipleImages = (files) => async (dispatch) => {
    const formData = new FormData();

    // Append each file to FormData
    files.forEach((file) => {
        formData.append('files', file);
    });

    try {
        const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/uploadFiles`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload images');
        }

        const responseData = await response.json();
       

        // Extract uploaded image URLs
        const imgUrls = responseData?.data?.img

 return imgUrls
        dispatch({
            type: 'ADD_IMAGES',
            payload: imgUrls
        });

        return imgUrls;
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    }
};


export const OnchangeAddimage = (files) => {
    return async (dispatch) => {
        const validFiles = Array.from(files).filter(file => file instanceof File || typeof file === 'string');

        if (validFiles?.length > 0) {
            const file = validFiles[0];

            if (file instanceof File) {
                // Dispatch the uploadImagecertifates action creator and wait for its result
                const imageUrl = await dispatch(uploadImagecertifates(file));

                dispatch({
                    type: 'ADD_IMAGES',
                    payload: imageUrl
                });
            } else {
                // If the file is already a string (URL), directly dispatch it
                dispatch({
                    type: 'ADD_IMAGES',
                    payload: file
                });
            }
        }
    };
};

export const deleteImage = (index) => {
    return {
        type: 'DELETE_IMAGE',
        payload: index
    };
};

// export const OnchangeAddimage = (files) => {
//     return (dispatch) => {
//         const validFiles = Array.from(files).filter(file => file instanceof File);

//         const imageObjects = validFiles.map(file => {
//             const imageUrl = URL.createObjectURL(file);
//             return {
//                 productImg: imageUrl,
//                 productTagName: '',
//                 color: '#ffffff',
//                 quantity: 1,
//                 newPrice: 0
//             };
//         });

//         dispatch({
//             type: 'ADD_IMAGES',
//             payload: imageObjects
//         });
//     };
// };

export const Onchangeusername = (e) => (dispatch) => {
    dispatch({
        type: 'USER_NAME',
        payload: e
    })
}

export const onChangeDarkMode = (val) => (dispatch) => {

    if (val === 'dark') {
        window.document.children[0].setAttribute('data-theme', 'dark');
    } else if (val === 'high-contrast') {
        //window.document.children[0].setAttribute('data-theme', 'light')
    } else {
        window.document.children[0].setAttribute('data-theme', 'light')
    }
    dispatch({
        type: 'DARK_MODE',
        payload: val
    })
    dispatch({
        type: 'HIGH_CONTRAST',
        payload: val
    })
}
export const onChangeHighcontrast = (val) => (dispatch) => {

    if (val === 'high-contrast') {
        window.document.children[0].setAttribute('data-theme', 'high-contrast');
    } else if (val === 'dark') {
        window.document.children[0].setAttribute('data-theme', 'light')
    }
    else {
        window.document.children[0].setAttribute('data-theme', 'light')
    }
    dispatch({
        type: 'HIGH_CONTRAST',
        payload: val
    })
    dispatch({
        type: 'DARK_MODE',
        payload: val
    })
}
export const OnchangeRTLmode = (val) => (dispatch) => {

    if (document.body.classList.contains("rtl_mode")) {
        document.body.classList.remove("rtl_mode")
    } else {
        document.body.classList.add("rtl_mode");
    }

    dispatch({
        type: 'rtl_mode',
        payload: val
    })
}
export const Onopenmodalsetting = (val) => (dispatch) => {

    dispatch({
        type: 'OPEN_MODAL',
        payload: val
    })
}
export const OnGradientColor = (val) => (dispatch) => {
    var theme = document.getElementById("mainsidemenu");
    if (theme) {
        if (!theme.classList.contains('gradient')) {
            theme.classList.add('gradient');
            dispatch({
                type: 'GRADIENT_COLOR',
                payload: true
            })
        }
        else {
            theme.classList.remove('gradient');
            dispatch({
                type: 'GRADIENT_COLOR',
                payload: false
            })
        }
    }

}