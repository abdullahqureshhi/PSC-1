import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  ImageBackground,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DropDownPicker from 'react-native-dropdown-picker';
import { getUserData, lawnAPI, getAuthToken, base_url } from '../../config/apis';
import { useAuth } from '../auth/contexts/AuthContext';

const eventTypeOptions = [
  { label: 'Wedding Reception', value: 'wedding' },
  { label: 'Birthday Party', value: 'birthday' },
  { label: 'Corporate Event', value: 'corporate' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Family Gathering', value: 'family' },
  { label: 'Other Event', value: 'other' },
];

const timeSlotOptions = [
  { label: 'Morning (8:00 AM - 2:00 PM)', value: 'MORNING' },
  { label: 'Evening (2:00 PM - 8:00 PM)', value: 'EVENING' },
  { label: 'Night (8:00 PM - 12:00 AM)', value: 'NIGHT' },
];

const LawnBooking = ({ route, navigation }) => {
  const { venue, categoryId } = route.params || {};
  const { user, isAuthenticated } = useAuth();
  
  // State variables
  const [selectedDate, setSelectedDate] = useState('');
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [numberOfGuests, setNumberOfGuests] = useState('');
  const [timeSlotOpen, setTimeSlotOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [pricingType, setPricingType] = useState('member');

  // Member Booking States
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Extract membership number from user object
  const extractMembershipNo = () => {
    if (!user) return null;
    
    const possibleFields = [
      'membershipNo', 'membership_no', 'Membership_No', 'membershipNumber',
      'membershipID', 'memberNo', 'memberNumber', 'membershipId',
      'id', 'userId', 'user_id', 'userID'
    ];
    
    for (const field of possibleFields) {
      if (user[field]) {
        return user[field].toString();
      }
    }
    
    if (user.data && typeof user.data === 'object') {
      for (const field of possibleFields) {
        if (user.data[field]) {
          return user.data[field].toString();
        }
      }
    }
    
    return null;
  };

  const membershipNo = extractMembershipNo();
  const userName = user?.name || user?.username || user?.fullName;

  useEffect(() => {
    console.log('🎯 LawnBooking mounted with params:', {
      venue: venue,
      venueId: venue?.id,
      venueDescription: venue?.description
    });
    
    checkUserStatus();
    
    if (venue) {
      setNumberOfGuests(venue.minGuests?.toString() || '50');
    }
    
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  }, [venue]);

  const checkUserStatus = async () => {
    try {
      const userData = await getUserData();
      setUserData(userData);
      
      const currentUser = user || userData;
      
      if (!currentUser) {
        setIsAdmin(false);
        return;
      }

      const extractedUserRole = 
        currentUser.role || 
        currentUser.Role || 
        currentUser.userRole ||
        currentUser.user_role;

      const isAdminUser = extractedUserRole && (
        extractedUserRole.toLowerCase() === 'admin' || 
        extractedUserRole.toLowerCase() === 'super_admin' || 
        extractedUserRole.toLowerCase() === 'superadmin'
      );
      
      setIsAdmin(isAdminUser);
      console.log('👤 User status:', { 
        isAdmin: isAdminUser, 
        role: extractedUserRole,
        userName: userName 
      });

    } catch (error) {
      console.error('Error checking user status:', error);
      setIsAdmin(false);
    }
  };

  const validateMemberBooking = () => {
    console.log('🔍 Validating booking...');
    console.log('📝 Form data:', {
      selectedDate,
      selectedEventType,
      selectedTimeSlot,
      numberOfGuests,
      isAuthenticated,
      pricingType,
      venue: venue?.id
    });

    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'Please log in with a valid member account to book lawns.',
        [{ text: 'OK', style: 'cancel' }]
      );
      return false;
    }

    if (!selectedDate) {
      Alert.alert('Error', 'Please select a booking date');
      return false;
    }
    if (!selectedEventType) {
      Alert.alert('Error', 'Please select an event type');
      return false;
    }
    if (!selectedTimeSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return false;
    }
    if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
      Alert.alert('Error', 'Please enter number of guests');
      return false;
    }

    const bookingDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      Alert.alert('Error', 'Booking date cannot be in the past');
      return false;
    }

    // Check guest count against lawn capacity
    if (venue) {
      const guests = parseInt(numberOfGuests);
      if (venue.minGuests && guests < venue.minGuests) {
        Alert.alert('Error', `Minimum guests required: ${venue.minGuests}`);
        return false;
      }
      if (venue.maxGuests && guests > venue.maxGuests) {
        Alert.alert('Error', `Maximum guests allowed: ${venue.maxGuests}`);
        return false;
      }
    }

    console.log('✅ Validation passed');
    return true;
  };

  const handleMemberBooking = async () => {
    console.log('🚀 Starting lawn booking process...');
    
    if (!validateMemberBooking()) return;

    try {
      setBookingLoading(true);
      
      // Check auth token
      const token = await getAuthToken();
      console.log('🔑 Auth token status:', token ? 'Present' : 'Missing');
      console.log('🌐 Base URL:', base_url);
      
      const payload = {
        bookingDate: selectedDate,
        eventTime: selectedTimeSlot,
        eventType: selectedEventType,
        numberOfGuests: parseInt(numberOfGuests),
        specialRequest: specialRequests,
        pricingType: pricingType,
        membership_no: membershipNo || user?.id || 'MEMBER001', // Fallback for testing
      };

      console.log('📤 Sending lawn booking payload:', {
        lawnId: venue.id,
        payload: payload,
        fullUrl: `${base_url}/lawn/generate/invoice/lawn?lawnId=${venue.id}`
      });

      // Generate invoice for lawn booking
      const response = await lawnAPI.generateInvoiceLawn(venue.id, payload);
      
      console.log('✅ Invoice response:', response.data);
      
      if (response.data?.ResponseCode === '00') {
        Alert.alert(
          'Invoice Generated Successfully!',
          'Your lawn booking invoice has been created. Please complete the payment to confirm your reservation.',
          [
            {
              text: 'Proceed to Payment',
              onPress: () => {
                // Navigate to payment/voucher screen
                navigation.navigate('Voucher', {
                  invoiceData: response.data,
                  bookingType: 'LAWN',
                  venue: venue,
                  bookingDetails: {
                    ...payload,
                    lawnName: venue.description,
                    totalAmount: response.data.Data?.Amount,
                    bookingSummary: response.data.Data?.BookingSummary
                  }
                });
              }
            },
            {
              text: 'View Details',
              onPress: () => {
                setShowBookingModal(false);
              }
            }
          ]
        );
      } else {
        throw new Error(response.data?.ResponseMessage || 'Failed to generate invoice');
      }

    } catch (error) {
      console.error('❌ Lawn booking error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      let errorMessage = 'Failed to process booking. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
        // Optionally navigate to login
        // navigation.navigate('Login');
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid booking data provided.';
      } else if (error.response?.status === 404) {
        errorMessage = `Lawn not found or endpoint unavailable (404). Please check:\n\n• Backend server is running\n• Endpoint: POST /lawn/generate/invoice/lawn\n• Lawn ID: ${venue?.id} exists\n\nServer: ${base_url}`;
        console.log('🔍 Check if backend is running on:', base_url);
        console.log('🔍 Check if endpoint exists: POST /lawn/generate/invoice/lawn');
      } else if (error.response?.status === 409) {
        errorMessage = error.response.data?.message || 'Lawn not available for selected date and time.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = `Network error. Cannot connect to server at ${base_url}. Please check:\n\n• Internet connection\n• Backend server is running\n• CORS configuration\n\nPlatform: ${Platform.OS}`;
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Booking Failed', errorMessage);
    } finally {
      setBookingLoading(false);
      setShowBookingModal(false);
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
  };

  const calculateTotalAmount = () => {
    if (!venue) return 'Rs. 0/-';
    const price = pricingType === 'member' ? venue.memberCharges : venue.guestCharges;
    return `Rs. ${price?.toLocaleString() || '0'}/-`;
  };

  const renderMemberBookingForm = () => {
    return (
      <>
        <View style={styles.memberInfoCard}>
          <View style={styles.memberInfoHeader}>
            <Text style={styles.memberInfoTitle}>Member Information</Text>
            <TouchableOpacity onPress={checkUserStatus} style={styles.refreshButton}>
              <Feather name="refresh-cw" size={16} color="#2E7D32" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.memberInfoDisplay}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>
                {userName || 'Member'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membership No:</Text>
              <Text style={styles.infoValue}>
                {membershipNo || 'Auto-detected from login'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={[styles.infoValue, styles.sessionStatus]}>
                {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
              </Text>
            </View>
          </View>
          
          {!isAuthenticated && (
            <View style={styles.warningBox}>
              <MaterialIcons name="error" size={16} color="#DC3545" />
              <Text style={styles.warningText}>
                Please log in with a member account to book lawns.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event" size={22} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Select Date</Text>
          </View>
          <Calendar
            current={selectedDate}
            minDate={new Date().toISOString().split('T')[0]}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#2E7D32',
                selectedTextColor: '#FFF',
              },
            }}
            theme={{
              calendarBackground: '#FFF',
              textSectionTitleColor: '#2E7D32',
              selectedDayBackgroundColor: '#2E7D32',
              selectedDayTextColor: '#FFF',
              todayTextColor: '#2E7D32',
              dayTextColor: '#2D3748',
              textDisabledColor: '#CBD5E0',
              dotColor: '#2E7D32',
              selectedDotColor: '#FFF',
              arrowColor: '#2E7D32',
              monthTextColor: '#2D3748',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
          {selectedDate && (
            <View style={styles.selectedDateContainer}>
              <Feather name="calendar" size={16} color="#2E7D32" />
              <Text style={styles.selectedDateText}>
                Selected: {formatDateForDisplay(selectedDate)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="event-available" size={22} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Event Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Feather name="users" size={20} color="#2E7D32" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              onChangeText={setNumberOfGuests}
              value={numberOfGuests}
              placeholder="Number of Guests"
              placeholderTextColor="#A0AEC0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.dropdownSection}>
            <Text style={styles.sectionLabel}>Event Type</Text>
            <DropDownPicker
              open={eventTypeOpen}
              value={selectedEventType}
              items={eventTypeOptions}
              setOpen={setEventTypeOpen}
              setValue={setSelectedEventType}
              placeholder="Select Event Type"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={4000}
              zIndexInverse={1000}
            />
          </View>

          <View style={styles.dropdownSection}>
            <Text style={styles.sectionLabel}>Time Slot</Text>
            <DropDownPicker
              open={timeSlotOpen}
              value={selectedTimeSlot}
              items={timeSlotOptions}
              setOpen={setTimeSlotOpen}
              setValue={setSelectedTimeSlot}
              placeholder="Select Time Slot"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              zIndex={3000}
              zIndexInverse={2000}
            />
          </View>

          <View style={styles.pricingTypeSection}>
            <Text style={styles.sectionLabel}>Pricing Type</Text>
            <View style={styles.pricingTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.pricingTypeButton,
                  pricingType === 'member' && styles.pricingTypeButtonActive
                ]}
                onPress={() => setPricingType('member')}
              >
                <Text style={[
                  styles.pricingTypeButtonText,
                  pricingType === 'member' && styles.pricingTypeButtonTextActive
                ]}>
                  Member Pricing
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.pricingTypeButton,
                  pricingType === 'guest' && styles.pricingTypeButtonActive
                ]}
                onPress={() => setPricingType('guest')}
              >
                <Text style={[
                  styles.pricingTypeButtonText,
                  pricingType === 'guest' && styles.pricingTypeButtonTextActive
                ]}>
                  Guest Pricing
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="edit" size={22} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Special Requests</Text>
          </View>
          <View style={styles.inputGroup}>
            <Feather name="edit-3" size={20} color="#2E7D32" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.textArea]}
              onChangeText={setSpecialRequests}
              value={specialRequests}
              placeholder="Any special requirements or requests..."
              placeholderTextColor="#A0AEC0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>{calculateTotalAmount()}</Text>
          <Text style={styles.totalNote}>
            * {pricingType === 'member' ? 'Member' : 'Guest'} pricing applied
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !isAuthenticated) && 
            styles.submitButtonDisabled
          ]}
          onPress={() => setShowBookingModal(true)}
          disabled={!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !isAuthenticated}
        >
          <Text style={styles.submitButtonText}>Book Now</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Debug Info - Remove in production */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>Platform: {Platform.OS}</Text>
          <Text style={styles.debugText}>Base URL: {base_url}</Text>
          <Text style={styles.debugText}>Lawn ID: {venue?.id}</Text>
          <Text style={styles.debugText}>Auth Status: {isAuthenticated ? '✅' : '❌'}</Text>
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={async () => {
              const token = await getAuthToken();
              Alert.alert(
                'Debug Info',
                `Platform: ${Platform.OS}\nBase URL: ${base_url}\nEndpoint: /lawn/generate/invoice/lawn\nLawn ID: ${venue?.id}\nAuth Token: ${token ? 'Present' : 'Missing'}\nUser: ${userName || 'Not logged in'}`
              );
            }}
          >
            <Text style={styles.debugButtonText}>Show Debug Info</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderVenueInfo = () => {
    if (!venue) return null;

    return (
      <View style={styles.venueInfoCard}>
        <Text style={styles.venueInfoTitle}>Booking Summary</Text>
        <View style={styles.venueDetails}>
          <Text style={styles.venueName}>{venue.description || 'Lawn'} (ID: {venue.id})</Text>
          <View style={styles.venueStats}>
            <Text style={styles.venueStat}>
              Capacity: {venue.minGuests || 0} - {venue.maxGuests || 0} guests
            </Text>
            <Text style={styles.venueStat}>
              Member Price: Rs. {venue.memberCharges?.toLocaleString() || '0'}/-
            </Text>
            <Text style={styles.venueStat}>
              Guest Price: Rs. {venue.guestCharges?.toLocaleString() || '0'}/-
            </Text>
          </View>

          {!isAdmin && (
            <View style={styles.memberInfo}>
              <Text style={styles.memberInfoText}>
                👤 Booking as: {userName || 'Member'}
              </Text>
              <Text style={styles.memberInfoText}>
                🔐 Authentication: {isAuthenticated ? 'Verified' : 'Required'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <SafeAreaView style={styles.container}>
        <ImageBackground
          source={require('../../assets/psc_home.jpeg')}
          style={styles.headerBackground}
          imageStyle={styles.headerImage}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrowleft" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                Book Lawn
              </Text>
              <Text style={styles.headerSubtitle}>
                {venue?.description || 'Select Lawn'} (ID: {venue?.id})
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderVenueInfo()}
          {renderMemberBookingForm()}
          <View style={styles.footerSpacer} />
        </ScrollView>

        {/* Member Booking Confirmation Modal */}
        <Modal
          visible={showBookingModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirm Lawn Booking</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.bookingSummary}>
                  <Text style={styles.summaryTitle}>Booking Details</Text>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Lawn:</Text>
                    <Text style={styles.summaryValue}>{venue?.description || 'Lawn'} (ID: {venue?.id})</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date:</Text>
                    <Text style={styles.summaryValue}>{formatDateForDisplay(selectedDate)}</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Event Type:</Text>
                    <Text style={styles.summaryValue}>
                      {eventTypeOptions.find(opt => opt.value === selectedEventType)?.label || selectedEventType}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time Slot:</Text>
                    <Text style={styles.summaryValue}>
                      {timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label || selectedTimeSlot}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Guests:</Text>
                    <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Pricing Type:</Text>
                    <Text style={styles.summaryValue}>
                      {pricingType === 'member' ? 'Member Rate' : 'Guest Rate'}
                    </Text>
                  </View>
                  
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount:</Text>
                    <Text style={styles.summaryValue}>{calculateTotalAmount()}</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <MaterialIcons name="info" size={16} color="#2E7D32" />
                  <Text style={styles.infoText}>
                    You'll be redirected to payment after confirmation. Your member ID will be automatically detected from your login session.
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowBookingModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
                  onPress={handleMemberBooking}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerImage: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 15,
  },
  
  // Venue Info
  venueInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  venueInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  venueStats: {
    gap: 5,
    marginBottom: 10,
  },
  venueStat: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  
  // Member Info Card
  memberInfoCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memberInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  
  memberInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  memberInfoText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  // Member Info Display
  memberInfoDisplay: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },

  // Calendar
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    padding: 12,
    backgroundColor: '#F0FFF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9AE6B4',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },

  // Inputs
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3748',
  },
  textArea: {
    height: 80,
    paddingVertical: 12,
  },

  // Dropdown
  dropdownSection: {
    marginBottom: 20,
  },
  dropdown: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 12,
  },
  dropdownContainer: {
    backgroundColor: '#F7FAFC',
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },

  // Pricing Type Section
  pricingTypeSection: {
    marginBottom: 10,
  },
  pricingTypeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  pricingTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F7FAFC',
  },
  pricingTypeButtonActive: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  pricingTypeButtonText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '600',
  },
  pricingTypeButtonTextActive: {
    color: '#FFF',
  },

  // Button Disabled State
  buttonDisabled: {
    backgroundColor: '#CBD5E0',
    opacity: 0.6,
  },

  // Total Amount
  totalCard: {
    backgroundColor: '#2D3748',
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#CBD5E0',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  totalNote: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    marginHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 12,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowColor: 'transparent',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },

  // Footer Spacer
  footerSpacer: {
    height: 30,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContent: {
    flex: 1,
  },

  // Booking Summary
  bookingSummary: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#8D6E63',
    marginLeft: 8,
    lineHeight: 16,
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#DC3545',
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    color: '#DC3545',
    marginLeft: 8,
    flex: 1,
  },

  // Modal Actions
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  // Session Status
  sessionStatus: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  
  // Refresh Button
  refreshButton: {
    padding: 5,
  },

  // Debug Container
  debugContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  debugButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LawnBooking;