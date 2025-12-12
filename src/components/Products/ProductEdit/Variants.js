import React, { useEffect, useState } from 'react';
import { connect, useSelector } from 'react-redux';
import { uploadImagecertifates } from '../../../Redux/Actions/Action';
import { MdDeleteOutline } from "react-icons/md";
import ImageUpload from './ImageUpload';
import VariantForm from './VariantForm';

const Variants = (props) => {
    const initialImages = props?.Mainreducer?.images?.length === 0
        ? Array(4)?.fill(null)
        : props?.Mainreducer?.images;

    const products = useSelector((state) => state?.ProductReducer?.products);

    const [variants, setVariants] = useState([
        {
            images: initialImages,
            attributes: [],
            inventory: 10,
            minOrderQuantity: 1,
            retailPrice: '',
            salePrice: ''
        }
    ]);

    useEffect(() => {
        if (products && products?.productVariants) {
            setVariants(products?.productVariants.map(variant => ({
                images: variant.images || Array(4)?.fill(null),
                attributes: variant.attributes || [],
                inventory: variant.inventory || 10,
                minOrderQuantity: variant.minOrderQuantity || 1,
                retailPrice: variant.retailPrice || '',
                salePrice: variant.salePrice || ''
            })));
        }
    }, [products]);

    useEffect(() => {
        props.variantDetails(variants);
    }, [variants])

    const [loading, setLoading] = useState(false);

    const handleInputChange = async (event, variantIndex) => {
        const files = Array.from(event.target.files);
        setLoading(true);
        try {
            const updatedImages = Array(files.length).fill(null);
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const liveUrl = await props.uploadImagecertifates(file);
                updatedImages[i] = liveUrl;
            }
            updateVariantImages(variantIndex, updatedImages);
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = (variantIndex, imageIndex) => {
        const updatedVariants = [...variants];
        const updatedImages = updatedVariants[variantIndex]?.images?.map((img, idx) => (idx === imageIndex ? null : img));
        updateVariantImages(variantIndex, updatedImages);
    };

    const updateVariantImages = (variantIndex, updatedImages) => {
        const updatedVariants = [...variants];
        updatedVariants[variantIndex].images = updatedImages;
        setVariants(updatedVariants);
    };

    const handleAddVariant = () => {
        const newVariant = {
            images: Array(4)?.fill(null),
            attributes: [{ attribute: null, value: [] }],
            inventory: 10,
            minOrderQuantity: 1,
            retailPrice: '',
            salePrice: ''
        };
        setVariants([...variants, newVariant]);
    };

    const handleRemoveVariant = (variantIndex) => {
        const updatedVariants = variants?.filter((_, idx) => idx !== variantIndex);
        setVariants(updatedVariants);
    };

    const handleDuplicateVariant = (variantIndex) => {
        const variantToDuplicate = variants[variantIndex];
        const newVariant = {
            ...variantToDuplicate,
            id: variants.length + 1
        };
        setVariants([...variants, newVariant]);
    };

    const handleFieldChange = (e, variantIndex, field) => {
        const { value } = e.target;
        setVariants((prevVariants) => {
            const updatedVariants = [...prevVariants];
            updatedVariants[variantIndex] = {
                ...updatedVariants[variantIndex],
                [field]: value
            };
            props.variantDetails(updatedVariants);
            return updatedVariants;
        });
    };

    const handleSelectChange = (selectedOptions, variantIndex, field) => {
        const updatedVariants = [...variants];
        updatedVariants[variantIndex][field] = selectedOptions;
        setVariants(updatedVariants);
    };

    return (
        <>
            {variants?.map((variant, index) => (
                <div key={index} className="variant-container position-relative">
                    <div className="card-header py-3 d-flex justify-content-between bg-transparent border-bottom-0">
                        <h6 className="mb-0 fw-bold">Product Variant {index + 1}</h6>
                    </div>
                    <div className="card-body">
                        <form>
                            <div className="row g-3">
                                <ImageUpload
                                    images={variant.images}
                                    onRemoveImage={(imageIndex) => handleRemoveImage(index, imageIndex)}
                                    onUploadImages={(event) => handleInputChange(event, index)}
                                    loading={loading}
                                />
                                <VariantForm
                                    subCatId={props?.subCatId}
                                    variant={variants[index]}
                                    index={index}
                                    products={products}
                                    onFieldChange={handleFieldChange}
                                    onSelectChange={handleSelectChange}
                                    onAddVariant={handleAddVariant}
                                    onDuplicateVariant={handleDuplicateVariant}
                                />
                            </div>
                        </form>
                    </div>
                    {index > 0 && (
                        <div className='position-absolute top-0 end-0'>
                            <button className='btn d-inline-flex pt-2 mt-1' style={{ fontSize: '25px' }} onClick={() => handleRemoveVariant(index)}>
                                <MdDeleteOutline style={{ color: 'red' }} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
};

const mapStateToProps = ({ Mainreducer }) => ({
    Mainreducer
});

export default connect(mapStateToProps, {
    uploadImagecertifates
})(Variants);