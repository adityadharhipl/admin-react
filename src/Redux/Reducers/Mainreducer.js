const initialState = {
    username: '',
    darkMode: '',
    highcontrast: '',
    openmodal: false,
    openhelp: false,
    rtlmode: false,
    gradient: '',
    addimage: '',
    imgvalidation: '',
    images: [],
    product: []
}

const Mainreducer = (state = initialState, action) => {
    switch (action.type) {

        case 'ADD_IMAGES':
            return {
                ...state,
                images: [...state.images, ...action.payload]
            };

        case 'DELETE_IMAGE':
            return {
                ...state,
                images: state.images.filter((_, index) => index !== action.payload)
            };

        case 'USER_NAME': {

            return {
                ...state,
                username: action.payload
            }
        }
        case 'OPEN_MODAL': {

            return {
                ...state,
                openmodal: action.payload
            }
        }
        case 'SECOND': {

            return {
                ...state,
                second: action.payload
            }
        }
        case 'DARK_MODE': {

            return {
                ...state,
                darkMode: action.payload
            }
        }
        case 'HIGH_CONTRAST': {

            return {
                ...state,
                highcontrast: action.payload
            }
        }
        case 'GRADIENT_COLOR': {
            return {
                ...state,
                gradient: action.payload
            }
        }
        case 'ADD_IMAGE': {
            return {
                ...state,
                addimage: action.payload
            }

        }
        case 'IMAGE_VALIDATION': {
            return {
                ...state,
                imgvalidation: 'it is more then 10 mb'
            }

        }
        case 'ADD_PRODUCT_REQUEST':
            return {
                ...state,
                loading: true,
                error: null
            };

        case 'ADD_PRODUCT_SUCCESS':
            return {
                ...state,
                loading: false,
                product: action.payload,
                error: null,
            };

        case 'ADD_PRODUCT_FAILURE':
            return {
                ...state,
                loading: false,
                product: null,
                error: action.payload,
            };

        case 'ADD_BRAND_REQUEST':
            return {
                ...state,
                loading: true,
                error: null
            };

        case 'ADD_BRAND_SUCCESS':
            return {
                ...state,
                loading: false,
                brand: action.payload,
                error: null,
            };

        case 'ADD_BRAND_FAILURE':
            return {
                ...state,
                loading: false,
                brand: null,
                error: action.payload,
            };

        default: {
            return state
        }
    }

}

export default Mainreducer;