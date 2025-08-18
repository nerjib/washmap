import { StyleSheet, Image, Platform, View, Text, TouchableOpacity } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigation } from 'expo-router';

export default function Projects() {
  const navigation = useNavigation();
    const [projects, setProjects] = useState([]);
    const [showLoader, setShowLoader] = useState(false);

    const getProjects = async () => {
      setShowLoader(true);
        const res = await axios.get(`https://ruwassa-69889b243ddb.herokuapp.com/api/v1/ruwassa/projects`);
        setProjects(res.data);
        setShowLoader(false);
        // console.log(res.data);
    }

    useEffect(() => {
        getProjects();
    }, []);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <Image
          source={require('@/assets/images/192.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Projects</ThemedText>
        {showLoader && <ThemedText>Loading...</ThemedText>}
      </ThemedView>
      {/* <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing k">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible> */}
      {projects.map((project) => 
        <View key={project.id}>
            <TouchableOpacity style={styles.row}
              onPress={() => {navigation.navigate('details', {data: JSON.stringify(project)})}}
            >
            <Text style={styles.title}>
            <Text  style={styles.txtname} > {project.community}</Text>
            <Text>{project.lga}</Text>
            </Text>
            <Text style={styles.txtloc}>
              {/* <Text style={{}}>200-4-3<Text style={styles.sep}>-</Text></Text>
            <Text style={styles.txtstat}>2025-6-5</Text>
            <Text style={styles.sep}>|</Text> */}
            <Text style={styles.txtstat}>{project.status}</Text>
            <Text style={styles.sep}>|</Text>
            <Text style={{textAlign:'right',color:"#fba9aa", marginLeft:20}}> {project.title}</Text>

            </Text>
            </TouchableOpacity>
        
        </View>)}
    </ParallaxScrollView>
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
     
    marginTop:2,
    marginLeft:10,
    marginRight:10,
    // height:50,
    padding:0,
    alignContent:'center',
    backgroundColor:'#00a9f9',
},
txtname:{
    textAlign:'left',
    fontSize:20,
    color:'white'
},
txtloc:{
    flexDirection:'column',
    textAlign:'right',
    alignItems:'center',
   fontSize:12,
   color:'white'
},
title:{
   color:'#b1fff5'
},

txtstat:{
   margin:30,
   color:'white'
},
sep:{
   color:'#b1fff5',
   fontSize:20

},
reactLogo: {
  height: '100%',
  width: '100%',
  // bottom: 0,
  // left: 0,
  position: 'absolute',
},
});
