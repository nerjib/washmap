import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ODF() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Open Defecation</Text>
      <Text style={styles.paragraph}>
        Open defecation is the human practice of defecating outside ("in the open") rather than into a toilet. People may choose fields, bushes, forests, ditches, streets, canals, or other open spaces for defecation. They do so either because they do not have a toilet readily accessible or due to traditional cultural practices. The practice is common where sanitation infrastructure and services are not available. Even if toilets are available, behavior change efforts may still be needed to promote the use of toilets. 'Open defecation free' (ODF) is a central term for community-led total sanitation (CLTS) programs. It is a term used to describe communities that have shifted to using toilets instead of open defecation.
      </Text>
      <Text style={styles.paragraph}>
        Open defecation can pollute the environment and cause health problems. High levels of open defecation are linked to high child mortality, poor nutrition, poverty, and large disparities between rich and poor. Ending open defecation is an indicator being used to measure progress towards the Sustainable Development Goal Number 6. Extreme poverty and lack of sanitation are statistically linked. Therefore, eliminating open defecation is an important part of the effort to eliminate poverty.
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
