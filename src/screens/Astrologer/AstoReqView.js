import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography, 
  CircularProgress,
  Divider,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewAstrologer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [astro, setAstro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('User-admin-token');

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_BASEURL}/admin/getAstroUpdateRequest/${id}`, {
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

  const handleAction = (status) => {
    setActionLoading(true);
    fetch(`${process.env.REACT_APP_BASEURL}/admin/updateRequestStatus/${id}`, {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
      .then(async (res) => {
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || `Error ${res.status}`);

        toast.success(`Request ${status === 'approved' ? 'approved' : 'rejected'}!`);
        if (status === 'approved') {
          setTimeout(() => navigate('/astrologer-list'), 1500);
        } else {
          setAstro((prev) => ({ ...prev, status: 'rejected' }));
        }
      })
      .catch(err => toast.error(err.message))
      .finally(() => setActionLoading(false));
  };

  const renderMedia = (value, label = '') => {
    const isImage = (url) =>
      typeof url === 'string' && /\.(jpe?g|png|gif|webp)$/i.test(url);

    const isVideo = (url) =>
      typeof url === 'string' && /\.(mp4|webm|ogg)$/i.test(url);

    if (label.toLowerCase().includes('language') && Array.isArray(value)) {
      return value.map(v => v.languageName).join(', ');
    }

    if (label.toLowerCase().includes('expertise') && Array.isArray(value)) {
      return value.map(v => v.expertiseName).join(', ');
    }

    if (label.toLowerCase().includes('availability') && typeof value === 'object') {
      return Object.entries(value).map(([day, slots], idx) => (
        <Box key={day + idx}>
          <Typography fontWeight="bold" mt={1}>{day.toUpperCase()}</Typography>
          {(slots || []).map((slot, i) => (
            <Typography key={i} sx={{ ml: 1 }}>{slot.startTime} - {slot.endTime}</Typography>
          ))}
        </Box>
      ));
    }

    if (Array.isArray(value)) {
      return (
        <Box display="flex" flexWrap="wrap" gap={2}>
          {value.map((item, i) => {
            const ext = item?.split('.').pop()?.toLowerCase();
            if (isImage(item)) {
              return (
                <img key={i} src={item} alt="img" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} />
              );
            } else if (isVideo(item)) {
              return (
                <video key={i} src={item} controls style={{ width: 150, height: 100, borderRadius: 8 }} />
              );
            } else if (ext === 'heic') {
              return (
                <Box key={i}>
                  <Typography color="textSecondary">.heic file - not supported for preview</Typography>
                  <a href={item} target="_blank" rel="noopener noreferrer">View File</a>
                </Box>
              );
            }
            return <Typography key={i}>{String(item)}</Typography>;
          })}
        </Box>
      );
    }

    if (typeof value === 'string' && value.endsWith('.heic')) {
      return (
        <Box>
          <Typography color="textSecondary">.heic file</Typography>
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
            width: 60,
            height: 60,
            borderRadius: '50%',
            objectFit: 'cover'
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

    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([k, v], i) => (
        <Typography key={i}>{`${k}: ${v}`}</Typography>
      ));
    }

    return <Typography>{String(value)}</Typography>;
  };

  if (loading) return <CircularProgress />;
  if (!astro) return null;

  const original = astro.astrologerId || {};
  const updatedFields = astro.updatedFields || {};

  const originalData = Object.entries({
    'Full Name': original.fullName,
    Email: original.email,
    'Phone Number': original.mobileNumber,
    City: original.city,
    State: original.state,
    Pincode: original.pincode,

    Qualification: original.qualification,
    Experience: original.experience,

    Expertise: original.expertise || [],
    'Profile Bio': original.profileBio,
    'Commission %': original.commissionPercentage,
    'Availability': original.availability || {},
    'Aadhar Image': original.aadharImg,
    'PAN Card Image': original.panCardImg,

    Address: original.address,
    Languages: original.languages || [],

    'Certificates': original.certificates,
    'Photo Gallery': original.photoGallery,
    'Photos': original.photos,
    'Videos': original.videos,
    'Certificate Gallery': original.certificateGallery,
    'Bank Name': original.bankDetails?.bankName,
    'Beneficiary Name': original.bankDetails?.beneficiaryName,
    'IFSC Code': original.bankDetails?.ifscCode,
    'Account Number': original.bankDetails?.accountNumber,
    'Cancelled Cheque': original.bankDetails?.cancelledCheque,
    'Bank Verification Status': original.bankDetails?.verification,
    'Aadhar No': original.billingDetails?.aadharCard,
    'PAN Card No': original.billingDetails?.panCard,
    'GST No': original.billingDetails?.gstNumber,
    'GST Certificate': original.billingDetails?.gstCertificate,
    'Chat Rate/Min': original.chat?.ratePerMinute,
    'Chat Offer/Min': original.chat?.offerPricePerMinute,
    'Call Rate/Min': original.call?.ratePerMinute,
    'Call Offer/Min': original.call?.offerPricePerMinute,
    'Video Call Rate/Min': original.videoCall?.ratePerMinute,
    'Video Call Offer/Min': original.videoCall?.offerPricePerMinute,
    'Physical Visit Rate/Min': original.physicalVisit?.ratePerMinute,
    'Physical Visit Offer/Min': original.physicalVisit?.offerPricePerMinute,
    'Requested At': astro.requestedAt && new Date(astro.requestedAt).toLocaleString(),
  }).filter(([, value]) => value != null && value !== '' && (!Array.isArray(value) || value.length > 0));

  return (
    <div className="body d-flex">
      <ToastContainer />
      <div className="container-xxl">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <PageHeader1 pagetitle="View Astrologer Update Request" />
          <button
            onClick={() => window.history.back()}
            style={{
              marginBottom: '10px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'monospace', fontSize: '18px', color: '#007bff', display: 'flex', alignItems: 'center', position: 'relative', padding: '10px 20px',
            }}
          >
            <span style={{ position: 'relative', display: 'inline-block' }}>Back</span>
          </button>
        </div>

        {astro.status === 'pending' && (
          <Box mb={2} display="flex" gap={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() => handleAction('approved')}
              disabled={actionLoading}
            >
              {actionLoading ? 'Working...' : 'Approve'}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleAction('rejected')}
              disabled={actionLoading}
            >
              {actionLoading ? 'Working...' : 'Reject'}
            </Button>
          </Box>
        )}

        {astro.status !== 'pending' && (
          <Typography color={astro.status === 'rejected' ? 'error' : 'success'} sx={{ mb: 2 }}>
            Request Status: <strong>{astro.status.charAt(0).toUpperCase() + astro.status.slice(1)}</strong>
          </Typography>
        )}

        <Paper elevation={3} sx={{ padding: 3, marginBottom: 4 }}>
          <Typography variant="h6" gutterBottom>
            Current Astrologer Data
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {originalData.map(([label, value]) => (
              <Grid item xs={12} sm={6} key={label}>
                <Typography variant="subtitle2" color="text.secondary">
                  {label}
                </Typography>
                <Box mt={1}>{renderMedia(value, label)}</Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h6" gutterBottom>
            Requested Updated Fields
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {Object.entries(updatedFields)
            .filter(([field, value]) => {
              const originalValue = original[field];

              // Special handling for arrays of objects like languages and expertise
              if (Array.isArray(value) && Array.isArray(originalValue)) {
                const getIds = (arr) => arr.map((item) => item._id || item).sort().join(',');
                return getIds(value) !== getIds(originalValue);
              }

              return JSON.stringify(value) !== JSON.stringify(originalValue);
            })
            .map(([field, value]) => (
              <Grid item xs={12} sm={6} key={field}>
                <Typography variant="subtitle2" color="text.secondary">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </Typography>
                <Box mt={1} sx={{ color: 'blue', fontWeight: 'bold' }}>
                  {renderMedia(value, field)}
                </Box>
              </Grid>
            ))}

        </Paper>
      </div>
    </div>
  );
};

export default ViewAstrologer;
