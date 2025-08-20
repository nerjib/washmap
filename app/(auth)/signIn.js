import { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { UserContext } from '../context/contextUser';
import api from '../services/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
  const navigation = useNavigation();
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    console.log({email, password})
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('userToken', token);
        setUser(user);
        navigation.navigate('(app)', { screen: 'home' });
      } else {
        alert(res.data.error || 'Invalid credentials! Please try again.');
      }
    } catch (e) {
      alert('An error occurred. Please try again.');
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const value = await AsyncStorage.getItem('user');
        if (value !== null) {
          setUser(JSON.parse(value));
          navigation.navigate('(app)', { screen: 'home' });
        }
      } catch (e) {
        console.log(e);
      } finally {
        setPageLoading(false);
      }
    };
    checkUser();
  }, []);

  if (pageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#343a40',
  },
  input: {
    height: 50,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
});
