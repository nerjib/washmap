import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button, ActivityIndicator } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import axios from 'axios';
import { baseURL } from '../../services/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample data for projects
const projectsy = [
  { id: '1', name: 'Project 1', lga: 'LGA A', facility: 'Facility X' },
  { id: '2', name: 'Project 2', lga: 'LGA B', facility: 'Facility Y' },
  { id: '3', name: 'Project 3', lga: 'LGA A', facility: 'Facility Z' },
  { id: '4', name: 'Project 4', lga: 'LGA C', facility: 'Facility X' },
];

export default function Projects() {
  const [lgaFilter, setLgaFilter] = useState('Birnin Gwari');
  const [facilityFilter, setFacilityFilter] = useState('HPBH');
  const [projects, setProjects] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Filter projects based on LGA and Facility
  const filteredProjects = projects.filter((project) => {
    const matchesLga = lgaFilter ? project.lga === lgaFilter : true;
    const matchesFacility = facilityFilter ? project.title === facilityFilter : true;
    return matchesLga && matchesFacility;
  });

  const loadDrafts = async () => {
    try {
      const storedDrafts = await AsyncStorage.getItem('projects');
      if (storedDrafts) {
        setProjects(JSON.parse(storedDrafts));
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }finally{
      setPageLoading(false)
    }
  };
  const getProjects = async () => {
    try{
    const res = await axios.get(`${baseURL}/projects`);
      await AsyncStorage.setItem('projects', JSON.stringify(res?.data));
    setProjects(res.data);
    }catch(e){
      console.log(e)
    }finally{
      setPageLoading(false)
    }
  };
  const lgaList= ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jemaa', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria']
  useEffect(async() => {
    loadDrafts();
   getProjects();

  }, []);

   if (pageLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
  return (
    <View style={styles.container}>
      {/* <View style={{ flex: 1, marginTop: 20, justifyContent: 'flex-end'}}>
        <Button title="Report unknow project" />
      </View> */}
      <Text style={styles.title}>Projects</Text>

      {/* Filter by LGA */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Facility:</Text>
        <Picker
          selectedValue={facilityFilter}
          onValueChange={(itemValue) => setFacilityFilter(itemValue)}
          style={styles.picker}
        >
          
          <Picker.Item value="HPBH" label="Handpump Borehole" />
          <Picker.Item value="SMBH" label="Solar Motorized" />
          <Picker.Item value="FLBH" label="Force Lift Borehole" />
          <Picker.Item value="VIP" label="VIP Laterine" />
        </Picker>
      </View>

      {/* Filter by Facility */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by LGA:</Text>
        <Picker
          selectedValue={lgaFilter}
          onValueChange={(itemValue) => setLgaFilter(itemValue)}
          style={styles.picker}
        >
          {/* <Picker.Item label="All" value="" /> */}
          {lgaList?.map(e=>
          <Picker.Item label={e} value={e} key={e} />
          )}
        </Picker>
      </View>
          {//navigation.navigate('details', {data: JSON.stringify(project)})}}
          }

      {/* List of filtered projects */}
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={{pathname:`/components/projects/${item.id}`, params: item}} style={styles.projectItem}>
            <Text style={styles.projectName}>{item.name}</Text>
            <Text style={styles.projectDetails}>{item.community}-</Text>
            <Text style={styles.projectDetails}>{item.lga}-</Text>
            <Text style={styles.projectDetails}>Facility: {item.title}</Text>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  projectItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  projectName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  projectDetails: {
    fontSize: 14,
    color: '#666',
  },
});