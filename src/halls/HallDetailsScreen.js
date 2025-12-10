import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ImageBackground,
  StatusBar,
  Alert,
} from 'react-native';

// Menu Data
const banquetMenus = [
  {
    title: "Menu 1",
    price: "Rs. 2600/-",
    items: [
      "Chicken Pulao / Beef Pulao",
      "Chicken Qorma / Salta Curry",
      "Aloo Channa / Lahori Channa / Channa Achar",
      "Haresh Puri",
      "Raita / Mint Chatni",
      "Fresh Salad & Red Bean Salad",
      "Plain Naan",
      "Black Tea / Green Tea",
      "Mineral Water",
    ],
  },
  {
    title: "Menu 2",
    price: "Rs. 2800/-",
    items: [
      "Kabuli Pulao / Naranji Pulao",
      "Beef Seekh Kebab / Chappli Kebab",
      "Chicken Korma / Lahori Khoya Channa",
      "Katla Curry / Chicken Qorma",
      "Seemi Bo Payan",
      "Raita / Russian Salad",
      "Naan / Roti",
      "Tea / Green Tea",
      "Mineral Water",
    ],
  },
  {
    title: "Menu 3",
    price: "Rs. 3200/-",
    items: [
      "Chicken Pulao / Beef Pulao",
      "Chicken Qorma / Beef Qorma",
      "Beef Seekh Kebab / Chappli Kebab",
      "Mix Vegetable / Katla Curry",
      "Fresh Salad / Macaroni Salad",
      "Raita",
      "Naan",
      "Custard with Jelly / Kheer / Ice Cream / Dessert",
      "Black Tea / Green Tea / Kashmiri Tea",
      "Cold Drinks",
      "Mineral Water",
    ],
  },
  {
    title: "Menu 4",
    price: "Rs. 3500/-",
    items: [
      "Kabuli Pulao / Naranji Pulao / Peshawari Pulao",
      "Chicken Kofi / Chicken Achari Boti",
      "Beef Seekh Kebab / Chappli Kebab",
      "Mutton Qorma / Mutton Handi Qorma",
      "Mix Vegetable / Russian Salad / Corn Salad",
      "Raita / Mint Chatni",
      "Naan / Roti",
      "Kheer / Shahi Tukray / Ice Cream / Dry Dessert",
      "Black Tea / Green Tea / Kashmiri Tea",
      "Cold Drinks",
      "Mineral Water",
    ],
  },
  {
    title: "Menu 5",
    price: "Rs. 4000/-",
    items: [
      "Kabuli Pulao / Naranji Pulao / Peshawari Pulao / Sindhi Biryani",
      "Mutton Korma / Mutton Qorma",
      "Karahi Gosht / Chicken Ginger",
      "Beef Seekh Kebab / Chappli Kebab / Chicken Kebab",
      "Mix Vegetable / Russian Salad / Corn Salad",
      "Raita / Mint Chatni",
      "Naan / Roti",
      "Kheer / Ice Cream / Fruit Trifle / Custard / Dessert",
      "Black Tea / Green Tea / Kashmiri Tea",
      "Cold Drinks",
      "Mineral Water",
    ],
  },
  {
    title: "Menu 6",
    price: "Rs. 4800/-",
    items: [
      "Kabuli Pulao / Naranji Pulao / Peshawari Pulao / Chicken Biryani",
      "Chicken Karahi / Mughali Chicken Karahi",
      "Mutton Qorma / Qeema",
      "Fried Fish / Finger Fish",
      "Chicken Kofi / Chicken Malai Boti / Nuggets Kebab / Chicken Qorma",
      "Beef Seekh Kebab / Chappli Kebab",
      "Raita / Green Salad / Russian Salad / Macaroni Salad / Spaghetti Salad",
      "Naan / Roghni Naan / Garlic Naan",
      "Kheer / Mutton Fruit Trifle / Ice Cream / Chocolate Fudge Pastry / Dessert",
      "Black Tea / Green Tea / Kashmiri Tea",
      "Cold Drinks",
      "Mineral Water",
    ],
  },
];

const fixedMenu = {
  title: "Fixed Menu",
  price: "Rs. 560/-",
  items: [
    "Chicken Sandwich",
    "Spring Rolls",
    "Tea",
    "Cold Drink",
    "Mineral Water",
  ],
};

const additionalItems = [
  { name: "Mini Pizza", price: "120/-" },
  { name: "Spring Roll", price: "145/-" },
  { name: "Spinach Pie", price: "145/-" },
  { name: "Veg Patty", price: "120/-" },
  { name: "Chicken Patty", price: "160/-" },
  { name: "Chicken Wings", price: "245/-" },
  { name: "Mini Burger", price: "240/-" },
  { name: "Mini Seekh Kebab", price: "340/-" },
  { name: "Chicken Samosa", price: "280/-" },
  { name: "Veg Samosa", price: "240/-" },
  { name: "Chicken Roll", price: "180/-" },
  { name: "Veg Roll", price: "160/-" },
  { name: "Cupcake", price: "160/-" },
  { name: "Raspberry Brownie", price: "280/-" },
  { name: "Lemon Tart", price: "160/-" },
  { name: "Chocolate Choco", price: "400/-" },
  { name: "Mineral Water", price: "50/-" },
];

const termsAndConditions = [
  "Member / Guest are liable to pay Rs. 5000/- as advance payment. Remaining amount to be deposited 24 hours before event.",
  "In case of cancellation, advance payment will be refunded as per following schedule:",
  "Before 7 - 15 days → 50%",
  "Before 3 - 7 days → 25%",
  "Less than 3 days → 0%",
  "Due to guest increase, Member / Guest to follow capacity limit.",
  "Food, Stage Decoration and DJ are not allowed from outside.",
  "All charges are inclusive of taxes & service charges.",
  "Fireworks, fire crackers, and firing is not allowed.",
  "Membership (CNIC) card is mandatory at entry.",
  "Timings: Lunch (12:00 PM to 3:00 PM), Dinner (7:30 PM to 10:30 PM).",
  "Feedback / Suggestions book is available at reception.",
];

