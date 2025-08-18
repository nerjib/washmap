import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Sanitation() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sanitation and its Importance</Text>
      <Text style={styles.paragraph}>
        Sanitation refers to public health conditions related to clean drinking water and adequate treatment and disposal of human excreta and sewage. Preventing human contact with feces is part of sanitation, as is hand washing with soap. Sanitation systems aim to protect human health by providing a clean environment that will stop the transmission of disease, especially through the fecal-oral route. For example, diarrhea, a main cause of malnutrition and stunted growth in children, can be reduced through adequate sanitation. There are many other diseases which are easily transmitted in communities that have low levels of sanitation, such as ascariasis (a type of intestinal worm infection or helminthiasis), cholera, hepatitis, polio, schistosomiasis, and trachoma, to name just a few.
      </Text>
      <Text style={styles.paragraph}>
        A range of sanitation technologies and approaches exists. Some examples are community-led total sanitation, container-based sanitation, ecological sanitation, emergency sanitation, environmental sanitation, onsite sanitation and sustainable sanitation. A sanitation system includes the capture, storage, transport, treatment and disposal or reuse of human excreta and wastewater. Reuse activities within the sanitation system may focus on the nutrients, water, energy or organic matter contained in excreta and wastewater. This is referred to as the "sanitation value chain" or "sanitation economy". The people responsible for cleaning, maintaining, operating, or emptying a sanitation technology at any step of the sanitation chain are referred to as "sanitation workers".
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
