import { StyleSheet, Image, Platform, TouchableOpacity, Text } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useLocalSearchParams, useSearchParams } from 'expo-router/build/hooks';
import { useMemo, useState } from 'react';
import RadioGroup from 'react-native-radio-buttons-group';
import { View } from 'react-native-web';
import { Link, useNavigation } from 'expo-router';


export default function ProjectDetailsScreen() {
      const navigation = useNavigation();
  const params = useLocalSearchParams()
  const [details, setDetails] = useState(JSON.parse(params.data));
  const [selectedId, setSelectedId] = useState('1');

  // const destination = params.destination
  // const details = destinationDetails[destination];
//   console.log(params);

const radioButtons = useMemo(() => ([
    {
        id: '1', // acts as primary key, should be unique and non-empty string
        label: 'Is Working',
        value: true
    },
    {
        id: '2',
        label: 'Not Working',
        value: false
    }
]), []);
  return (
    <
    //   headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
    //   headerImage={
    //     <IconSymbol
    //       size={310}
    //       color="#808080"
    //       name="chevron.left.forwardslash.chevron.right"
    //       style={styles.headerImage}
    //     />
    //   }
      >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Functionality Report for {details.title} {details.community}</ThemedText>
      </ThemedView>
      <ThemedText>This report will help us monitor the functionality of this facility</ThemedText>
      <ThemedView>
        <ThemedText>Project Title: {details?.title}</ThemedText>
        <ThemedText>Project Community: {details?.community}</ThemedText>
        <ThemedText>Project LGA: {details?.lga}</ThemedText>
        <ThemedText>Project Contractor: {details.contractor}</ThemedText>
        <ThemedText>Project Status: {details.status}</ThemedText>

        
        </ThemedView>
        <ThemedView style={{marginTop: 20, padding: 10, backgroundColor: '#fff'}}>
            <ThemedText style={{ color: "#000"}}>Is facility working</ThemedText>
            <RadioGroup color='#000'
              radioButtons={radioButtons} 
              onPress={setSelectedId}
              selectedId={selectedId}
            />
            <Link href="./(tabs)/projects" asChild>
            <TouchableOpacity style={styles.row}
                onPress={() => {alert('Report Submitted')}}
            >
            <Text style={styles.title}>Submit</Text>
            </TouchableOpacity>
            </Link>
        </ThemedView>
      
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  row:{
     
    marginTop:30,
    marginLeft:'auto',
    marginRight: 'auto',
    textAlign:'center',
    // height:50,
    padding:3,
    paddingLeft:10,
    paddingRight:10,
    alignContent:'center',
    backgroundColor:'#00a9f9',
},
});
