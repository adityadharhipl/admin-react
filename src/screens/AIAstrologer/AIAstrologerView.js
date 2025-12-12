import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader1 from '../../components/common/PageHeader1';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const AIAstrologerView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [aiAstro, setAiAstro] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('User-admin-token');

  useEffect(() => {
    const fetchAIAstrologer = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASEURL}/admin/ai-astrologer/${id}`,
          {
            headers: { Authorization: token },
          }
        );

        // Handle response - nested data structure
        let aiAstroData = response.data.data;

        // If data is pagination object with docs array, get first item
        if (aiAstroData?.docs && Array.isArray(aiAstroData.docs)) {
          aiAstroData = aiAstroData.docs[0];
        }

        if (aiAstroData) {
          setAiAstro(aiAstroData);
        }
      } catch (error) {
        console.error('Error fetching AI Astrologer:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch AI Astrologer details');
      } finally {
        setLoading(false);
      }
    };

    fetchAIAstrologer();
  }, [id, token]);

  // Static expertise labels mapping
  const expertiseLabels = {
    'BabynameGenerator': 'Baby Name Generator - 111 questions',
    'Career': 'Career - 111 questions',
    'FaceReading': 'Face Reading - 111 questions',
    'Finance': 'Finance - 111 questions',
    'Health': 'Health - 111 questions',
    'Love': 'Love - 111 questions',
    'Marriage': 'Marriage - 111 questions',
    'PalmReading': 'Palm Reading - 111 questions',
    'Remedies': 'Remedies - 111 questions',
  };

  const renderValue = (value, label = '') => {
    if (label.toLowerCase().includes('language') && Array.isArray(value)) {
      return (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {value.map((v, idx) => (
            <Chip
              key={idx}
              label={typeof v === 'object' ? v.languageName : v}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      );
    }

    if (label.toLowerCase().includes('expertise') && Array.isArray(value)) {
      return (
        <Box display="flex" flexWrap="wrap" gap={1}>
          {value.map((v, idx) => {
            const displayLabel = typeof v === 'object'
              ? v.expertiseName
              : (expertiseLabels[v] || v);
            return (
              <Chip
                key={idx}
                label={displayLabel}
                size="small"
                color="secondary"
                variant="outlined"
              />
            );
          })}
        </Box>
      );
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

    if (value instanceof Date) {
      return <Typography variant="body2">{value.toLocaleString()}</Typography>;
    }

    return <Typography variant="body2">{String(value)}</Typography>;
  };

  const renderSection = (title, data) => {
    if (!data || data.length === 0) return null;

    const filteredData = data.filter(({ value }) => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) return false;
      return true;
    });

    if (filteredData.length === 0) return null;

    return (
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" mb={1} gutterBottom color="primary">
          {title}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={2}>
          {filteredData.map(({ label, value }) => (
            <Grid item xs={12} sm={6} key={label} sx={{padding:"0px", margin:"0px"}}>
              <Typography  variant="subtitle2" color="text.secondary" fontWeight="bold">
                {label}
              </Typography>
              <Box>{renderValue(value, label)}</Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!aiAstro) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>AI Astrologer not found</Typography>
      </Box>
    );
  }

  const basicData = [
    { label: 'Name', value: aiAstro.name },
    { label: 'Title', value: aiAstro.title },
    { label: 'Type', value: aiAstro.type?.toUpperCase() },
    { label: 'Specialization', value: aiAstro.specialization },
    { label: 'Experience', value: aiAstro.experience },
    { label: 'Rating', value: aiAstro.rating },
    { label: 'AI Model', value: aiAstro.aiModel },
    { label: 'Description', value: aiAstro.description },
  ];

  const professionalData = [
    { label: 'Languages', value: aiAstro.languages || [] },
    { label: 'Expertise', value: aiAstro.expertise || [] },
    { label: 'Personality', value: aiAstro.personality },
    { label: 'Consultation Style', value: aiAstro.consultationStyle },
  ];

  const pricingData = [
    { label: 'Price Per Minute', value: `${aiAstro.currency} ${aiAstro.pricePerMinute}` },
    { label: 'Currency', value: aiAstro.currency },
    { label: 'Response Time', value: aiAstro.responseTime },
  ];

  const statsData = [
    { label: 'Total Consultations', value: aiAstro.totalConsultations },
    { label: 'Total Reviews', value: aiAstro.totalReviews },
    { label: 'Is Active', value: aiAstro.isActive },
    { label: 'Is Online', value: aiAstro.isOnline },
  ];

  const metaData = [
    { label: 'Created At', value: aiAstro.createdAt ? new Date(aiAstro.createdAt) : null },
    { label: 'Updated At', value: aiAstro.updatedAt ? new Date(aiAstro.updatedAt) : null },
  ];

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
        <div className="d-flex justify-content-between align-items-center">
          <PageHeader1 pagetitle="View AI Astrologer Details" />
          <button
            onClick={() => window.history.back()}
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
              padding: '0 20px',
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

        {/* Profile Image Section */}
        {aiAstro.profileImg && (
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3, display: 'flex' }}>
            <img
              src={aiAstro.profileImg}
              alt={aiAstro.name}
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid #E7B242'
              }}
              onError={(e) => {
                e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
              }}
            />
            <div style={{ marginLeft: 20 }}>
            <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
              {aiAstro.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {aiAstro.title}
            </Typography>
            </div>
          </Paper>
        )}

        {renderSection('Basic Information', basicData)}
        {renderSection('Professional Details', professionalData)}
        {renderSection('Pricing & Availability', pricingData)}
        {renderSection('Statistics', statsData)}
        {renderSection('Metadata', metaData)}
      </div>
    </div>
  );
};

export default AIAstrologerView;

