import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function DailyProgress() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Daily Progress Report</Text>
      <Text style={styles.paragraph}>
        A daily progress report is a communication tool that individuals and teams use to report on their work-related activities. It is a summary of what was accomplished during the day, what is planned for the next day, and any issues or roadblocks that were encountered. Daily progress reports are an important part of project management and can help to keep projects on track.
      </Text>
      <Text style={styles.paragraph}>
        The purpose of a daily progress report is to provide a clear and concise summary of the work that has been done. This information can be used by managers to track the progress of a project, identify any potential problems, and make sure that everyone is on the same page. Daily progress reports can also be used to communicate with clients and other stakeholders.
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
