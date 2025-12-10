import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

const events = ({ navigation }) => {

  const sportsData = [
    { 
      id: 1,
      title: 'Vintage Car Rally',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => navigation.navigate('ClubArenaScreen'),
    },
    { 
      id: 2,
      title: 'Grand Tambola Night',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Aerobics + Gym coming soon!'),
    },
    { 
      id: 3,
      title: 'Chand Raat',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Badminton coming soon!'),
    },
    { 
      id: 4,
      title: 'New Year Night',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Gym + Jogging Track coming soon!'),
    },
    { 
      id: 5,
      title: 'Spring Festival',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Tennis Courts coming soon!'),
    },
    { 
      id: 6,
      title: 'Live Screening of Matches',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Squash Courts coming soon!'),
    },
    { 
      id: 7,
      title: 'Saturday Night Buffet',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Billiards coming soon!'),
    },
     { 
      id: 8,
      title: 'Saturday Night Buffet',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Billiards coming soon!'),
    },
     { 
      id: 9,
      title: 'Hi Tea',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Billiards coming soon!'),
    },
     { 
      id: 10,
      title: 'Sunday Brunch',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => alert('Billiards coming soon!'),
    },
  ];

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* 🔹 Notch Header */}
        <ImageBackground
          source={require('../assets/psc_home.jpeg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()} // ✅ Back button now works
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Sports</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        {/* 🔹 Main Scrollable Content */}
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 🔹 Sports Cards */}
            {sportsData.map((sport) => (
              <TouchableOpacity 
                key={sport.id} 
                style={styles.sportCard}
                onPress={sport.onPress} // ✅ Navigation fixed
              >
                <ImageBackground
                  source={sport.image}
                  style={styles.sportCardBackground}
                  imageStyle={styles.sportCardImage}
                >
                  <View style={styles.overlay} />
                  <View style={styles.sportCardContent}>
                    <Text style={styles.sportTitle}>{sport.title}</Text>
                    <View style={styles.arrowContainer}>
                      <Text style={styles.arrowIcon}>›</Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 120,
  },
  notchImage: {
    resizeMode: 'cover',
  },
  notchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
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
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sportCard: {
    height: 120,
    width: '100%',
    marginBottom: 12,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  sportCardBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  sportCardImage: {
    borderRadius: 15,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sportCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  sportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 6,
  },
  arrowContainer: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'absolute',
    right: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
    position: 'absolute',
    right: -15,
  },
});

export default events;
