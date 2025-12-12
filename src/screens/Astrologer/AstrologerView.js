import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Chip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AstrologerView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [astro, setAstro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem('User-admin-token');

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_BASEURL}/admin/getAstro/${id}`, {
      method: 'GET',
      headers: { Authorization: token },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(json => setAstro(json.data))
      .catch(err => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleToggleChange = async (field, value) => {
    setUpdating(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BASEURL}/admin/updateAstro/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const result = await response.json();
      setAstro(prev => ({ ...prev, [field]: value }));
      toast.success(`${field === 'isChatEnabled ' ? 'Chat' : field === 'isCallEnabled' ? 'Voice Call' : 'Video Call'} ${value ? 'enabled' : 'disabled'} successfully!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const renderMedia = (value, label = '') => {
    const isImage = (url) =>
      typeof url === 'string' && /\.(jpe?g|png|gif|webp)$/i.test(url);

    const isVideo = (url) =>
      typeof url === 'string' && /\.(mp4|webm|ogg)$/i.test(url);

    if (label.toLowerCase().includes('language') && Array.isArray(value)) {
      return (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {value.map((v, idx) => (
            <Chip key={idx} label={v.languageName || v} size="small" color="primary" variant="outlined" />
          ))}
        </Box>
      );
    }

    if (label.toLowerCase().includes('expertise') && Array.isArray(value)) {
      return (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {value.map((v, idx) => (
            <Chip key={idx} label={v.expertiseName || v} size="small" color="secondary" variant="outlined" />
          ))}
        </Box>
      );
    }

    if (label.toLowerCase().includes('availability') && typeof value === 'object' && value !== null) {
      return (
        <Grid container spacing={2}>
          {Object.entries(value).map(([day, slots], idx) => {
            // Skip if no slots or if slots don't have valid startTime/endTime
            if (!slots || slots.length === 0) return null;

            // Check if slots have valid data
            const hasValidSlots = slots.some(slot => slot?.startTime && slot?.endTime);
            if (!hasValidSlots) return null;

            // Special handling for "default" - means all days
            const displayDay = day.toLowerCase() === 'default' ? 'All Days' : day.toUpperCase();

            return (
              <Grid item xs={12} sm={6} md={4} key={day + idx}>
                <Paper elevation={2} sx={{ p: 2, backgroundColor: '#fafafa' }}>
                  <Typography fontWeight="bold" variant="body2" color="primary" sx={{ mb: 1 }}>
                    {displayDay}
                  </Typography>
                  {(slots || []).map((slot, i) => {
                    if (!slot?.startTime || !slot?.endTime) return null;
                    return (
                      <Typography key={i} variant="body2">
                        {slot.startTime} - {slot.endTime}
                      </Typography>
                    );
                  })}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      );
    }

    if (Array.isArray(value)) {
      return (
        <Box display="flex" flexWrap="wrap" gap={2}>
          {value.map((item, i) => {
            const ext = item?.split('.').pop()?.toLowerCase();
            if (isImage(item)) {
              return (
                <img
                  key={i}
                  src={item}
                  alt="img"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '2px solid #e0e0e0'
                  }}
                />
              );
            } else if (isVideo(item)) {
              return (
                <video key={i} src={item} controls style={{ width: 150, height: 100, borderRadius: 8 }} />
              );
            } else if (ext === 'heic') {
              return (
                <Box key={i}>
                  <Typography color="textSecondary" variant="body2">.heic file</Typography>
                  <a href={item} target="_blank" rel="noopener noreferrer">View File</a>
                </Box>
              );
            }
            return <Typography key={i} variant="body2">{String(item)}</Typography>;
          })}
        </Box>
      );
    }

    if (typeof value === 'string' && value.endsWith('.heic')) {
      return (
        <Box>
          <Typography color="textSecondary" variant="body2">.heic file</Typography>
          <a href={value} target="_blank" rel="noopener noreferrer">View File</a>
        </Box>
      );
    }

    if (isImage(value)) {
      return (
        <img
          src={value}
          alt="img"
          style={{
            width: 80,
            height: 80,
            borderRadius: '8px',
            objectFit: 'cover',
            border: '2px solid #e0e0e0'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-placeholder.png';
          }}
        />
      );
    }

    if (isVideo(value)) {
      return <video src={value} controls style={{ width: 150, height: 100, borderRadius: 8 }} />;
    }

    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      );
    }

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([k, v], i) => (
        <Typography key={i} variant="body2">{`${k}: ${v}`}</Typography>
      ));
    }

    return <Typography variant="body2">{String(value)}</Typography>;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!astro) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Astrologer not found</Typography>
      </Box>
    );
  }

  const astrologerData = [
    { label: 'Full Name', value: astro.fullName },
    { label: 'Email', value: astro.email },
    { label: 'Phone Number', value: astro.mobileNumber },
    { label: 'Display Name', value: astro.displayName },
    { label: 'Profile Verified', value: astro.isProfileVerified },
    { label: 'Featured', value: astro.isFeatured },
    { label: 'Profile Visit Count', value: astro.profileVisitCount || 0 },
  ];

  const locationData = [
    { label: 'Address', value: astro.address },
    { label: 'City', value: astro.city },
    { label: 'State', value: astro.state },
    { label: 'Pincode', value: astro.pincode },
    { label: 'Country', value: astro.country },
  ];

  const professionalData = [
    { label: 'Qualification', value: astro.qualification },
    { label: 'Experience (Years)', value: astro.experience },
    { label: 'Expertise', value: astro.expertise || [] },
    { label: 'Languages', value: astro.languages || [] },
    { label: 'Profile Bio', value: astro.profileBio },
    { label: 'Commission %', value: astro.commissionPercentage },
  ];

  const documentsData = [
    { label: 'Aadhar No', value: astro.aadharNo },
    { label: 'PAN Card No', value: astro.panCardNo },
    { label: 'Aadhar Image', value: astro.aadharImg },
    { label: 'PAN Card Image', value: astro.panCardImg },
    { label: 'Certificates', value: astro.certificates },
    { label: 'Certificate Gallery', value: astro.certificateGallery },
  ];

  const bankData = [
    { label: 'Bank Name', value: astro.bankDetails?.bankName },
    { label: 'Beneficiary Name', value: astro.bankDetails?.beneficiaryName },
    { label: 'IFSC Code', value: astro.bankDetails?.ifscCode },
    { label: 'Account Number', value: astro.bankDetails?.accountNumber },
    { label: 'Cancelled Cheque', value: astro.bankDetails?.cancelledCheque },
    { label: 'Verification Status', value: astro.bankDetails?.verification },
  ].filter(item => item.value);

  const billingData = [
    { label: 'Aadhar Card', value: astro.billingDetails?.aadharCard },
    { label: 'PAN Card', value: astro.billingDetails?.panCard },
    { label: 'GST Number', value: astro.billingDetails?.gstNumber },
    { label: 'GST Certificate', value: astro.billingDetails?.gstCertificate },
  ].filter(item => item.value);

  const ratesData = [
    { label: 'Chat Rate/Min', value: astro.chat?.ratePerMinute },
    { label: 'Chat Offer/Min', value: astro.chat?.offerPricePerMinute },
    { label: 'Call Rate/Min', value: astro.call?.ratePerMinute },
    { label: 'Call Offer/Min', value: astro.call?.offerPricePerMinute },
    { label: 'Video Call Rate/Min', value: astro.videoCall?.ratePerMinute },
    { label: 'Video Call Offer/Min', value: astro.videoCall?.offerPricePerMinute },
    { label: 'Physical Visit Rate/Min', value: astro.physicalVisit?.ratePerMinute },
    { label: 'Physical Visit Offer/Min', value: astro.physicalVisit?.offerPricePerMinute },
  ].filter(item => item.value);

  const galleryData = [
    { label: 'Profile Image', value: astro.profileImg },
    { label: 'Photos', value: astro.photos },
    { label: 'Photo Gallery', value: astro.photoGallery },
    { label: 'Videos', value: astro.videos },
  ].filter(item => item.value);


  const renderSection = (title, data) => {
    if (!data || data.length === 0) return null;

    // Filter out empty fields
    const filteredData = data.filter(({ value }) => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false;
      return true;
    });

    // Don't render section if all fields are empty
    if (filteredData.length === 0) return null;

    return (
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {filteredData.map(({ label, value }) => (
            <Grid item xs={12} sm={6} key={label}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">
                {label}
              </Typography>
              <Box mt={1}>{renderMedia(value, label)}</Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  return (
    <div className="body d-flex">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="container-xxl">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <PageHeader1 pagetitle="View Astrologer Details" />
          <button
            onClick={() => window.location.href = '/astrologer-list'}
            style={{
              marginBottom: '10px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '18px',
              color: '#E7B242',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '10px 20px',
            }}
          >
            <span style={{ marginRight: '8px' }}>&lt;</span>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              Back
              <span
                style={{
                  content: "''",
                  position: 'absolute',
                  left: 0,
                  bottom: -2,
                  width: '100%',
                  height: '1px',
                  borderBottom: '2px solid #E7B242',
                }}
              ></span>
            </span>
          </button>
        </div>

        {/* Service Toggle Section */}
        <Paper elevation={3} sx={{ padding: 3, marginBottom: 3, backgroundColor: '#fff' }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 3 }}>
            Service Controls
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <i className="icofont-speech-comments" style={{ fontSize: '24px', color: '#E7B242' }}></i>
                  <Typography variant="body1" fontWeight="500">Chat</Typography>
                </Box>
                <Switch
                  checked={Boolean(astro?.isChatEnabled)}
                  onChange={(e) => handleToggleChange('isChatEnabled ', e.target.checked)}
                  disabled={updating}
                  color="warning"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <i className="icofont-phone" style={{ fontSize: '24px', color: '#E7B242' }}></i>
                  <Typography variant="body1" fontWeight="500">Voice Call</Typography>
                </Box>
                <Switch
                  checked={Boolean(astro?.isCallEnabled)}
                  onChange={(e) => handleToggleChange('isCallEnabled', e.target.checked)}
                  disabled={updating}
                  color="warning"
                />
              </Box>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fafafa'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <i className="icofont-video-cam" style={{ fontSize: '24px', color: '#E7B242' }}></i>
                  <Typography variant="body1" fontWeight="500">Video Call</Typography>
                </Box>
                <Switch
                  checked={Boolean(astro?.isAppointmentEnabled)}
                  onChange={(e) => handleToggleChange('isAppointmentEnabled', e.target.checked)}
                  disabled={updating}
                  color="warning"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {renderSection('Basic Information', astrologerData)}
        {renderSection('Location Details', locationData)}
        {renderSection('Professional Details', professionalData)}

        {astro.availability && Object.keys(astro.availability).length > 0 &&
          Object.values(astro.availability).some(slots => slots && slots.length > 0) && (
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 2 }}>
                Availability
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box>
                {renderMedia(astro.availability, 'availability')}
              </Box>
            </Paper>
          )}

        {renderSection('Documents & Verification', documentsData)}
        {renderSection('Bank Details', bankData)}
        {renderSection('Billing Details', billingData)}
        {renderSection('Service Rates', ratesData)}
        {renderSection('Gallery', galleryData)}
      </div>
    </div>
  );
};

export default AstrologerView;

