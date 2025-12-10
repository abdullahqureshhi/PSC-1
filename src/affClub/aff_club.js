// //ATIF ERROR THEK KREGA REQUESTED DATA WALA USKE BAAD YEH CODE HOGA 
// import React, { useState, useEffect } from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   View,
//   StatusBar,
//   ScrollView,
//   TouchableOpacity,
//   ImageBackground,
//   Modal,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Platform,
// } from 'react-native';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { getAffiliatedClubs, createAffiliatedClubRequest, getUserData } from '../config/apis';

// const aff_club = () => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedClub, setSelectedClub] = useState(null);
//   const [clubs, setClubs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [clubsLoading, setClubsLoading] = useState(true);
//   const [showDatePicker, setShowDatePicker] = useState(false);
  
//   // Form state
//   const [visitDate, setVisitDate] = useState(new Date());
//   const [guestCount, setGuestCount] = useState('');
//   const [purpose, setPurpose] = useState('');
//   const [memberId, setMemberId] = useState('');
//   const [userProfile, setUserProfile] = useState(null);

//   useEffect(() => {
//     fetchUserProfile();
//     fetchAffiliatedClubs();
//   }, []);

//   const fetchUserProfile = async () => {
//     try {
//       const profile = await getUserData();
//       setUserProfile(profile);
//       // Extract member ID from profile - adjust based on your API response structure
//       setMemberId(profile.membershipNumber || profile.memberId || profile.id || '');
//     } catch (error) {
//       console.log('Error fetching user profile:', error);
//       Alert.alert('Error', 'Failed to load user information');
//     }
//   };

//   const fetchAffiliatedClubs = async () => {
//     try {
//       setClubsLoading(true);
//       const clubsData = await getAffiliatedClubs();
//       // Filter only active clubs if needed
//       const activeClubs = clubsData.filter(club => club.isActive !== false);
//       setClubs(activeClubs);
//     } catch (error) {
//       console.log('Error fetching clubs:', error);
//       Alert.alert('Error', 'Failed to load clubs. Please try again.');
//     } finally {
//       setClubsLoading(false);
//     }
//   };

//   const openVisitModal = (club) => {
//     setSelectedClub(club);
//     // Reset form fields
//     setVisitDate(new Date());
//     setGuestCount('');
//     setPurpose('');
//     setModalVisible(true);
//   };

//   const handleDateChange = (event, selectedDate) => {
//     setShowDatePicker(Platform.OS === 'ios');
//     if (selectedDate) {
//       setVisitDate(selectedDate);
//     }
//   };

//   const formatDate = (date) => {
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//     });
//   };

//   const handleSendVisitRequest = async () => {
//     // Validation
//     if (!memberId.trim()) {
//       Alert.alert('Error', 'Member ID is required');
//       return;
//     }

//     if (!visitDate) {
//       Alert.alert('Error', 'Please select a visit date');
//       return;
//     }

//     if (guestCount && (parseInt(guestCount) < 0 || parseInt(guestCount) > 10)) {
//       Alert.alert('Error', 'Guest count must be between 0 and 10');
//       return;
//     }

//     setLoading(true);

//     try {
//       const requestData = {
//         affiliatedClubId: selectedClub.id,
//         membershipNo: memberId,
//         requestedDate: visitDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
//         guestCount: guestCount ? parseInt(guestCount) : 0,
//         purpose: purpose || undefined,
//       };

//       const response = await createAffiliatedClubRequest(requestData);
      
//       Alert.alert(
//         'Success', 
//         'Visit request submitted successfully!',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setModalVisible(false);
//               // Clear form
//               setGuestCount('');
//               setPurpose('');
//             }
//           }
//         ]
//       );
      
//     } catch (error) {
//       console.log('Error submitting request:', error);
//       Alert.alert(
//         'Error',
//         error.message || 'Failed to submit visit request. Please try again.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderClubs = () => {
//     if (clubsLoading) {
//       return (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#A3834C" />
//           <Text style={styles.loadingText}>Loading clubs...</Text>
//         </View>
//       );
//     }

//     if (clubs.length === 0) {
//       return (
//         <View style={styles.emptyContainer}>
//           <Text style={styles.emptyText}>No affiliated clubs available</Text>
//         </View>
//       );
//     }

//     return clubs.map((club, index) => (
//       <View key={club.id || index} style={styles.card}>
//         <Text style={styles.clubName}>{club.name}</Text>
        
//         {club.location && (
//           <Text style={styles.clubAddress}>• {club.location}</Text>
//         )}
        
//         {club.address && (
//           <Text style={styles.clubAddress}>• {club.address}</Text>
//         )}
        
