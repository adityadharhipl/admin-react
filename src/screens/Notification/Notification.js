import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationForm = () => {
  const token = localStorage.getItem('User-admin-token');
  const [selectedType, setSelectedType] = useState(null);
  const [userOptionsRaw, setUserOptionsRaw] = useState([]);
  const [astroOptionsRaw, setAstroOptionsRaw] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const safeLabel = (item) => {
    const label = item?.fullName || item?.name || item?.email || '';
    // const idPart = item?._id;
    const mobilePart = item?.mobileNumber ? `  ${item.mobileNumber}` : '';
    return `${label} (${mobilePart})`;

    // return `${label} (${idPart}${mobilePart})`;
  };

  const fetchUsers = async () => {

    
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/user`, {
        headers: { Authorization: token },
      });
      const data = response?.data?.data || [];
      const uniqueUsers = Array.from(
        new Map(
          data.map((user) => [
            user._id,
            {
              ...user,
              value: user._id,
              label: safeLabel(user),
            },
          ])
        )
      ).map(([, value]) => value);
      setUserOptionsRaw(uniqueUsers);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchAstrologers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASEURL}/admin/getAstro`, {
        headers: { Authorization: token },
      });
      const data = response?.data?.data || [];
      const uniqueAstros = Array.from(
        new Map(
          data.map((astro) => [
            astro._id,
            {
              ...astro,
              value: astro._id,
              label: safeLabel(astro),
            },
          ])
        )
      ).map(([, value]) => value);
      setAstroOptionsRaw(uniqueAstros);
    } catch (error) {
      toast.error('Failed to fetch astrologers');
    }
  };

  useEffect(() => {
    if (selectedType === 'user' || selectedType === 'alluser') {
      fetchUsers();
    } else if (selectedType === 'astrologer' || selectedType === 'allastrologer') {
      fetchAstrologers();
    }

    setSelectedRecipients([]);
    setSearchInput('');
  }, [selectedType]);

  const currentOptionsRaw = useMemo(() => {
    return selectedType?.includes('user') ? userOptionsRaw : astroOptionsRaw;
  }, [selectedType, userOptionsRaw, astroOptionsRaw]);

  const filteredOptions = useMemo(() => {
    if (!searchInput) return currentOptionsRaw;
    return currentOptionsRaw.filter((opt) =>
      opt.label?.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [currentOptionsRaw, searchInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedType || !message.trim() || !title.trim()) {
      toast.error('Please fill out title, message, and recipient type.');
      return;
    }

    let idsToSend = selectedRecipients.map((rec) => rec.value);

    if (selectedType === 'alluser') {
      idsToSend = userOptionsRaw.map((u) => u.value);
    } else if (selectedType === 'allastrologer') {
      idsToSend = astroOptionsRaw.map((a) => a.value);
    }

    const actualMsgFor =
      selectedType === 'alluser'
        ? 'user'
        : selectedType === 'allastrologer'
        ? 'astrologer'
        : selectedType;

    const payload = {
      msgFor: actualMsgFor,
      ids: idsToSend,
      title,
      message,
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_BASEURL}/admin/sendNotification`,
        payload,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('Notification sent successfully!');
      setTitle('');
      setMessage('');
      setSelectedRecipients([]);
      setSearchInput('');
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send notification.');
    }
  };

  return (
    <div className="container py-3">
      <div className="card shadow-sm p-4">
        <h4 className="mb-4 fw-bold">Send Notification</h4>

        {/* Select Type */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Select Recipient Type</label>
          <Select
            options={[
              { value: 'user', label: 'User' },
              { value: 'astrologer', label: 'Astrologer' },
              { value: 'alluser', label: 'All User' },
              { value: 'allastrologer', label: 'All Astrologer' },
            ]}
            onChange={(option) => setSelectedType(option.value)}
            placeholder="Choose type..."
          />
        </div>

        {/* Multi-Select for Individuals */}
        {(selectedType === 'user' || selectedType === 'astrologer') &&
          !['alluser', 'allastrologer'].includes(selectedType) && (
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Select {selectedType === 'user' ? 'Users' : 'Astrologers'}
              </label>

              <Select
                isMulti
                options={filteredOptions}
                value={selectedRecipients}
                onChange={setSelectedRecipients}
                placeholder={`Select ${selectedType}s...`}
                styles={{
                  menu: (provided) => ({
                    ...provided,
                    maxHeight: '200px',
                    overflowY: 'auto',
                  }),
                }}
              />
            </div>
          )}

        {/* Notification Title */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Notification Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter notification title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Notification Message */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Notification Message</label>
          <textarea
            className="form-control"
            rows="4"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <button className="btn btn-primary mb-2" onClick={handleSubmit}>
          Send Notification
        </button>
      </div>
    </div>
  );
};

export default NotificationForm;
