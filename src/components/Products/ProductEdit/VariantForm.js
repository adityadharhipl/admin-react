import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttribute } from '../../../Redux/Reducers/AttributeReducer';

const VariantForm = ({
    variant,
    index,
    onFieldChange,
    onSelectChange,
    onAddVariant,
    onDuplicateVariant,
    subCatId,
}) => {
    const [attributePairs, setAttributePairs] = useState([{ attribute: null, value: [] }]);

    const dispatch = useDispatch();
    const attributes = useSelector((state) => state?.AttributeReducer?.attribute);
    const products = useSelector((state) => state?.ProductReducer?.products);

    useEffect(() => {
        dispatch(fetchAttribute());
    }, [dispatch]);

    useEffect(() => {
        if (variant?.attributes) {
            const initialPairs = variant.attributes.map(attr => ({
                attribute: { label: attr.attribute?.label, value: attr.attribute?.value },
                value: attr.value.map(val => ({ label: val?.label, value: val.value }))
            }));
            setAttributePairs(initialPairs);
        }
    }, [variant]);

    const getValuesForAttribute = (selectedAttributeId) => {
        const foundAttribute = attributes?.find(item => item._id === selectedAttributeId);
        return foundAttribute ? foundAttribute.value.map((item, idx) => ({
            value: `${foundAttribute._id}-${idx}`,
            label: item
        })) : [];
    };

    const getDefaultAttributeValue = (pair) => {
        return pair.attribute ? { label: pair.attribute.label, value: pair.attribute.value } : null;
    };

    const getDefaultValueValue = (pair) => {
        return pair.value.map(val => ({ label: val.label, value: val.value }));
    };

    const handleAttributeChange = (selectedOption, pairIndex) => {
        const newPairs = [...attributePairs];
        newPairs[pairIndex].attribute = selectedOption;
        newPairs[pairIndex].value = [];
        const newValues = selectedOption ? getValuesForAttribute(selectedOption.value) : [];
        setAttributePairs(newPairs);
        onSelectChange(newPairs, index, 'attributes');
    };

    const handleValueChange = (selectedOptions, pairIndex) => {
        const newPairs = [...attributePairs];
        newPairs[pairIndex].value = selectedOptions;
        setAttributePairs(newPairs);
        onSelectChange(newPairs, index, 'attributes');
    };

    const handleAddPair = () => {
        setAttributePairs(prevPairs => [
            ...prevPairs,
            { attribute: null, value: [] }
        ]);
    };

    const handleRemovePair = (pairIndex) => {
        const newPairs = attributePairs?.filter((_, index) => index !== pairIndex);
        setAttributePairs(newPairs);
        onSelectChange(newPairs, index, 'attributes');
    };

    const handleDuplicateVariant = () => {
        onDuplicateVariant(index);
    };

    let defaultSubCatId = subCatId ? subCatId : products.subCategoryId?._id

    let filteredAttributes = attributes?.filter((item) => item?.subCategoryId?._id === defaultSubCatId);

    return (
        <div className="col-lg-6">
            <div className='d-flex justify-content-between h-100 flex-column'>
                <div>
                    <h6 style={{ fontWeight: '700' }}>Attributes</h6>
                    {attributePairs?.map((pair, pairIndex) => (
                        <div className={`row ${pairIndex > 0 ? 'mt-3' : ''}`} key={pairIndex}>
                            <div className='col-md-10'>
                                <div className='row'>
                                    <div className="col-md-6">
                                        {pairIndex === 0 && <label className="form-label">Attribute</label>}
                                        {pairIndex === 0 && <span style={{ color: "red" }}>*</span>}
                                        <Select
                                            value={getDefaultAttributeValue(pair)}
                                            options={filteredAttributes?.map(item => ({ label: item.attributeName, value: item._id }))}
                                            onChange={(selectedOption) => handleAttributeChange(selectedOption, pairIndex)}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        {pairIndex === 0 && <label className="form-label">Value</label>}
                                        {pairIndex === 0 && <span style={{ color: "red" }}>*</span>}
                                        <Select
                                            options={pair.attribute ? getValuesForAttribute(pair.attribute.value) : []}
                                            closeMenuOnSelect={false}
                                            isMulti
                                            value={getDefaultValueValue(pair)}
                                            onChange={(selectedOptions) => handleValueChange(selectedOptions, pairIndex)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-2 align-self-end">
                                {pairIndex === 0 ? (
                                    <span
                                        className="btn btn-primary w-100 text-uppercase px-3"
                                        style={{ lineHeight: '23px', marginTop: '5px' }}
                                        onClick={handleAddPair}
                                    >
                                        +
                                    </span>
                                ) : (
                                    <span
                                        className="btn btn-danger w-100 text-uppercase px-3"
                                        style={{ lineHeight: '23px', color: "white" }}
                                        onClick={() => handleRemovePair(pairIndex)}
                                    >
                                        -
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Inventory<span style={{ color: "red" }}>*</span></label>
                            <input
                                type="number"
                                value={variant?.inventory || ''}
                                className="form-control"
                                name="inventory"
                                placeholder='Inventory'
                                onChange={(e) => onFieldChange(e, index, 'inventory')}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Min order quantity<span style={{ color: "red" }}>*</span></label>
                            <input
                                type="number"
                                value={variant?.minOrderQuantity || ''}
                                className="form-control"
                                name="minOrderQuantity"
                                placeholder='Min order quantity'
                                onChange={(e) => onFieldChange(e, index, 'minOrderQuantity')}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Retail Price<span style={{ color: "red" }}>*</span></label>
                            <input
                                type="number"
                                value={variant?.retailPrice || ''}
                                className="form-control"
                                name="retailPrice"
                                placeholder='Retail Price'
                                onChange={(e) => onFieldChange(e, index, 'retailPrice')}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Sale Price<span style={{ color: "red" }}>*</span></label>
                            <input
                                type="number"
                                value={variant?.salePrice || ''}
                                className="form-control"
                                placeholder='Sale Price'
                                name="salePrice"
                                onChange={(e) => onFieldChange(e, index, 'salePrice')}
                            />
                        </div>
                    </div>
                    <div className="row g-3 mt-2">
                        <div className="col-md-6 mt-2">
                            <button type="button" className="btn border btn-set-task w-100 text-uppercase px-5" onClick={onAddVariant}>Add More</button>
                        </div>
                        <div className="col-md-6 mt-2">
                            <button type="button" className="btn btn-primary btn-set-task w-100 text-uppercase px-5" onClick={handleDuplicateVariant}>Duplicate</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VariantForm;