//         {club.contactNo && (
//           <Text style={styles.clubContact}>• {club.contactNo}</Text>
//         )}
        
//         {club.description && (
//           <Text style={styles.clubDescription}>{club.description}</Text>
//         )}

//         <TouchableOpacity
//           style={styles.visitButton}
//           onPress={() => openVisitModal(club)}>
//           <Text style={styles.visitButtonText}>Request Visit</Text>
//         </TouchableOpacity>
//       </View>
//     ));
//   };

//   return (
//     <>
//       <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
//       <View style={styles.container}>
//         {/* Header */}
//         <ImageBackground
//           source={require('../assets/logo.jpeg')}
//           style={styles.notch}
//           imageStyle={styles.notchImage}>
//           <Text style={styles.ctext}>Affiliated Clubs</Text>
//         </ImageBackground>

//         <SafeAreaView style={styles.safeArea}>
//           <ScrollView
//             style={styles.scrollView}
//             contentContainerStyle={styles.scrollContent}
//             showsVerticalScrollIndicator={false}>
//             <Text style={styles.mainHeading}>Available Clubs</Text>
//             {renderClubs()}
//           </ScrollView>
//         </SafeAreaView>

//         {/* Visit Request Modal */}
//         <Modal
//           animationType="slide"
//           transparent={true}
//           visible={modalVisible}
//           onRequestClose={() => setModalVisible(false)}>
//           <View style={styles.modalOverlay}>
//             <ScrollView contentContainerStyle={styles.modalScrollContent}>
//               <View style={styles.modalView}>
//                 <Text style={styles.modalTitle}>
//                   Visit Request - {selectedClub?.name}
//                 </Text>

//                 {/* Member ID (Auto-filled but editable) */}
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Member ID</Text>
//                   <TextInput
//                     value={memberId}
//                     onChangeText={setMemberId}
//                     style={styles.input}
//                     placeholderTextColor="#888"
//                     editable={true}
//                   />
//                 </View>

//                 {/* Visit Date Picker */}
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Visit Date</Text>
//                   <TouchableOpacity
//                     style={styles.datePickerButton}
//                     onPress={() => setShowDatePicker(true)}>
//                     <Text style={styles.dateText}>
//                       {formatDate(visitDate)}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Date Picker */}
//                 {showDatePicker && (
//                   <DateTimePicker
//                     value={visitDate}
//                     mode="date"
//                     display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//                     onChange={handleDateChange}
//                     minimumDate={new Date()}
//                     style={styles.datePicker}
//                   />
//                 )}

//                 {/* Number of Guests */}
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Number of Guests</Text>
//                   <TextInput
//                     placeholder="0"
//                     value={guestCount}
//                     onChangeText={(text) => {
//                       // Allow only numbers
//                       if (text === '' || /^\d+$/.test(text)) {
//                         setGuestCount(text);
//                       }
//                     }}
//                     style={styles.input}
//                     placeholderTextColor="#888"
//                     keyboardType="numeric"
//                     maxLength={2}
//                   />
//                 </View>

//                 {/* Purpose/Reason */}
//                 <View style={styles.inputContainer}>
//                   <Text style={styles.inputLabel}>Purpose/Reason (Optional)</Text>
//                   <TextInput
//                     placeholder="Enter purpose of visit..."
//                     value={purpose}
//                     onChangeText={setPurpose}
//                     style={[styles.input, styles.textArea]}
//                     placeholderTextColor="#888"
//                     multiline={true}
//                     numberOfLines={4}
//                     textAlignVertical="top"
//                   />
//                 </View>

//                 {/* Club Info Summary */}
//                 {selectedClub && (
//                   <View style={styles.clubInfoSummary}>
//                     <Text style={styles.summaryTitle}>Club Information:</Text>
//                     <Text style={styles.summaryText}>
//                       <Text style={styles.summaryLabel}>Name: </Text>
//                       {selectedClub.name}
//                     </Text>
//                     {selectedClub.location && (
//                       <Text style={styles.summaryText}>
//                         <Text style={styles.summaryLabel}>Location: </Text>
//                         {selectedClub.location}
//                       </Text>
//                     )}
//                     {selectedClub.contactNo && (
//                       <Text style={styles.summaryText}>
//                         <Text style={styles.summaryLabel}>Contact: </Text>
//                         {selectedClub.contactNo}
//                       </Text>
//                     )}
//                   </View>
//                 )}

//                 {/* Action Buttons */}
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity
//                     style={[styles.modalBtn, styles.cancelBtn]}
//                     onPress={() => setModalVisible(false)}
//                     disabled={loading}>
//                     <Text style={styles.modalBtnText}>Cancel</Text>
//                   </TouchableOpacity>

