import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign'; // For back arrow
import BellIcon from 'react-native-vector-icons/Feather'; // For notification bell
// Import other icons needed for the features grid
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'; 
import Feather from 'react-native-vector-icons/Feather'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'; 

// Data for the feature grid
const features = [
  { icon: 'dollar-sign', label: 'Best Rate', library: Feather },
  { icon: 'wind', label: 'Air Conditioned', library: Feather },
  { icon: 'wifi', label: 'WiFi', library: Feather },
  { icon: 'parking', label: 'Parking', library: FontAwesome5 },
  { icon: 'silverware-fork-knife', label: 'Refreshments Availlible', library: MaterialCommunityIcons },
  { icon: 'laptop', label: 'Multimedia Availlible', library: Feather },
];

// Component for a single feature tile
const FeatureTile = ({ icon, label, library: Library }) => (
  <TouchableOpacity style={styles.featureTile} disabled={true}>
    <Library name={icon} size={30} color="#B8860B" />
    <Text style={styles.featureLabel}>{label}</Text>
  </TouchableOpacity>
);

const ConferenceRoomDetailsScreen = ({ navigation }) => {
  // Assuming 'navigation' prop is passed to switch to the booking screen
  const handleBookNow = () => {
    // Replace with actual navigation logic
    console.log('Navigate to Conference Room Booking Screen');
    navigation.navigate('ConferenceRoomBooking'); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D2B48C" />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* --- Header Section --- */}
        <View style={styles.headerBackground}>
          <View style={styles.headerBar}>
            <Icon name="arrowleft" size={24} color="black" onPress={() => console.log('Go Back')} />
            <Text style={styles.headerTitle}>Conference Room</Text>
            <BellIcon name="bell" size={20} color="black" />
          </View>
          {/* Placeholder for the large image/tabs below the header */}
          <View style={styles.largeTabContainer}>
            <View style={styles.largeTabPlaceholder}></View>
            <View style={styles.largeTabPlaceholder}></View>
          </View>
        </View>

        {/* --- Features Card --- */}
        <View style={styles.featuresCard}>
          <View style={styles.whyHeader}>
            <Text style={styles.whyHeaderTextActive}>WHY OUR </Text>
            <Text style={styles.whyHeaderTextInactive}>CONFERENCE ROOM</Text>
          </View>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureTile 
                key={index}
                icon={feature.icon}
                label={feature.label}
                library={feature.library}
              />
            ))}
          </View>
        </View>
        
      </ScrollView>
      
      {/* --- Book Now Button (Fixed to bottom) --- */}
      <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
        <Text style={styles.bookNowButtonText}>Book Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    paddingBottom: 20, // Space above the fixed button
  },
  // Header Styles
  headerBackground: {
    backgroundColor: '#D2B48C',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  // Large Tabs/Image Placeholders
  largeTabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
  },
  largeTabPlaceholder: {
    width: '45%',
    height: 120, 
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
  },
  // Features Card
  featuresCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: -30, 
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  whyHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  whyHeaderTextActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  whyHeaderTextInactive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B8860B',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  featureTile: {
    width: '30%', // Three tiles per row
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    marginHorizontal: 4,
  },
  featureLabel: {
    marginTop: 5,
    fontSize: 12,
    textAlign: 'center',
    color: '#555',
  },
  // Book Now Button
  bookNowButton: {
    paddingVertical: 18,
    backgroundColor: '#B8860B', 
    alignItems: 'center',
  },
  bookNowButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ConferenceRoomDetailsScreen;