import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Projects() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Projects</Text>
      <Text style={styles.paragraph}>
        A project is a temporary endeavor with a defined beginning and end, undertaken to meet unique goals and objectives, typically to bring about beneficial change or added value. The temporary nature of projects stands in contrast with business as usual (or operations), which are repetitive, permanent, or semi-permanent functional activities to produce products or services.
      </Text>
      <Text style={styles.paragraph}>
        In practice, the management of such distinct production approaches requires the development of distinct technical skills and management strategies. The primary challenge of project management is to achieve all of the project goals and objectives while honoring the preconceived constraints. The primary constraints are scope, time, quality and budget. The secondary — and more ambitious — challenge is to optimize the allocation of necessary inputs and integrate them to meet pre-defined objectives.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    textAlign: 'justify',
    color: '#495057',
  },
});
