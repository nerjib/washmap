import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Link } from 'expo-router';
import axios from 'axios';
import { baseURL } from '../../services/config';
import { UserContext } from '../../context/contextUser';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const getFacilityIcon = (facility) => {
    switch (facility) {
        case 'HPBH':
            return 'water-pump';
        case 'SMBH':
            return 'solar-power';
        case 'VIP':
            return 'toilet';
        case 'FLBH':
            return 'arrow-up-bold-circle-outline';
        default:
            return 'cogs';
    }
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'Completed':
            return styles.statusCompleted;
        case 'Ongoing':
            return styles.statusOngoing;
        case 'Abandoned':
            return styles.statusAbandoned;
        default:
            return {};
    }
};

export default function Projects() {
  const { user } = useContext(UserContext);
  const [lgaFilter, setLgaFilter] = useState('All');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [projects, setProjects] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);

  const getProjects = async () => {
    if (!user || !user.id) {
      setPageLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${baseURL}/projects/supervisor/${user.id}`);
      setProjects(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    getProjects();
  }, [user]);

  const filteredProjects = projects.filter((project) => {
    const matchesLga = lgaFilter === 'All' || project.lga === lgaFilter;
    const matchesFacility = facilityFilter === 'All' || project.title === facilityFilter;
    return matchesLga && matchesFacility;
  });

  const lgaList = ['All', 'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jemaa', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'];

  if (pageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Projects</Text>

      {/* <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Facility:</Text>
        <Picker
          selectedValue={facilityFilter}
          onValueChange={(itemValue) => setFacilityFilter(itemValue)}
          style={styles.picker}
        >
          <Picker.Item value="All" label="All Facilities" />
          <Picker.Item value="HPBH" label="Handpump Borehole" />
          <Picker.Item value="SMBH" label="Solar Motorized" />
          <Picker.Item value="FLBH" label="Force Lift Borehole" />
          <Picker.Item value="VIP" label="VIP Latrine" />
        </Picker>
      </View> */}

      {/* <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by LGA:</Text>
        <Picker
          selectedValue={lgaFilter}
          onValueChange={(itemValue) => setLgaFilter(itemValue)}
          style={styles.picker}
        >
          {lgaList?.map(e =>
            <Picker.Item label={e} value={e} key={e} />
          )}
        </Picker>
      </View> */}

      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
            <Link href={{ pathname: `/components/reports/daily`, params: item }} asChild>
                <TouchableOpacity style={styles.projectItem}>
                    <View style={styles.itemIcon}>
                        <MaterialCommunityIcons name={getFacilityIcon(item.title)} size={32} color="#007bff" />
                    </View>
                    <View style={styles.itemContent}>
                        <Text style={styles.projectName}>{item.community}</Text>
                        <Text style={styles.projectLga}>{item.lga}</Text>
                        <Text style={styles.projectFacility}>{item.title}</Text>
                    </View>
                    <View style={styles.itemStatus}>
                        <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>{item.status}</Text>
                    </View>
                </TouchableOpacity>
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
        backgroundColor: '#f0f4f8',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    filterContainer: {
        marginBottom: 20,
    },
    filterLabel: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
    },
    picker: {
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        color: '#333',
    },
    projectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemIcon: {
        marginRight: 15,
    },
    itemContent: {
        flex: 1,
    },
    projectName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    projectLga: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    projectFacility: {
        fontSize: 12,
        color: '#007bff',
        fontStyle: 'italic',
        marginTop: 4,
    },
    itemStatus: {
        marginLeft: 10,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        overflow: 'hidden',
    },
    statusCompleted: {
        backgroundColor: '#28a745',
    },
    statusOngoing: {
        backgroundColor: '#ffc107',
        color: '#000',
    },
    statusAbandoned: {
        backgroundColor: '#dc3545',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
});
