import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Home() {
  const menuItems = [
    { id: '1', title: 'Sanitation', route: '/sanitation', icon: 'water-pump' },
    { id: '2', title: 'ODF Report', route: '/odf', icon: 'chart-bar' },
    { id: '3', title: 'Daily Progress', route: '/daily-progress', icon: 'clipboard-list-outline' },
    { id: '4', title: 'Projects', route: '/projects', icon: 'briefcase-outline' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WASH MAP</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Link href={item.route} key={item.id} asChild>
            <TouchableOpacity style={styles.item}>
              <MaterialCommunityIcons name={item.icon} size={48} color="#007bff" />
              <Text style={styles.itemText}>{item.title}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#343a40',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  item: {
    width: '45%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    color: '#495057',
  },
});
