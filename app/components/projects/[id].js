import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

export default function ProjectDetails() {
  // const { id } = useLocalSearchParams();
  const params = useLocalSearchParams()
  const [project, setProject] = useState(params);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchProject = async () => {
  //     try {
  //       const response = await fetch(`https://yourapi.com/projects/${id}`);
  //       const data = await response.json();
  //       setProject(data);
  //     } catch (error) {
  //       console.error('Error fetching project:', error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchProject();
  // }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Project not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project Details</Text>

      {/* Display project details */}
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Facility Name:</Text>
        <Text style={styles.detailValue}>{project.title}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Community:</Text>
        <Text style={styles.detailValue}>{project.community}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>LGA:</Text>
        <Text style={styles.detailValue}>{project.lga}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Ward:</Text>
        <Text style={styles.detailValue}>{project.ward}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Contractor:</Text>
        <Text style={styles.detailValue}>{project.contractor}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Status:</Text>
        <Text style={styles.detailValue}>{project.status}</Text>
      </View>
      <Link href={{pathname:`/components/reports/${project.id}`, params: project}} asChild>
        <Button title="Submit Report" />
      </Link>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  detailValue: {
    flex: 1,
  },
};