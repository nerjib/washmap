import { Drawer } from 'expo-router/drawer';
import { UserContext } from '../context/contextUser';
import { useContext } from 'react';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

function CustomDrawerContent(props) {
  const { setUser } = useContext(UserContext);
  const router = useRouter();

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('myAssignedProjects');
    setUser(null);
    router.replace('/(auth)/signIn');
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function AppLayout() {
  const { user } = useContext(UserContext);
  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="home"
        options={{
          title: 'Home',
          drawerLabel: 'Home',
        }}
      />
       <Drawer.Screen
        name="projects/index"
        options={{ 
          title: 'My Projects',
          drawerLabel: 'My Projects'
        }}
      />
      {user?.role === 'odf' && (
        <Drawer.Screen name="odf-report" 
        options={{ 
          title: 'ODF Report',
          drawerLabel: 'ODF-Report'
        }}
        />
      )}
        {user?.role === 'admin' && (
            <Drawer.Screen
                name="all-projects"
                options={{
                    title: 'All Projects',
                    drawerLabel: 'All Projects',
                }}
            />
        )}

        {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Drawer.Screen
                name="user-management"
                options={{
                    title: 'User Management',
                    drawerLabel: 'User Management',
                }}
            />
        )}
      <Drawer.Screen
        name="daily-reports.js/index"
        options={{
          title: 'Daily Report',
          drawerLabel: 'Daily Report',
        }}
      />
      <Drawer.Screen
        name="request"
        options={{
          title: 'Facility Request',
          drawerLabel: 'Facility Request',
        }}
      />
       <Drawer.Screen
        name="drafts"
        options={{
          title: 'Draft',
          drawerLabel: 'Saved Report',
        }}
      />
      <Drawer.Screen
        name="sanitation"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="odf"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="daily-progress"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="view-evaluations"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="project-evaluation"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
     
    </Drawer>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc3545',
  },
});