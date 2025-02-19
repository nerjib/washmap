import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import axios from 'axios';
import { baseURL } from '../../services/config';

// Sample data for projects
const projectsy = [
  { id: '1', name: 'Project 1', lga: 'LGA A', facility: 'Facility X' },
  { id: '2', name: 'Project 2', lga: 'LGA B', facility: 'Facility Y' },
  { id: '3', name: 'Project 3', lga: 'LGA A', facility: 'Facility Z' },
  { id: '4', name: 'Project 4', lga: 'LGA C', facility: 'Facility X' },
];

export default function Projects() {
  const [lgaFilter, setLgaFilter] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [projects, setProjects] = useState([]);

  // Filter projects based on LGA and Facility
  const filteredProjects = projects.filter((project) => {
    const matchesLga = lgaFilter ? project.lga === lgaFilter : true;
    const matchesFacility = facilityFilter ? project.facility === facilityFilter : true;
    return matchesLga && matchesFacility;
  });

  const getProjects = async () => {
    const res = await axios.get(`${baseURL}/projects`);
    setProjects(res.data);
  };
      
  useEffect(async() => {
   getProjects();

  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Projects</Text>

      {/* Filter by LGA */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by LGA:</Text>
        {/* <Picker
          selectedValue={lgaFilter}
          onValueChange={(itemValue) => setLgaFilter(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="LGA A" value="LGA A" />
          <Picker.Item label="LGA B" value="LGA B" />
          <Picker.Item label="LGA C" value="LGA C" />
        </Picker> */}
      </View>

      {/* Filter by Facility */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Facility:</Text>
        {/* <Picker
          selectedValue={facilityFilter}
          onValueChange={(itemValue) => setFacilityFilter(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="All" value="" />
          <Picker.Item label="Facility X" value="Facility X" />
          <Picker.Item label="Facility Y" value="Facility Y" />
          <Picker.Item label="Facility Z" value="Facility Z" />
        </Picker> */}
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