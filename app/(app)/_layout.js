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
      {user?.role === 'odf' && (
        <Drawer.Screen name="odf-report" 
        options={{ 
          title: 'ODF Report',
          drawerLabel: 'ODF-Report'
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
        name="projects/index"
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