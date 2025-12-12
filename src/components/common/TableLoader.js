import React from 'react';
import { Box, CircularProgress, Backdrop, Typography } from '@mui/material';

/**
 * Common Table Loader Component
 * Displays a consistent loading indicator for tables
 * 
 * @param {boolean} loading - Loading state from API/Redux
 * @param {string} message - Optional loading message
 * @param {string} type - Type of loader: 'backdrop' | 'inline' | 'datagrid' (default: 'datagrid')
 * @param {object} sx - Additional styling
 */
const TableLoader = ({ 
  loading = false, 
  message = 'Loading...', 
  type = 'datagrid',
  sx = {} 
}) => {
  if (!loading) return null;

  // Backdrop loader (full screen overlay)
  if (type === 'backdrop') {
    return (
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          ...sx
        }}
        open={loading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" size={60} />
          {message && (
            <Typography
              sx={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#fff',
                textAlign: 'center'
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Backdrop>
    );
  }

  // Inline loader (for specific sections)
  if (type === 'inline') {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          width: '100%',
          ...sx
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          {message && (
            <Typography variant="body2" color="text.secondary">
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }

  // DataGrid loader (returns loading prop value for DataGrid component)
  // This is handled by DataGrid's built-in loading prop
  return null;
};

/**
 * Loading Overlay Component for DataGrid
 * Used as LoadingOverlay prop in DataGrid
 */
export const DataGridLoadingOverlay = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      zIndex: 1,
    }}
  >
    <CircularProgress />
  </Box>
);

export default TableLoader;