//                   <TouchableOpacity
//                     style={[styles.modalBtn, styles.sendBtn]}
//                     onPress={handleSendVisitRequest}
//                     disabled={loading}>
//                     {loading ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <Text style={styles.modalBtnText}>Submit Request</Text>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </ScrollView>
//           </View>
//         </Modal>
//       </View>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#F5F5F5' 
//   },
//   notch: {
//     paddingTop: 60,
//     paddingBottom: 20,
//     borderBottomEndRadius: 30,
//     borderBottomStartRadius: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   notchImage: { 
//     resizeMode: 'cover' 
//   },
//   ctext: { 
//     fontSize: 25, 
//     fontWeight: 'bold', 
//     color: '#000000' 
//   },
//   safeArea: { 
//     flex: 1 
//   },
//   scrollView: { 
//     flex: 1 
//   },
//   scrollContent: { 
//     paddingVertical: 20, 
//     paddingHorizontal: 20 
//   },
//   mainHeading: {
//     textAlign: 'center',
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     color: '#000',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 40,
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#666',
//     fontSize: 16,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
//   card: {
//     backgroundColor: '#f1e3dcff',
//     borderRadius: 15,
//     padding: 20,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   clubName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#A3834C',
//     marginBottom: 8,
//   },
//   clubAddress: { 
//     fontSize: 14, 
//     color: '#333', 
//     marginBottom: 4 
//   },
//   clubContact: { 
//     fontSize: 14, 
//     color: '#333', 
//     marginBottom: 4 
//   },
//   clubDescription: {
//     fontSize: 14,
//     color: '#666',
//     fontStyle: 'italic',
//     marginTop: 8,
//     marginBottom: 12,
//   },
//   visitButton: {
//     marginTop: 10,
//     alignSelf: 'flex-start',
//     backgroundColor: '#A3834C',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//   },
//   visitButtonText: { 
//     color: '#fff', 
//     fontWeight: 'bold', 
//     fontSize: 16 
//   },
//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//   },
//   modalScrollContent: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalView: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#A3834C',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   inputContainer: {
//     marginBottom: 15,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 5,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#f9f9f9',
//   },
//   textArea: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   datePickerButton: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     backgroundColor: '#f9f9f9',
//   },
//   dateText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   datePicker: {
//     marginVertical: 10,
//   },
//   clubInfoSummary: {
//     backgroundColor: '#f8f9fa',
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 15,
//     borderLeftWidth: 4,
//     borderLeftColor: '#A3834C',
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 8,
//   },
//   summaryText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 4,
//   },
//   summaryLabel: {
//     fontWeight: '600',
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 10,
//   },
//   modalBtn: {
//     flex: 1,
//     marginHorizontal: 5,
//     borderRadius: 10,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   cancelBtn: { 
//     backgroundColor: '#6c757d' 
//   },
//   sendBtn: { 
//     backgroundColor: '#A3834C' 
//   },
//   modalBtnText: { 
//     color: '#fff', 
//     fontWeight: 'bold', 
//     fontSize: 16 
//   },
// });

// export default aff_club;

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { getAffiliatedClubs, createAffiliatedClubRequest, getUserData } from '../../config/apis';

