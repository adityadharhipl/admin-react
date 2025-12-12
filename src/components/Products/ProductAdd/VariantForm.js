import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { fetchAttribute } from '../../../Redux/Reducers/AttributeReducer';
import { useDispatch } from 'react-redux';

const VariantForm = ({ variant, attributes, index, onFieldChange, onSelectChange, onAddVariant, onDuplicateVariant, subCatId, catId }) => {

    const dispatch = useDispatch();
    const [attributePairs, setAttributePairs] = useState(variant.attributes.length > 0 ? variant.attributes : [{ attribute: null, value: [] }]);

    useEffect(() => {
        dispatch(fetchAttribute());
    }, [dispatch]);

    useEffect(() => {
        setAttributePairs(variant.attributes.length > 0 ? variant.attributes : [{ attribute: null, value: [] }]);
    }, [variant.attributes]);

    useEffect(() => {
        setAttributePairs([{ attribute: null, value: [] }]);
    }, [catId, subCatId]);

    const getValuesForAttribute = (selectedAttribute) => {
        const foundAttribute = attributes.find(item => item.attributeName === selectedAttribute);
        return foundAttribute ? foundAttribute.value.map((item, idx) => ({
            value: `${foundAttribute._id}-${idx}`,
            label: item
        })) : [];
    };

    const handleAddPair = () => {
        const newPair = { attribute: null, value: [] };
        setAttributePairs([...attributePairs, newPair]);
        onSelectChange([...attributePairs, newPair], index, 'attributes');
    };

    const handleRemovePair = (pairIndex) => {
        const newPairs = attributePairs.filter((_, index) => index !== pairIndex);
        setAttributePairs(newPairs);
        onSelectChange(newPairs, index, 'attributes');
    };

    const handleAttributeChange = (selectedOption, pairIndex) => {
        const newPairs = [...attributePairs];
        newPairs[pairIndex].attribute = selectedOption;
        newPairs[pairIndex].value = [];
        setAttributePairs(newPairs);
        onSelectChange(newPairs, index, 'attributes');
    };

    const handleValueChange = (selectedOptions, pairIndex) => {
        const newPairs = [...attributePairs];
        newPairs[pairIndex].value = selectedOptions;
        setAttributePairs(newPairs);
        onSelectChange(newPairs, index, 'attributes');
    };

    let filteredAttributes = attributes?.filter((item) => item?.subCategoryId?._id === subCatId);

    return (
        <div className="col-lg-6">
            <div className='d-flex justify-content-between h-100 flex-column'>
                <div>
                    <h6 style={{ fontWeight: '700' }}>Attributes</h6>
                    {attributePairs.map((pair, pairIndex) => (
                        <div className={`row ${pairIndex > 0 ? 'mt-3' : ''}`} key={pairIndex}>
                            <div className='col-md-10'>
                                <div className='row'>
                                    <div className="col-md-6">
                                        {pairIndex === 0 && <label className="form-label">Attribute</label>}
                                        {pairIndex === 0 && <span style={{ color: "red" }}>*</span>}
                                        <Select
                                            value={pair.attribute}
                                            options={filteredAttributes?.map(item => ({ label: item.attributeName, value: item._id }))}
                                            onChange={(selectedOption) => handleAttributeChange(selectedOption, pairIndex)}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        {pairIndex === 0 && <label className="form-label">Value</label>}
                                        {pairIndex === 0 && <span style={{ color: "red" }}>*</span>}
                                        <Select
                                            options={pair.attribute ? getValuesForAttribute(pair.attribute.label) : []}
                                            closeMenuOnSelect={false}
                                            isMulti
                                            value={pair.value}
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
                    <div className="row g-3 mt-3">
                        {['inventory', 'minOrderQuantity', 'retailPrice', 'salePrice']?.map((field, idx) => (
                            <div key={idx} className="col-md-6">
                                <label className="form-label">{field.charAt(0).toUpperCase() + field?.slice(1)}<span style={{ color: "red" }}>*</span></label>
                                <input
                                    type="number"
                                    value={variant[field]}
                                    className="form-control"
                                    placeholder={field?.charAt(0)?.toUpperCase() + field?.slice(1)}
                                    onChange={(e) => onFieldChange(e, index, field)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="row g-3 mt-2">
                        <div className="col-md-6 mt-2">
                            <button type="button" className="btn border btn-set-task w-100 text-uppercase px-5" onClick={onAddVariant}>Add More</button>
                        </div>
                        <div className="col-md-6 mt-2">
                            <button type="button" className="btn btn-primary btn-set-task w-100 text-uppercase px-5" onClick={() => onDuplicateVariant(index)}>Duplicate</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VariantForm;