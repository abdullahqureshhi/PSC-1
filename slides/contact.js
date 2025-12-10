import React from 'react'; 
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
  ImageBackground
} from 'react-native';

const contact = () => {

  const handlePhonePress = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@peshawarservicesclub.com');
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        
        {/* 🔹 Notch with Image Background */}
        <ImageBackground
          source={require('../assets/logo.jpeg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <Text style={styles.ctext}>Contact Us</Text>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            
            {/* Info Desk Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Info Desk</Text>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handlePhonePress('0919212753')}>
                <Text style={styles.icon}>📞</Text>
                <Text style={styles.phoneText}>091-9212753-5</Text>
              </TouchableOpacity>
            </View>

            {/* Event Booking Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Event Booking</Text>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handlePhonePress('03419777711')}>
                <Text style={styles.icon}>📞</Text>
                <Text style={styles.phoneText}>0341-9777711</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handlePhonePress('0919212753')}>
                <Text style={styles.icon}>📞</Text>
                <Text style={styles.phoneText}>091-9212753-5</Text>
              </TouchableOpacity>
            </View>

            {/* Room Reservation Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Room Reservation</Text>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handlePhonePress('03458518696')}>
                <Text style={styles.icon}>📞</Text>
                <Text style={styles.phoneText}>03458518696</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handlePhonePress('0919212753')}>
                <Text style={styles.icon}>📞</Text>
                <Text style={styles.phoneText}>091-9212753-5</Text>
              </TouchableOpacity>
            </View>

            {/* Address Card */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Address</Text>
              <Text style={styles.addressText}>Peshawar Services Club</Text>
              <Text style={styles.addressText}>40-The Mall, Peshawar Cantt.</Text>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={() => handlePhonePress('0919212753')}>
                <Text style={styles.icon}>📞</Text>
                <Text style={styles.phoneText}>091-9212753-5</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.contactRow}
                onPress={handleEmailPress}>
                <Text style={styles.icon}>✉️</Text>
                <Text style={styles.emailText}>info@peshawarservicesclub.com</Text>
              </TouchableOpacity>
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
    overflow: 'hidden', // Ensures image respects rounded corners
  },
  notchImage: {
    resizeMode: 'cover',
  },
  ctext: {
    paddingBottom: 10,
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000000',
    // backgroundColor: 'rgba(255,255,255,0.6)', // optional for readability
    borderRadius: 10,
    paddingHorizontal: 10,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  phoneText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  addressText: {
    fontSize: 16,
    color: '#000000',
    marginVertical: 2,
  },
  emailText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
});

export default contact;
