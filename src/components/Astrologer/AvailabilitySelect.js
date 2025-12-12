import React, { useState, useRef, useEffect } from 'react';
import Select, { components } from 'react-select';
import Toggle from '../Toggle/toggle';

const options = [{ label: 'Availability Timing', value: 'timing' }];

const CustomMenu = (props) => {
    const [timing, setTiming] = useState([{ day: 'Sun', start: '', end: '', isAdded: false }]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [isSlotAdded, setIsSlotAdded] = useState(false);

    const handleTimeChange = (index, field, value) => {
        const newTiming = [...timing];
        newTiming[index][field] = value;
        setTiming(newTiming);
    };

    const handleDaySelect = (day) => {
        const isSelected = selectedDays.includes(day);
        if (isSelected) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const addTimeSlot = () => {
        const newSlot = { day: selectedDays[0] || 'Sun', start: '', end: '', isAdded: true };
        setTiming([...timing, newSlot]);
        setIsSlotAdded(true);
    };

    const removeTimeSlot = (index) => {
        const newTiming = timing.filter((_, i) => i !== index);
        setTiming(newTiming);
        if (newTiming.length === 0) {
            setIsSlotAdded(false);
        }
    };

    const handleAllDaysToggle = (isSelected) => {
        if (isSelected) {
            const updatedTiming = timing.map((slot) => ({
                ...slot,
                start: timing[0].start,
                end: timing[0].end,
            }));
            setTiming(updatedTiming);
        }
    };

    const selectedDayStyle = {
        backgroundColor: 'green',
        color: 'white',
        borderRadius: '50%',
        padding: '5px 10px',
        margin: '2px',
    };

    return (
        <components.Menu {...props}>
            <div className='availTime_main'>
                <div className='dateBox'>
                    <ul>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <li key={day}>
                                <span
                                    style={selectedDays.includes(day) ? selectedDayStyle : {}}
                                    onClick={() => handleDaySelect(day)}
                                >
                                    {day}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className='mainBox'>
                    <div className='selectDayBox'>
                        <span className='allDay'>Select for all days</span>
                        <Toggle onChange={handleAllDaysToggle} />
                    </div>
                    <div className="time-selector">
                        {timing?.map((slot, index) => (
                            <div key={index} className="time-row">
                                {selectedDays?.length === 0 || selectedDays?.includes(slot?.day) ? (
                                    <>
                                        <div className="time-group">
                                            <label>Start time</label>
                                            <input
                                                className="form-control"
                                                type="time"
                                                value={slot.start}
                                                onChange={(e) => handleTimeChange(index, 'start', e.target.value)}
                                            />
                                        </div>
                                        <div className="time-group">
                                            <label>End time</label>
                                            <input
                                                className="form-control"
                                                type="time"
                                                value={slot.end}
                                                onChange={(e) => handleTimeChange(index, 'end', e.target.value)}
                                            />
                                        </div>
                                        <button className="add-btn btn-primary" onClick={addTimeSlot}>+</button>
                                        {isSlotAdded && (
                                            <button className="remove-btn btn-primary" onClick={() => removeTimeSlot(index)}>−</button>
                                        )}
                                    </>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </components.Menu>
    );
};

const AvailabilitySelect = () => {
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const selectRef = useRef(null);

    const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setMenuIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="availPosition_relative">
            <div className="availPosition_absolute" onClick={() => setMenuIsOpen(prev => !prev)} ref={selectRef}>
                drop
            </div>
            <Select
                options={options}
                isMulti={false}
                menuIsOpen={menuIsOpen}
                components={{ Menu: CustomMenu }}
                placeholder="Availability Timing"
                closeMenuOnSelect={false}
                hideSelectedOptions={false}
                onMenuOpen={() => setMenuIsOpen(true)}
                onMenuClose={() => setMenuIsOpen(false)}
            />
        </div>
    );
};

export default AvailabilitySelect;
