import { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Link, useNavigation } from 'expo-router';
import { UserContext } from '../context/contextUser';
import axios from 'axios';
import { baseURL } from '../services/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);
    const navigation = useNavigation();
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
    const [pageLoading, setPageLoading] = useState(true);


  const handleSignIn = async () => {
    // Simulate authentication
  //   <Link href="/(auth)/signUp" asChild>
  //   <Button title="Go to Sign Up" />
  // </Link>
  // <Link href="/(app)/home" asChild>
  //   <Button title="Go to Home" />
  // </Link>
  try{
  const res = await axios.post(`${baseURL}/auth/login`, { email, password });
    const {user} = res.data;
    if(user){
      await AsyncStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      setIsLoggedIn(true);
      navigation.navigate('(app)', { screen: 'home' });

    } else {
      alert(res.data.error || 'Invalid credentials! Please try again.');
    }
  }catch(e){
    alert('An error occurred. Please try again.');
    console.log(e)
  }
  };
  useEffect(() => {
    const checkUser = async() => {
      try{
      const value = await AsyncStorage.getItem('user');
      if (value !== null){
        setUser(JSON.parse(value))
        navigation.navigate('(app)', { screen: 'home' });
      }
    }catch(e){
      console.log(e)
    }finally{
      setPageLoading(false)
    }
    }
    checkUser();
  }, [])
  if (pageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={handleSignIn} />
      {/* <Link href="/signUp" style={styles.link}>
        Don't have an account? Sign Up
      </Link> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    marginTop: 10,
    color: 'blue',
    textAlign: 'center',
  },
});