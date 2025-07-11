import React, { useState } from 'react';
import UserProfile from '../components/user/UserProfile';
import ChangePassword from '../components/user/ChangePassword';
import LoginHistory from '../components/user/LoginHistory';
import LogoutButton from '../components/user/LogoutButton';
import { Box, Typography, Tabs, Tab, Paper, Stack } from '@mui/material';

// Main Users page for viewing/editing info, password, login history, logout, etc.
const Users = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box maxWidth={600} mx="auto" p={2}>
      <Typography variant="h4" fontWeight={700} mb={3}>
        My Account
      </Typography>
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
          px={2}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Tab label="Profile" sx={{ minWidth: 100 }} />
            <Tab label="Change Password" sx={{ minWidth: 100 }} />
            <Tab label="Login History" sx={{ minWidth: 120 }} />
          </Tabs>
          <Box sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, mt: { xs: 1, sm: 0 } }}>
            <LogoutButton />
          </Box>
        </Stack>
      </Paper>
      <Box>
        {activeTab === 0 && <UserProfile />}
        {activeTab === 1 && <ChangePassword />}
        {activeTab === 2 && <LoginHistory />}
      </Box>
      {/* Add more features/components here as needed */}
    </Box>
  );
};

export default Users;
