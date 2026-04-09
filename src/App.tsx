import React, { useState } from 'react';
import { VmsProvider, useVms } from './context/VmsContext';
import { Layout } from './components/Layout';
import { TaskList } from './components/TaskList';
import { TaskDetail } from './components/TaskDetail';
import { VendorBidForm } from './components/VendorBidForm';
import { VendorDirectory } from './components/VendorDirectory';
import { VendorProfile } from './components/VendorProfile';

function MainContent() {
  const { state } = useVms();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedVendorProfileId, setSelectedVendorProfileId] = useState<string | null>(null);

  // Reset selections when view changes
  React.useEffect(() => {
    setSelectedTaskId(null);
    setSelectedVendorProfileId(null);
  }, [state.currentUser, state.currentTab]);

  if (selectedTaskId) {
    if (state.currentUser?.type === 'Vendor') {
      const task = state.tasks.find(t => t.id === selectedTaskId);
      if (task?.status === 'Bidding') {
        return <VendorBidForm taskId={selectedTaskId} onBack={() => setSelectedTaskId(null)} />;
      }
    }
    return <TaskDetail taskId={selectedTaskId} onBack={() => setSelectedTaskId(null)} />;
  }

  if (selectedVendorProfileId) {
    return <VendorProfile 
      vendorId={selectedVendorProfileId} 
      onBack={() => setSelectedVendorProfileId(null)} 
      onSelectTask={(id) => {
        setSelectedVendorProfileId(null);
        setSelectedTaskId(id);
      }}
    />;
  }

  if (state.currentTab === 'directory' && state.currentUser?.type !== 'Vendor') {
    return <VendorDirectory onSelectVendor={setSelectedVendorProfileId} />;
  }

  return <TaskList onSelectTask={setSelectedTaskId} />;
}

export default function App() {
  return (
    <VmsProvider>
      <Layout>
        <MainContent />
      </Layout>
    </VmsProvider>
  );
}
