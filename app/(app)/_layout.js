// app/(app)/_layout.js
import { Drawer } from 'expo-router/drawer';
import { UserContext } from '../context/contextUser';
import { useContext } from 'react';

export default function AppLayout() {
  const { user } = useContext(UserContext);
  return (
    <Drawer>
      <Drawer.Screen
        name="home" // This corresponds to app/(app)/home.js
        options={{
          title: 'Home',
          drawerLabel: 'Home',

        }}
      />
       <Drawer.Screen
        name="projects/index" // This corresponds to app/(app)/projects/index.js
        options={{
          title: 'Facilities',
          drawerLabel: 'Facilities',
        }}
      />
      {/* <Drawer.Screen
        name="settings" // This corresponds to app/(app)/settings.js
        options={{
          title: `Settings`,
          drawerLabel: 'Settings'
        }}
      /> */}
      {user.role === 'odf' && (
        <Drawer.Screen name="odf-report" 
        options={{ 
          title: 'ODF Report',
          drawerLabel: 'ODF-Report'
        }}
        
        />
      )}
      <Drawer.Screen
        name="daily-reports.js/index" // This corresponds to app/(app)/projects/index.js
        options={{
          title: 'Daily Report',
          drawerLabel: 'Daily Report',
        }}
      />
    </Drawer>
  );
}