const HallDetailsScreen = ({ route, navigation }) => {
  const { item, type } = route.params;
  const [selectedMenu, setSelectedMenu] = useState(null);

  const handleBookNow = () => {
    if (!selectedMenu) {
      Alert.alert('Select Menu', 'Please select a menu before booking.');
      return;
    }
    
    navigation.navigate('BHBooking', {
      venue: item,
      venueType: type,
      selectedMenu: selectedMenu,
    });
  };

  const renderDetailsSection = () => (
    <View style={styles.detailsSection}>
      <Text style={styles.venueTitle}>{item.name || item.title}</Text>
      <Text style={styles.venueDescription}>{item.description}</Text>
      
      <View style={styles.detailsGrid}>
        {type === 'hall' ? (
          <>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Capacity</Text>
              <Text style={styles.detailValue}>{item.capacity} people</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Member Price</Text>
              <Text style={styles.detailValue}>₹{item.memberPrice}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Guest Price</Text>
              <Text style={styles.detailValue}>₹{item.guestPrice}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, 
                item.isActive ? styles.statusAvailable : styles.statusUnavailable]}>
                {item.isActive ? 'Available' : 'Not Available'}
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Guest Range</Text>
              <Text style={styles.detailValue}>{item.minGuests}-{item.maxGuests} people</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Member Price</Text>
              <Text style={styles.detailValue}>₹{item.memberPrice}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Guest Price</Text>
              <Text style={styles.detailValue}>₹{item.guestPrice}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>Outdoor Lawn</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderMenuSection = () => (
    <View style={styles.menuSection}>
      <Text style={styles.sectionTitle}>Banquet Menus</Text>
      
      {banquetMenus.map((menu, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.menuCard,
            selectedMenu?.title === menu.title && styles.selectedMenuCard
          ]}
          onPress={() => setSelectedMenu(menu)}
        >
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>{menu.title}</Text>
            <Text style={styles.menuPrice}>{menu.price}</Text>
          </View>
          <View style={styles.menuItems}>
            {menu.items.map((item, itemIndex) => (
              <Text key={itemIndex} style={styles.menuItem}>• {item}</Text>
            ))}
          </View>
          {selectedMenu?.title === menu.title && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>✓ Selected</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Fixed Menu */}
      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Fixed Menu</Text>
      <TouchableOpacity
        style={[
          styles.menuCard,
          selectedMenu?.title === fixedMenu.title && styles.selectedMenuCard
        ]}
        onPress={() => setSelectedMenu(fixedMenu)}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>{fixedMenu.title}</Text>
          <Text style={styles.menuPrice}>{fixedMenu.price}</Text>
        </View>
        <View style={styles.menuItems}>
          {fixedMenu.items.map((item, index) => (
            <Text key={index} style={styles.menuItem}>• {item}</Text>
          ))}
        </View>
        {selectedMenu?.title === fixedMenu.title && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓ Selected</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAdditionalItems = () => (
    <View style={styles.additionalSection}>
      <Text style={styles.sectionTitle}>Additional Items</Text>
      <View style={styles.additionalGrid}>
        {additionalItems.map((item, index) => (
          <View key={index} style={styles.additionalItem}>
            <Text style={styles.additionalName}>{item.name}</Text>
            <Text style={styles.additionalPrice}>{item.price}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTermsAndConditions = () => (
    <View style={styles.termsSection}>
      <Text style={styles.sectionTitle}>Terms & Conditions</Text>
      {termsAndConditions.map((term, index) => (
        <Text key={index} style={styles.termItem}>• {term}</Text>
      ))}
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <ImageBackground
          source={require('../../assets/psc_home.jpeg')}
          style={styles.headerBackground}
        >
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {type === 'hall' ? '🏛️ Hall Details' : '🌿 Lawn Details'}
            </Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <ScrollView style={styles.scrollView}>
          {renderDetailsSection()}
          {renderMenuSection()}
          {renderAdditionalItems()}
          {renderTermsAndConditions()}
          
          {/* Spacer for the fixed button */}
          <View style={styles.spacer} />
        </ScrollView>

        {/* Fixed Book Now Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.bookButton,
              !selectedMenu && styles.bookButtonDisabled
            ]}
            onPress={handleBookNow}
            disabled={!selectedMenu}
          >
            <Text style={styles.bookButtonText}>
              {selectedMenu ? `Book Now - ${selectedMenu.price}` : 'Select a Menu to Book'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomEndRadius: 30,
    borderBottomStartRadius: 30,
    overflow: 'hidden',
    minHeight: 120,
  },
  header: {
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  // Details Section
  detailsSection: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  venueTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  venueDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusAvailable: {
    color: '#4CAF50',
  },
  statusUnavailable: {
    color: '#F44336',
  },
  // Menu Section
  menuSection: {
    backgroundColor: '#FFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  menuCard: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  selectedMenuCard: {
    borderColor: '#B8860B',
    backgroundColor: '#FFF8E1',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  menuItems: {
    marginLeft: 10,
  },
  menuItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  selectedIndicator: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#B8860B',
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Additional Items
  additionalSection: {
    backgroundColor: '#FFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  additionalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  additionalItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  additionalName: {
    fontSize: 14,
    color: '#333',
  },
  additionalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#B8860B',
  },
  // Terms & Conditions
  termsSection: {
    backgroundColor: '#FFF',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  termItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  // Footer
  spacer: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bookButton: {
    backgroundColor: '#B8860B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HallDetailsScreen;

// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   SafeAreaView,
//   Alert,
//   StatusBar,
//   ImageBackground,
//   Modal,
//   ActivityIndicator,
// } from 'react-native';
// import { Calendar } from 'react-native-calendars';
// import Icon from 'react-native-vector-icons/AntDesign';
// import Feather from 'react-native-vector-icons/Feather';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { getUserData, banquetAPI } from '../../config/apis';

// const eventTypeOptions = [
//   { label: 'Wedding Reception', value: 'wedding' },
//   { label: 'Birthday Party', value: 'birthday' },
//   { label: 'Corporate Event', value: 'corporate' },
//   { label: 'Anniversary', value: 'anniversary' },
//   { label: 'Family Gathering', value: 'family' },
//   { label: 'Other Event', value: 'other' },
// ];

// const timeSlotOptions = [
//   { label: 'Morning (8:00 AM - 2:00 PM)', value: 'MORNING' },
//   { label: 'Evening (2:00 PM - 8:00 PM)', value: 'EVENING' },
//   { label: 'Night (8:00 PM - 12:00 AM)', value: 'NIGHT' },
// ];

// const BHBooking = ({ route, navigation }) => {
//   const { venue } = route.params || {};
  
//   // State variables for member booking
//   const [selectedDate, setSelectedDate] = useState('');
//   const [eventTypeOpen, setEventTypeOpen] = useState(false);
//   const [selectedEventType, setSelectedEventType] = useState(null);
//   const [numberOfGuests, setNumberOfGuests] = useState('');
//   const [timeSlotOpen, setTimeSlotOpen] = useState(false);
//   const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
//   const [specialRequests, setSpecialRequests] = useState('');

//   // Admin Reservation States
//   const [isAdmin, setIsAdmin] = useState(false);
//   const [adminMode, setAdminMode] = useState(false);
//   const [reserveFrom, setReserveFrom] = useState('');
//   const [reserveTo, setReserveTo] = useState('');
//   const [timeSlot, setTimeSlot] = useState(null);
//   const [reserveModalVisible, setReserveModalVisible] = useState(false);
//   const [unreserveModalVisible, setUnreserveModalVisible] = useState(false);
//   const [calendarModalVisible, setCalendarModalVisible] = useState(false);
//   const [calendarType, setCalendarType] = useState('from');
//   const [loading, setLoading] = useState(false);
  
//   // Member Booking States
//   const [showBookingModal, setShowBookingModal] = useState(false);
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [manualMembershipNo, setManualMembershipNo] = useState('');

//   // Check if user is admin and get user data on component mount
//   useEffect(() => {
//     checkUserStatus();
    
//     // Pre-fill data from the passed venue
//     if (venue) {
//       console.log('Booking for:', venue);
//       setNumberOfGuests(venue.capacity?.toString() || '');
//     }
    
//     // Set today's date as default
//     const today = new Date();
//     const formattedDate = today.toISOString().split('T')[0];
//     setSelectedDate(formattedDate);
//   }, [venue]);

//   const checkUserStatus = async () => {
//     try {
//       const userData = await getUserData();
//       console.log('📋 Full User Data:', userData); // Debug log
//       setUserData(userData);
      
//       // Check all possible fields for membership number
//       const membershipNo = userData?.membershipNo || 
//                           userData?.membership_no || 
//                           userData?.Membership_No || 
//                           userData?.membershipNumber ||
//                           userData?.membershipID ||
//                           userData?.id;
//       console.log('🔍 Extracted Membership No:', membershipNo); // Debug log
      
//       // If we found membership number, set it manually as well
//       if (membershipNo) {
//         setManualMembershipNo(membershipNo.toString());
//       }
      
//       const userRole = userData?.role;
//       const isAdminUser = userRole === 'admin' || userRole === 'SUPER_ADMIN';
//       setIsAdmin(isAdminUser);
      
//       console.log('👤 User role:', userRole, 'Is admin:', isAdminUser, 'Membership No:', membershipNo);
//     } catch (error) {
//       console.error('❌ Error checking user status:', error);
//       setIsAdmin(false);
//     }
//   };

//   // Admin Reservation Functions
//   const openCalendar = (type) => {
//     setCalendarType(type);
//     setCalendarModalVisible(true);
//   };

//   const handleDateSelect = (date) => {
//     const selectedDate = date.dateString;
//     if (calendarType === 'from') {
//       setReserveFrom(selectedDate);
//     } else {
//       setReserveTo(selectedDate);
//     }
//     setCalendarModalVisible(false);
//   };

//   const validateReservation = () => {
//     if (!reserveFrom || !reserveTo) {
//       Alert.alert('Error', 'Please select reservation dates');
//       return false;
//     }
//     if (!timeSlot) {
//       Alert.alert('Error', 'Please select a time slot');
//       return false;
//     }

//     const fromDate = new Date(reserveFrom);
//     const toDate = new Date(reserveTo);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (fromDate < today) {
//       Alert.alert('Error', 'Reservation start date cannot be in the past');
//       return false;
//     }

//     if (fromDate >= toDate) {
//       Alert.alert('Error', 'Reservation end date must be after start date');
//       return false;
//     }

//     return true;
//   };

//   const handleAdminReserve = async () => {
//     if (!validateReservation()) return;

//     try {
//       setLoading(true);
//       const payload = {
//         hallIds: [venue.id.toString()],
//         reserve: true,
//         timeSlot: timeSlot,
//         reserveFrom: reserveFrom,
//         reserveTo: reserveTo,
//       };

//       const response = await banquetAPI.reserveHalls(payload);
      
//       Alert.alert(
//         'Success', 
//         response.data?.message || 'Hall reserved successfully',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setReserveModalVisible(false);
//               setReserveFrom('');
//               setReserveTo('');
//               setTimeSlot(null);
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Reservation error:', error);
//       Alert.alert(
//         'Error', 
//         error.response?.data?.message || 'Failed to reserve hall'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminUnreserve = async () => {
//     if (!reserveFrom || !reserveTo || !timeSlot) {
//       Alert.alert('Error', 'Please select dates and time slot to unreserve');
//       return;
//     }

//     try {
//       setLoading(true);
//       const payload = {
//         hallIds: [venue.id.toString()],
//         reserve: false,
//         timeSlot: timeSlot,
//         reserveFrom: reserveFrom,
//         reserveTo: reserveTo,
//       };

//       const response = await banquetAPI.reserveHalls(payload);
      
//       Alert.alert(
//         'Success', 
//         response.data?.message || 'Hall unreserved successfully',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setUnreserveModalVisible(false);
//               setReserveFrom('');
//               setReserveTo('');
//               setTimeSlot(null);
//             }
//           }
//         ]
//       );
//     } catch (error) {
//       console.error('Unreservation error:', error);
//       Alert.alert(
//         'Error', 
//         error.response?.data?.message || 'Failed to unreserve hall'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Member Booking Functions
//   const validateMemberBooking = () => {
//     if (!selectedDate) {
//       Alert.alert('Error', 'Please select a booking date');
//       return false;
//     }
//     if (!selectedEventType) {
//       Alert.alert('Error', 'Please select an event type');
//       return false;
//     }
//     if (!selectedTimeSlot) {
//       Alert.alert('Error', 'Please select a time slot');
//       return false;
//     }
//     if (!numberOfGuests || parseInt(numberOfGuests) < 1) {
//       Alert.alert('Error', 'Please enter number of guests');
//       return false;
//     }
//     if (!manualMembershipNo) {
//       Alert.alert('Error', 'Please enter your membership number');
//       return false;
//     }

//     const bookingDate = new Date(selectedDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     if (bookingDate < today) {
//       Alert.alert('Error', 'Booking date cannot be in the past');
//       return false;
//     }

//     return true;
//   };

//   const handleMemberBooking = async () => {
//     if (!validateMemberBooking()) return;

//     try {
//       setBookingLoading(true);
      
//       // Use the manual membership number input
//       const membershipNo = manualMembershipNo.trim();
      
//       console.log('🎫 Using Membership No for booking:', membershipNo);
//       console.log('📋 Complete User Data:', userData);

//       if (!membershipNo) {
//         Alert.alert(
//           'Membership Number Required',
//           'Please enter your membership number to proceed with booking.',
//           [{ text: 'OK' }]
//         );
//         return;
//       }

//       // Calculate total price based on member price
//       const totalPrice = venue.memberPrice || venue.chargesMembers || 0;

//       // Prepare payload according to backend structure
//       const payload = {
//         consumerInfo: {
//           membership_no: membershipNo.toString(),
//         },
//         bookingData: {
//           hallId: venue.id,
//           bookingDate: selectedDate,
//           eventType: selectedEventType,
//           eventTime: selectedTimeSlot,
//           numberOfGuests: parseInt(numberOfGuests),
//           specialRequest: specialRequests,
//           totalPrice: totalPrice,
//           pricingType: 'MEMBER',
//         }
//       };

//       console.log('📤 Sending member booking payload:', JSON.stringify(payload, null, 2));

//       const response = await banquetAPI.memberBookingHall(payload);
      
//       console.log('✅ Member booking successful:', response.data);

//       // Show success message
//       Alert.alert(
//         'Booking Successful!',
//         `Your booking for ${venue.name} has been confirmed.\n\nDate: ${formatDateForDisplay(selectedDate)}\nTime: ${selectedTimeSlot}\nTotal: Rs. ${totalPrice.toLocaleString()}/-`,
//         [
//           {
//             text: 'View Voucher',
//             onPress: () => {
//               navigation.navigate('Voucher', {
//                 bookingId: response.data.booking?.id || response.data.id,
//                 bookingType: 'HALL',
//                 bookingData: {
//                   venue: venue,
//                   date: selectedDate,
//                   eventType: selectedEventType,
//                   timing: selectedTimeSlot,
//                   guests: numberOfGuests,
//                   specialRequests: specialRequests,
//                   totalAmount: totalPrice,
//                 },
//                 bookingResponse: response.data
//               });
//             }
//           },
//           {
//             text: 'Done',
//             onPress: () => navigation.goBack()
//           }
//         ]
//       );

//     } catch (error) {
//       console.error('❌ Member booking error:', error);
      
//       let errorMessage = 'Failed to book hall. Please try again.';
      
//       if (error.response?.status === 409) {
//         errorMessage = error.response.data?.message || 'Hall not available for selected date and time. Please choose a different date or time slot.';
//       } else if (error.response?.status === 400) {
//         errorMessage = error.response.data?.message || 'Invalid booking data. Please check your information.';
//       } else if (error.response?.status === 404) {
//         if (error.response.data?.message?.includes('Member not found')) {
//           errorMessage = 'Member not found with the provided membership number. Please check your membership number and try again.';
//         } else {
//           errorMessage = error.response.data?.message || 'Hall or member not found.';
//         }
//       } else if (error.response?.status === 500) {
//         errorMessage = 'Server error. Please try again later.';
//       } else if (error.message?.includes('Network Error')) {
//         errorMessage = 'Network error. Please check your internet connection.';
//       }
      
//       Alert.alert('Booking Failed', errorMessage);
//     } finally {
//       setBookingLoading(false);
//       setShowBookingModal(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Select Date';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const formatDateForDisplay = (dateString) => {
//     if (!dateString) return '';
//     const [year, month, day] = dateString.split('-');
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//     return `${parseInt(day)} ${months[parseInt(month) - 1]}, ${year}`;
//   };

//   const calculateTotalAmount = () => {
//     if (!venue) return '0';
//     const price = venue.memberPrice || venue.chargesMembers || 0;
//     return `Rs. ${price.toLocaleString()}/-`;
//   };

//   // Get detected membership number from user data
//   const getDetectedMembershipNo = () => {
//     return userData?.membershipNo || 
//            userData?.membership_no || 
//            userData?.Membership_No || 
//            userData?.membershipNumber ||
//            userData?.membershipID ||
//            userData?.id;
//   };

//   // Admin Mode Toggle Section
//   const renderAdminToggle = () => {
//     if (!isAdmin) return null;

//     return (
//       <View style={styles.adminToggleSection}>
//         <Text style={styles.adminToggleTitle}>Admin Mode</Text>
//         <View style={styles.toggleContainer}>
//           <TouchableOpacity
//             style={[
//               styles.toggleButton,
//               !adminMode && styles.toggleButtonActive
//             ]}
//             onPress={() => setAdminMode(false)}
//           >
//             <Text style={[
//               styles.toggleButtonText,
//               !adminMode && styles.toggleButtonTextActive
//             ]}>
//               Member Booking
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.toggleButton,
//               adminMode && styles.toggleButtonActive
//             ]}
//             onPress={() => setAdminMode(true)}
//           >
//             <Text style={[
//               styles.toggleButtonText,
//               adminMode && styles.toggleButtonTextActive
//             ]}>
//               Admin Reserve
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Admin Reservation Form
//   const renderAdminReservationForm = () => {
//     if (!adminMode) return null;

//     return (
//       <View style={styles.sectionCard}>
//         <View style={styles.sectionHeader}>
//           <MaterialIcons name="admin-panel-settings" size={22} color="#DC3545" />
//           <Text style={styles.sectionTitle}>Admin Reservation</Text>
//         </View>

//         {/* Date Selection */}
//         <View style={styles.dateSection}>
//           <Text style={styles.sectionLabel}>Reservation Period</Text>
//           <View style={styles.dateInputs}>
//             <TouchableOpacity 
//               style={styles.dateInput}
//               onPress={() => openCalendar('from')}
//             >
//               <Feather name="calendar" size={16} color="#B8860B" />
//               <Text style={styles.dateInputText}>
//                 From: {formatDate(reserveFrom)}
//               </Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity 
//               style={styles.dateInput}
//               onPress={() => openCalendar('to')}
//             >
//               <Feather name="calendar" size={16} color="#B8860B" />
//               <Text style={styles.dateInputText}>
//                 To: {formatDate(reserveTo)}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Time Slot Selection */}
//         <View style={styles.dropdownSection}>
//           <Text style={styles.sectionLabel}>Time Slot</Text>
//           <DropDownPicker
//             open={timeSlotOpen}
//             value={timeSlot}
//             items={timeSlotOptions}
//             setOpen={setTimeSlotOpen}
//             setValue={setTimeSlot}
//             placeholder="Select Time Slot"
//             style={styles.dropdown}
//             dropDownContainerStyle={styles.dropdownContainer}
//             zIndex={3000}
//             zIndexInverse={1000}
//           />
//         </View>

//         {/* Action Buttons */}
//         <View style={styles.adminActionButtons}>
//           <TouchableOpacity 
//             style={[styles.adminButton, styles.reserveButton]}
//             onPress={() => setReserveModalVisible(true)}
//             disabled={!reserveFrom || !reserveTo || !timeSlot}
//           >
//             <Text style={styles.adminButtonText}>Reserve Hall</Text>
//           </TouchableOpacity>

//           <TouchableOpacity 
//             style={[styles.adminButton, styles.unreserveButton]}
//             onPress={() => setUnreserveModalVisible(true)}
//             disabled={!reserveFrom || !reserveTo || !timeSlot}
//           >
//             <Text style={styles.adminButtonText}>Unreserve Hall</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   // Member Booking Form
//   const renderMemberBookingForm = () => {
//     if (adminMode) return null;

//     const detectedMembershipNo = getDetectedMembershipNo();

//     return (
//       <>
//         {/* Membership Number Input - Always show for clarity */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="badge" size={22} color="#B8860B" />
//             <Text style={styles.sectionTitle}>Membership Information</Text>
//           </View>
          
//           <View style={styles.inputGroup}>
//             <Feather name="user" size={20} color="#B8860B" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               onChangeText={setManualMembershipNo}
//               value={manualMembershipNo}
//               placeholder="Enter your membership number"
//               placeholderTextColor="#A0AEC0"
//               autoCapitalize="none"
//               autoCorrect={false}
//             />
//           </View>
          
//           {detectedMembershipNo && (
//             <View style={styles.infoBox}>
//               <MaterialIcons name="info" size={16} color="#B8860B" />
//               <Text style={styles.infoText}>
//                 We detected membership number: {detectedMembershipNo}. You can use this or enter a different one.
//               </Text>
//             </View>
//           )}
          
//           {!detectedMembershipNo && (
//             <View style={styles.warningBox}>
//               <MaterialIcons name="warning" size={16} color="#DC3545" />
//               <Text style={styles.warningText}>
//                 Membership number not found automatically. Please enter your membership number manually.
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Calendar Section */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event" size={22} color="#B8860B" />
//             <Text style={styles.sectionTitle}>Select Date</Text>
//           </View>
//           <Calendar
//             current={selectedDate}
//             minDate={new Date().toISOString().split('T')[0]}
//             onDayPress={(day) => setSelectedDate(day.dateString)}
//             markedDates={{
//               [selectedDate]: {
//                 selected: true,
//                 selectedColor: '#B8860B',
//                 selectedTextColor: '#FFF',
//               },
//             }}
//             theme={{
//               calendarBackground: '#FFF',
//               textSectionTitleColor: '#B8860B',
//               selectedDayBackgroundColor: '#B8860B',
//               selectedDayTextColor: '#FFF',
//               todayTextColor: '#B8860B',
//               dayTextColor: '#2D3748',
//               textDisabledColor: '#CBD5E0',
//               dotColor: '#B8860B',
//               selectedDotColor: '#FFF',
//               arrowColor: '#B8860B',
//               monthTextColor: '#2D3748',
//               textDayFontSize: 14,
//               textMonthFontSize: 16,
//               textDayHeaderFontSize: 14,
//               textDayFontWeight: '500',
//               textMonthFontWeight: 'bold',
//             }}
//             style={styles.calendar}
//           />
//           {selectedDate && (
//             <View style={styles.selectedDateContainer}>
//               <Feather name="calendar" size={16} color="#B8860B" />
//               <Text style={styles.selectedDateText}>
//                 Selected: {formatDateForDisplay(selectedDate)}
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Event Details Section */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="event-available" size={22} color="#B8860B" />
//             <Text style={styles.sectionTitle}>Event Details</Text>
//           </View>

//           {/* Number of Guests */}
//           <View style={styles.inputGroup}>
//             <Feather name="users" size={20} color="#B8860B" style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               onChangeText={setNumberOfGuests}
//               value={numberOfGuests}
//               placeholder="Number of Guests"
//               placeholderTextColor="#A0AEC0"
//               keyboardType="numeric"
//             />
//           </View>

//           {/* Event Type Dropdown */}
//           <View style={styles.dropdownSection}>
//             <Text style={styles.sectionLabel}>Event Type</Text>
//             <DropDownPicker
//               open={eventTypeOpen}
//               value={selectedEventType}
//               items={eventTypeOptions}
//               setOpen={setEventTypeOpen}
//               setValue={setSelectedEventType}
//               placeholder="Select Event Type"
//               style={styles.dropdown}
//               dropDownContainerStyle={styles.dropdownContainer}
//               zIndex={4000}
//               zIndexInverse={1000}
//             />
//           </View>

//           {/* Time Slot Selection */}
//           <View style={styles.dropdownSection}>
//             <Text style={styles.sectionLabel}>Time Slot</Text>
//             <DropDownPicker
//               open={timeSlotOpen}
//               value={selectedTimeSlot}
//               items={timeSlotOptions}
//               setOpen={setTimeSlotOpen}
//               setValue={setSelectedTimeSlot}
//               placeholder="Select Time Slot"
//               style={styles.dropdown}
//               dropDownContainerStyle={styles.dropdownContainer}
//               zIndex={3000}
//               zIndexInverse={2000}
//             />
//           </View>
//         </View>

//         {/* Special Requests */}
//         <View style={styles.sectionCard}>
//           <View style={styles.sectionHeader}>
//             <MaterialIcons name="edit" size={22} color="#B8860B" />
//             <Text style={styles.sectionTitle}>Special Requests</Text>
//           </View>
//           <View style={styles.inputGroup}>
//             <Feather name="edit-3" size={20} color="#B8860B" style={styles.inputIcon} />
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               onChangeText={setSpecialRequests}
//               value={specialRequests}
//               placeholder="Any special requirements or requests..."
//               placeholderTextColor="#A0AEC0"
//               multiline
//               numberOfLines={4}
//               textAlignVertical="top"
//             />
//           </View>
//         </View>

//         {/* Total Amount */}
//         <View style={styles.totalCard}>
//           <Text style={styles.totalLabel}>Total Amount</Text>
//           <Text style={styles.totalAmount}>{calculateTotalAmount()}</Text>
//           <Text style={styles.totalNote}>
//             * Member pricing applied
//           </Text>
//         </View>

//         {/* Submit Button */}
//         <TouchableOpacity 
//           style={[
//             styles.submitButton,
//             (!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !manualMembershipNo) && 
//             styles.submitButtonDisabled
//           ]}
//           onPress={() => setShowBookingModal(true)}
//           disabled={!selectedDate || !numberOfGuests || !selectedEventType || !selectedTimeSlot || !manualMembershipNo}
//         >
//           <Text style={styles.submitButtonText}>
//             {isAdmin ? 'Book for Member' : 'Book Now'}
//           </Text>
//           <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
//         </TouchableOpacity>
//       </>
//     );
//   };

//   const renderVenueInfo = () => {
//     if (!venue) return null;

//     return (
//       <View style={styles.venueInfoCard}>
//         <Text style={styles.venueInfoTitle}>Booking Summary</Text>
//         <View style={styles.venueDetails}>
//           <Text style={styles.venueName}>{venue.name || venue.title}</Text>
//           <Text style={styles.venueDescription}>{venue.description}</Text>
//           <View style={styles.venueStats}>
//             <Text style={styles.venueStat}>Capacity: {venue.capacity} people</Text>
//             <Text style={styles.venueStat}>Member Price: Rs. {(venue.memberPrice || venue.chargesMembers || 0).toLocaleString()}/-</Text>
//           </View>
//           {userData && !isAdmin && (
//             <View style={styles.memberInfo}>
//               <Text style={styles.memberInfoText}>
//                 👤 Booking as: {userData.name || userData.Name || 'Member'}
//               </Text>
//               {getDetectedMembershipNo() && (
//                 <Text style={styles.memberInfoText}>
//                   🆔 Detected Membership: {getDetectedMembershipNo()}
//                 </Text>
//               )}
//             </View>
//           )}
//         </View>
//       </View>
//     );
//   };

//   return (
//     <>
//       <StatusBar barStyle="light-content" backgroundColor="#B8860B" />
//       <SafeAreaView style={styles.container}>
//         {/* Enhanced Header */}
//         <ImageBackground
//           source={require('../../assets/psc_home.jpeg')}
//           style={styles.headerBackground}
//           imageStyle={styles.headerImage}
//         >
//           <View style={styles.header}>
//             <TouchableOpacity 
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Icon name="arrowleft" size={24} color="#FFF" />
//             </TouchableOpacity>
//             <View style={styles.headerTitleContainer}>
//               <Text style={styles.headerTitle}>
//                 {adminMode ? 'Admin Reservation' : 'Book Hall'}
//               </Text>
//               <Text style={styles.headerSubtitle}>
//                 {venue?.name || venue?.title || 'Select Hall'}
//               </Text>
//             </View>
//             <View style={styles.placeholder} />
//           </View>
//         </ImageBackground>

//         <ScrollView 
//           style={styles.scrollView}
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Admin Toggle */}
//           {renderAdminToggle()}

//           {/* Venue Information */}
//           {renderVenueInfo()}

//           {/* Admin Reservation Form or Member Booking Form */}
//           {adminMode ? renderAdminReservationForm() : renderMemberBookingForm()}

//           <View style={styles.footerSpacer} />
//         </ScrollView>

//         {/* Member Booking Confirmation Modal */}
//         <Modal
//           visible={showBookingModal}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Confirm Booking</Text>
//                 <TouchableOpacity onPress={() => setShowBookingModal(false)}>
//                   <Icon name="close" size={24} color="#666" />
//                 </TouchableOpacity>
//               </View>

//               <ScrollView style={styles.modalContent}>
//                 <View style={styles.bookingSummary}>
//                   <Text style={styles.summaryTitle}>Booking Details</Text>
                  
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Hall:</Text>
//                     <Text style={styles.summaryValue}>{venue?.name || venue?.title}</Text>
//                   </View>
                  
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Date:</Text>
//                     <Text style={styles.summaryValue}>{formatDateForDisplay(selectedDate)}</Text>
//                   </View>
                  
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Event Type:</Text>
//                     <Text style={styles.summaryValue}>
//                       {eventTypeOptions.find(opt => opt.value === selectedEventType)?.label || selectedEventType}
//                     </Text>
//                   </View>
                  
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Time Slot:</Text>
//                     <Text style={styles.summaryValue}>
//                       {timeSlotOptions.find(opt => opt.value === selectedTimeSlot)?.label || selectedTimeSlot}
//                     </Text>
//                   </View>
                  
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Guests:</Text>
//                     <Text style={styles.summaryValue}>{numberOfGuests} people</Text>
//                   </View>
                  
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Membership No:</Text>
//                     <Text style={styles.summaryValue}>{manualMembershipNo}</Text>
//                   </View>
                  
//                   <View style={styles.summaryRow}>
//                     <Text style={styles.summaryLabel}>Total Amount:</Text>
//                     <Text style={styles.summaryValue}>{calculateTotalAmount()}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.infoBox}>
//                   <MaterialIcons name="info" size={16} color="#B8860B" />
//                   <Text style={styles.infoText}>
//                     After successful booking, you'll receive a confirmation voucher with all the details.
//                   </Text>
//                 </View>
//               </ScrollView>

//               <View style={styles.modalFooter}>
//                 <TouchableOpacity 
//                   style={styles.cancelButton}
//                   onPress={() => setShowBookingModal(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={[styles.confirmButton, bookingLoading && styles.buttonDisabled]}
//                   onPress={handleMemberBooking}
//                   disabled={bookingLoading}
//                 >
//                   {bookingLoading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Booking</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Admin Reservation Modal */}
//         <Modal
//           visible={reserveModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>Confirm Reservation</Text>
              
//               <View style={styles.reservationDetails}>
//                 <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
//                 <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
//                 <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
//                 <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
//               </View>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.cancelButton]}
//                   onPress={() => setReserveModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.confirmButton]}
//                   onPress={handleAdminReserve}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Reserve</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Admin Unreserve Modal */}
//         <Modal
//           visible={unreserveModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>Confirm Unreserve</Text>
              
//               <View style={styles.reservationDetails}>
//                 <Text style={styles.detailLabel}>Hall: {venue?.name || venue?.title}</Text>
//                 <Text style={styles.detailLabel}>From: {formatDate(reserveFrom)}</Text>
//                 <Text style={styles.detailLabel}>To: {formatDate(reserveTo)}</Text>
//                 <Text style={styles.detailLabel}>Time Slot: {timeSlot}</Text>
//               </View>

//               <Text style={styles.warningText}>
//                 This will remove the reservation for the specified period.
//               </Text>

//               <View style={styles.modalActions}>
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.cancelButton]}
//                   onPress={() => setUnreserveModalVisible(false)}
//                 >
//                   <Text style={styles.cancelButtonText}>Cancel</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity 
//                   style={[styles.modalButton, styles.unreserveConfirmButton]}
//                   onPress={handleAdminUnreserve}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color="#FFF" />
//                   ) : (
//                     <Text style={styles.confirmButtonText}>Confirm Unreserve</Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>

//         {/* Calendar Modal */}
//         <Modal
//           visible={calendarModalVisible}
//           animationType="slide"
//           transparent={true}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.calendarModalContent}>
//               <Text style={styles.calendarTitle}>
//                 Select {calendarType === 'from' ? 'Start' : 'End'} Date
//               </Text>
              
//               <Calendar
//                 onDayPress={handleDateSelect}
//                 markedDates={{
//                   [reserveFrom]: { selected: true, selectedColor: '#007AFF' },
//                   [reserveTo]: { selected: true, selectedColor: '#007AFF' }
//                 }}
//                 minDate={new Date().toISOString().split('T')[0]}
//                 theme={{
//                   todayTextColor: '#007AFF',
//                   arrowColor: '#007AFF',
//                   selectedDayBackgroundColor: '#007AFF',
//                   selectedDayTextColor: '#FFF',
//                 }}
//               />
              
//               <TouchableOpacity 
//                 style={styles.closeCalendarButton}
//                 onPress={() => setCalendarModalVisible(false)}
//               >
//                 <Text style={styles.closeCalendarText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F7FAFC',
//   },
//   headerBackground: {
//     paddingTop: 50,
//     paddingBottom: 20,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     overflow: 'hidden',
//   },
//   headerImage: {
//     opacity: 0.9,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#FFF',
//     textShadowColor: 'rgba(0,0,0,0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#FFF',
//     marginTop: 4,
//     textShadowColor: 'rgba(0,0,0,0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//   },
//   placeholder: {
//     width: 40,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingVertical: 15,
//   },
  
//   // Admin Toggle Styles
//   adminToggleSection: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 15,
//     borderRadius: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: '#DC3545',
//   },
//   adminToggleTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#DC3545',
//     marginBottom: 10,
//   },
//   toggleContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#F8F9FA',
//     borderRadius: 8,
//     padding: 4,
//   },
//   toggleButton: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: 'center',
//     borderRadius: 6,
//   },
//   toggleButtonActive: {
//     backgroundColor: '#DC3545',
//   },
//   toggleButtonText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6C757D',
//   },
//   toggleButtonTextActive: {
//     color: '#FFF',
//   },

//   // Venue Info
//   venueInfoCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     borderLeftWidth: 4,
//     borderLeftColor: '#B8860B',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   venueInfoTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#B8860B',
//     marginBottom: 10,
//   },
//   venueName: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginBottom: 5,
//   },
//   venueDescription: {
//     fontSize: 14,
//     color: '#718096',
//     marginBottom: 10,
//     lineHeight: 20,
//   },
//   venueStats: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   venueStat: {
//     fontSize: 14,
//     color: '#4A5568',
//     fontWeight: '500',
//   },
//   memberInfo: {
//     marginTop: 10,
//     padding: 10,
//     backgroundColor: '#e8f5e8',
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#4CAF50',
//   },
//   memberInfoText: {
//     fontSize: 14,
//     color: '#2E7D32',
//     fontWeight: '600',
//   },

//   // Section Cards
//   sectionCard: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#2D3748',
//     marginLeft: 10,
//   },
//   sectionLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//   },

//   // Calendar
//   calendar: {
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   selectedDateContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#F0FFF4',
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: '#9AE6B4',
//   },
//   selectedDateText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#2D3748',
//     marginLeft: 8,
//   },

//   // Inputs
//   inputGroup: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F7FAFC',
//     borderRadius: 12,
//     paddingHorizontal: 15,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#E2E8F0',
//   },
//   inputIcon: {
//     marginRight: 12,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//     color: '#2D3748',
//   },
//   textArea: {
//     height: 80,
//     paddingVertical: 12,
//   },

//   // Dropdown
//   dropdownSection: {
//     marginBottom: 20,
//   },
//   dropdown: {
//     backgroundColor: '#F7FAFC',
//     borderColor: '#E2E8F0',
//     borderWidth: 1,
//     borderRadius: 12,
//   },
//   dropdownContainer: {
//     backgroundColor: '#F7FAFC',
//     borderColor: '#E2E8F0',
//     borderRadius: 12,
//   },

//   // Admin Reservation Styles
//   dateSection: {
//     marginBottom: 20,
//   },
//   dateInputs: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   dateInput: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     borderRadius: 8,
//     padding: 12,
//     backgroundColor: '#F9F9F9',
//     gap: 8,
//   },
//   dateInputText: {
//     fontSize: 14,
//     color: '#333',
//   },
//   adminActionButtons: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   adminButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   reserveButton: {
//     backgroundColor: '#28a745',
//   },
//   unreserveButton: {
//     backgroundColor: '#dc3545',
//   },
//   adminButtonText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },

//   // Total Amount
//   totalCard: {
//     backgroundColor: '#2D3748',
//     marginHorizontal: 15,
//     marginBottom: 15,
//     padding: 20,
//     borderRadius: 16,
//     alignItems: 'center',
//   },
//   totalLabel: {
//     fontSize: 16,
//     color: '#CBD5E0',
//     marginBottom: 8,
//   },
//   totalAmount: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#FFF',
//     marginBottom: 8,
//   },
//   totalNote: {
//     fontSize: 12,
//     color: '#A0AEC0',
//     fontStyle: 'italic',
//   },

//   // Submit Button
//   submitButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#B8860B',
//     marginHorizontal: 15,
//     paddingVertical: 18,
//     borderRadius: 12,
//     shadowColor: '#B8860B',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//   },
//   submitButtonDisabled: {
//     backgroundColor: '#CBD5E0',
//     shadowColor: 'transparent',
//   },
//   submitButtonText: {
//     color: '#FFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginRight: 8,
//   },

//   // Footer Spacer
//   footerSpacer: {
//     height: 30,
//   },

//   // Modal Styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: '#FFF',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: '80%',
//     padding: 20,
//   },
//   calendarModalContent: {
//     backgroundColor: '#FFF',
//     borderRadius: 12,
//     padding: 20,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 20,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   calendarTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   modalContent: {
//     flex: 1,
//   },

//   // Booking Summary
//   bookingSummary: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   summaryTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#333',
//     marginBottom: 15,
//     textAlign: 'center',
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//     paddingVertical: 5,
//   },
//   summaryLabel: {
//     fontSize: 14,
//     color: '#666',
//     fontWeight: '600',
//   },
//   summaryValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//     textAlign: 'right',
//     flex: 1,
//     marginLeft: 10,
//   },

//   // Reservation Details
//   reservationDetails: {
//     backgroundColor: '#F8F9FA',
//     padding: 15,
//     borderRadius: 8,
//     marginBottom: 20,
//   },
//   detailLabel: {
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 5,
//   },

//   // Info Box
//   infoBox: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     backgroundColor: '#FFF8E1',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#B8860B',
//   },
//   infoText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#8D6E63',
//     marginLeft: 8,
//     lineHeight: 16,
//   },

//   // Warning Box
//   warningBox: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFE6E6',
//     padding: 12,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: '#DC3545',
//     marginTop: 10,
//   },
//   warningText: {
//     fontSize: 12,
//     color: '#DC3545',
//     marginLeft: 8,
//     flex: 1,
//   },

//   // Warning Text
//   warningText: {
//     fontSize: 14,
//     color: '#DC3545',
//     textAlign: 'center',
//     marginBottom: 20,
//     fontStyle: 'italic',
//   },

//   // Modal Actions
//   modalActions: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   modalButton: {
//     flex: 1,
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#6c757d',
//   },
//   confirmButton: {
//     backgroundColor: '#B8860B',
//   },
//   unreserveConfirmButton: {
//     backgroundColor: '#dc3545',
//   },
//   buttonDisabled: {
//     opacity: 0.6,
//   },
//   cancelButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   confirmButtonText: {
//     color: '#FFF',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },

//   // Calendar Close Button
//   closeCalendarButton: {
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#007AFF',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   closeCalendarText: {
//     color: '#FFF',
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
// });

// export default bhbooking;