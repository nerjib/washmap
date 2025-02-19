import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  const menuItems = [
    { id: '1', title: 'Sanitation', route: '/projects' },
    { id: '2', title: 'ODF Report', route: '/odf-report' },
    { id: '3', title: 'Daily Progress', route: '/projects' },
    { id: '4', title: 'Projects', route: '/projects' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WASH MAP</Text>
      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Link href={item.route} key={item.id} asChild>
            <TouchableOpacity style={styles.item}>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  item: {
    width: '48%', // Two items per row with a small gap
    aspectRatio: 1, // Square shape
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});