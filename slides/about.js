import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image
} from 'react-native';

const about = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>

        
        <ImageBackground
          source={require('../assets/logo.jpeg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.ctext}>About PSC</Text>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

            {/* About PSC Card */}
            <View style={styles.card}>
              <Text style={styles.contentText}>
                Established in 1863 as the "Games Club", the Peshawar Services Club (PSC) has undergone various transformations, from being the HQ for the Vale Hunt Club in 1870 to "Peshawar Club" in 1899. Since 1947, its name changed multiple times until settling on "Peshawar Services Club" in 2011.
              </Text>
              <Text style={styles.contentText}>
                Spanning acres of land, PSC offers its members a place for socializing, various amenities, including indoor and outdoor sports facilities, dining areas, and elegant accommodations.
              </Text>
            </View>

            {/* Down the Memory Lane Section */}
            <View style={styles.lineContainer}>
              <View style={styles.line} />
              <Text style={styles.lineText}>Down the Memory Lane</Text>
              <View style={styles.line} />
            </View>

            {/* Image 1 */}
            <View style={styles.imageCard}>
              <Image
                source={require('../assets/logo.jpeg')}
                style={styles.memoryImage}
                resizeMode="cover"
              />
              <Text style={styles.imageCaption}>Club Premier View from Mall Road (1863)</Text>
            </View>

            {/* Image 2 */}
            <View style={styles.imageCard}>
              <Image
                source={require('../assets/logo.jpeg')}
                style={styles.memoryImage}
                resizeMode="cover"
              />
              <Text style={styles.imageCaption}>Peshawar Vale Hunt (1880)</Text>
            </View>

            {/* Image 3 */}
            <View style={styles.imageCard}>
              <Image
                source={require('../assets/logo.jpeg')}
                style={styles.memoryImage}
                resizeMode="cover"
              />
              <Text style={styles.imageCaption}>Peshawar Club Limited (1940)</Text>
            </View>

            {/* Image 4 */}
            <View style={styles.imageCard}>
              <Image
                source={require('../assets/logo.jpeg')}
                style={styles.memoryImage}
                resizeMode="cover"
              />
              <Text style={styles.imageCaption}>Peshawar Service Club (2023)</Text>
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  notch: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  notchImage: {
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  ctext: {
    paddingBottom: 10,
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#f1e3dcff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 24,
    textAlign: 'justify',
    marginBottom: 12,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#A3834C',
  },
  lineText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A3834C',
  },
  imageCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  memoryImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  imageCaption: {
    fontSize: 15,
    color: '#A3834C',
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 5,
  },
});

export default about;