const aff_club = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clubsLoading, setClubsLoading] = useState(true);
  
  // Form state (removed visitDate and showDatePicker)
  const [guestCount, setGuestCount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [memberId, setMemberId] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchAffiliatedClubs();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const profile = await getUserData();
      setUserProfile(profile);
      // Extract member ID from profile - adjust based on your API response structure
      setMemberId(profile.membershipNumber || profile.memberId || profile.id || '');
    } catch (error) {
      console.log('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load user information');
    }
  };

  const fetchAffiliatedClubs = async () => {
    try {
      setClubsLoading(true);
      const clubsData = await getAffiliatedClubs();
      // Filter only active clubs if needed
      const activeClubs = clubsData.filter(club => club.isActive !== false);
      setClubs(activeClubs);
    } catch (error) {
      console.log('Error fetching clubs:', error);
      Alert.alert('Error', 'Failed to load clubs. Please try again.');
    } finally {
      setClubsLoading(false);
    }
  };

  const openVisitModal = (club) => {
    setSelectedClub(club);
    // Reset form fields (removed visitDate)
    setGuestCount('');
    setPurpose('');
    setModalVisible(true);
  };

  const handleSendVisitRequest = async () => {
    // Validation
    if (!memberId.trim()) {
      Alert.alert('Error', 'Member ID is required');
      return;
    }

    // Removed visitDate validation

    if (guestCount && (parseInt(guestCount) < 0 || parseInt(guestCount) > 10)) {
      Alert.alert('Error', 'Guest count must be between 0 and 10');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        affiliatedClubId: selectedClub.id,
        membershipNo: memberId,
        // Removed requestedDate field
        guestCount: guestCount ? parseInt(guestCount) : 0,
        purpose: purpose || undefined,
      };

      const response = await createAffiliatedClubRequest(requestData);
      
      Alert.alert(
        'Success', 
        'Visit request submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              setModalVisible(false);
              // Clear form
              setGuestCount('');
              setPurpose('');
            }
          }
        ]
      );
      
    } catch (error) {
      console.log('Error submitting request:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit visit request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderClubs = () => {
    if (clubsLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A3834C" />
          <Text style={styles.loadingText}>Loading clubs...</Text>
        </View>
      );
    }

    if (clubs.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No affiliated clubs available</Text>
        </View>
      );
    }

    return clubs.map((club, index) => (
      <View key={club.id || index} style={styles.card}>
        <Text style={styles.clubName}>{club.name}</Text>
        
        {club.location && (
          <Text style={styles.clubAddress}>• {club.location}</Text>
        )}
        
        {club.address && (
          <Text style={styles.clubAddress}>• {club.address}</Text>
        )}
        
        {club.contactNo && (
          <Text style={styles.clubContact}>• {club.contactNo}</Text>
        )}
        
        {club.description && (
          <Text style={styles.clubDescription}>{club.description}</Text>
        )}

        <TouchableOpacity
          style={styles.visitButton}
          onPress={() => openVisitModal(club)}>
          <Text style={styles.visitButtonText}>Request Visit</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        {/* Header */}
        <ImageBackground
          source={require('../../assets/logo.jpeg')}
          style={styles.notch}
          imageStyle={styles.notchImage}>
          <Text style={styles.ctext}>Affiliated Clubs</Text>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <Text style={styles.mainHeading}>Available Clubs</Text>
            {renderClubs()}
          </ScrollView>
        </SafeAreaView>

        {/* Visit Request Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalView}>
                <Text style={styles.modalTitle}>
                  Visit Request - {selectedClub?.name}
                </Text>

                {/* Member ID (Auto-filled but editable) */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Member ID</Text>
                  <TextInput
                    value={memberId}
                    onChangeText={setMemberId}
                    style={styles.input}
                    placeholderTextColor="#888"
                    editable={true}
                  />
                </View>

                {/* Removed Visit Date Picker section */}

                {/* Number of Guests */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Number of Guests</Text>
                  <TextInput
                    placeholder="0"
                    value={guestCount}
                    onChangeText={(text) => {
                      // Allow only numbers
                      if (text === '' || /^\d+$/.test(text)) {
                        setGuestCount(text);
                      }
                    }}
                    style={styles.input}
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>

                {/* Purpose/Reason */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Purpose/Reason (Optional)</Text>
                  <TextInput
                    placeholder="Enter purpose of visit..."
                    value={purpose}
                    onChangeText={setPurpose}
                    style={[styles.input, styles.textArea]}
                    placeholderTextColor="#888"
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Club Info Summary */}
                {selectedClub && (
                  <View style={styles.clubInfoSummary}>
                    <Text style={styles.summaryTitle}>Club Information:</Text>
                    <Text style={styles.summaryText}>
                      <Text style={styles.summaryLabel}>Name: </Text>
                      {selectedClub.name}
                    </Text>
                    {selectedClub.location && (
                      <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Location: </Text>
                        {selectedClub.location}
                      </Text>
                    )}
                    {selectedClub.contactNo && (
                      <Text style={styles.summaryText}>
                        <Text style={styles.summaryLabel}>Contact: </Text>
                        {selectedClub.contactNo}
                      </Text>
                    )}
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                    disabled={loading}>
                    <Text style={styles.modalBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, styles.sendBtn]}
                    onPress={handleSendVisitRequest}
                    disabled={loading}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalBtnText}>Submit Request</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5' 
  },
  notch: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notchImage: { 
    resizeMode: 'cover' 
  },
  ctext: { 
    fontSize: 25, 
    fontWeight: 'bold', 
    color: '#000000' 
  },
  safeArea: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1 
  },
  scrollContent: { 
    paddingVertical: 20, 
    paddingHorizontal: 20 
  },
  mainHeading: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
  clubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A3834C',
    marginBottom: 8,
  },
  clubAddress: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 4 
  },
  clubContact: { 
    fontSize: 14, 
    color: '#333', 
    marginBottom: 4 
  },
  clubDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    marginBottom: 12,
  },
  visitButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#A3834C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  visitButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalView: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A3834C',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  clubInfoSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#A3834C',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtn: { 
    backgroundColor: '#6c757d' 
  },
  sendBtn: { 
    backgroundColor: '#A3834C' 
  },
  modalBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});

export default aff_club;