
// import 'react-native-gesture-handler';
// import React, { useState, useEffect } from 'react';
// import { enableScreens } from 'react-native-screens';
// import { View, Button, Alert, LogBox, Image, StyleSheet, Text } from 'react-native';
// import { AuthProvider } from './src/auth/contexts/AuthContext';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
// import { supabase } from './lib/supabase';
// import 'react-native-url-polyfill/auto';

// // ===== Your Components =====
// import Auth from './components/Auth';
// import Account from './components/Account';
// import Home from './components/Home';
// import BusinessAccount from './components/BusinessAccount';
// import PersonalAccount from './components/PersonalAccount';
// import GroupExp from './PersonalScreens/GroupExp';
// import GroupsScreen from './PersonalScreens/Group';
// import GroupHistory from './PersonalScreens/GroupHistory';
// import Invoicing from './businessAcct/Invoicing';
// import Payments from './businessAcct/Payments';
// import Expenses from './businessAcct/Expenses';
// import Reports from './businessAcct/Reports';
// import Proposals from './businessAcct/Proposals';
// import Retailer from './businessAcct/Retailer';
// import Location from './businessAcct/BusinessHome';
// import Wholesaler from './businessAcct/Wholesaler';
// import Logbook from './screens/Logbook';
// import AddLogEntry from './screens/AddLogEntry';
// import CustomersScreen from './screens/CustomersScreen';
// import Acct from './components/Acct';
// import ReceiptScreen from './screens/ReceiptScreen';
// import Dashboard from './screens/Dashboard';
// import PendingReqs from './PersonalScreens/PendingReqs';
// import BusinessHome from './businessAcct/BusinessHome';
// import GroupExpenseDetail from './PersonalScreens/GroupExpenseDetail';
// import ForgotPassword from './components/ForgotPassword';
// import UpdatePassword from './components/UpdatePassword';
// import home from './src/rooms/home';
// import details from './src/rooms/details';
// import booking from './src/rooms/booking';
// import studio from './src/rooms/studio';
// import deluxe from './src/rooms/deluxe';
// import suite from './src/rooms/suite';
// import start from './slides/start';
// import about from './slides/about';
// import aff_club from './slides/aff_club';
// import contact from './slides/contact';
// import BH from './src/halls/BanquetHallScreen';
// import BHBooking from './src/halls/BHBooking';
// import shoots from './slides/shoots';
// import shootsBooking from './slides/shootsBooking';
// import ConferenceRoomBookingScreen from './slides/ConferenceRoomBookingScreen';
// import ConferenceRoomDetailsScreen from './slides/ConferenceRoomDetailsScreen';
// import TimePickerModal from './slides/TimePickerModal';
// import events from './slides/events';
// import VerifyScreen from './src/auth/VerifyScreen';
// import SportsScreen from './slides/SportsScreen';
// import ClubArenaScreen from './slides/ClubArenaScreen';
// import BillPaymentScreen from './slides/BillPaymentScreen';
// import LoginScr from './src/auth/LoginScr';
// import HallDetailsScreen from './src/halls/HallDetailsScreen';
// import voucher from './src/rooms/voucher';
// import Lawn from './src/lawn/Lawn';
// import LawnBooking from './src/lawn/LawnBooking';
// import LawnListScreen from './src/lawn/LawnListScreen';
// import Voucher from './src/lawn/Voucher';

// // ===== Navigation Setup =====
// enableScreens();
// const Stack = createNativeStackNavigator();
// const Drawer = createDrawerNavigator();

// // ===== Custom Drawer Content Component =====
// function CustomDrawerContent(props) {
//   return (
//     <DrawerContentScrollView {...props}>
//       {/* Header with Image */}
//       <View style={styles.drawerHeader}>
//         <Image 
//           source={require('./assets/psc_home.jpeg')} 
//           style={styles.drawerImage}
//           resizeMode="cover"
//         />
//         <Text style={styles.drawerTitle}>PESHAWAR SERVICES CLUB</Text>
//       </View>
      
//       {/* Default Drawer Items */}
//       <DrawerItemList {...props} />
//     </DrawerContentScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   drawerHeader: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     alignItems: 'center',
//   },
//   drawerImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     marginBottom: 10,
//   },
//   drawerTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     color: '#000',
//   },
// });

// // ===== Logout Component =====
// function LogoutScreen({ navigation }) {
//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     navigation.replace('Auth');
//   };
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Log out" onPress={handleLogout} color="red" />
//     </View>
//   );
// }

// // ===== Drawer Navigator (Visible only after login) =====
// function HomeDrawer({ session, users }) {
//   return (
//     <AuthProvider>
//     <Drawer.Navigator
//       screenOptions={{
//         headerShown: true,
//         drawerActiveTintColor: '#007AFF',
//         drawerLabelStyle: { fontSize: 16 },
//       }}
//       drawerContent={(props) => <CustomDrawerContent {...props} />}
//     >
//       <Drawer.Screen name="LoginScr" component={LoginScr} />
//       <Drawer.Screen name="VerifyScreen" component={VerifyScreen} />
//       <Drawer.Screen name="start" component={start} />
//       <Drawer.Screen name="home" component={home} />
//       <Drawer.Screen name="about" component={about} />
//       <Drawer.Screen name="aff_club" component={aff_club} />
//       <Drawer.Screen name="contact" component={contact} />
//       <Drawer.Screen name="BH" component={BH} />
//       <Drawer.Screen name="BHBooking" component={BHBooking} />
//       <Drawer.Screen name="Lawn" component={Lawn} />
//       <Drawer.Screen name="LawnListScreen" component={LawnListScreen} />
// <Drawer.Screen name="LawnBooking" component={LawnBooking} />
// <Drawer.Screen name="Voucher" component={Voucher} />
//       <Drawer.Screen name="shoots" component={shoots} />
//       <Drawer.Screen name="shootsBooking" component={shootsBooking} />
//       <Drawer.Screen name="ConferenceRoomBookingScreen" component={ConferenceRoomBookingScreen} />
//       <Drawer.Screen name="ConferenceRoomDetailsScreen" component={ConferenceRoomDetailsScreen} />
//       <Drawer.Screen name="events" component={events} />
//       <Drawer.Screen name="SportsScreen" component={SportsScreen}/>
//       <Drawer.Screen name="ClubArenaScreen" component={ClubArenaScreen} />  
//       <Drawer.Screen name="Business Account" component={BusinessAccount} />
//       <Drawer.Screen name="Personal Account" component={PersonalAccount} />
//       <Drawer.Screen name="Groups" component={GroupsScreen} />
//       <Drawer.Screen name="Group Expenses" component={GroupExp} />
//       <Drawer.Screen name="Group History" component={GroupHistory} />
//       <Drawer.Screen name="Invoicing" component={Invoicing} />
//       <Drawer.Screen name="Payments" component={Payments} />
//       <Drawer.Screen name="Expenses" component={Expenses} />
//       <Drawer.Screen name="Reports" component={Reports} />
//       <Drawer.Screen name="Proposals" component={Proposals} />
//       <Drawer.Screen name="Retailer" component={Retailer} />
//       <Drawer.Screen name="Wholesaler" component={Wholesaler} />
//       <Drawer.Screen name="Logbook" component={Logbook} />
//       <Drawer.Screen name="Add Log Entry" component={AddLogEntry} />
//       <Drawer.Screen name="Customers" component={CustomersScreen} />
//       <Drawer.Screen name="Receipts" component={ReceiptScreen} />
//       <Drawer.Screen name="Pending Requests" component={PendingReqs} />
//       <Drawer.Screen name="Business Home" component={BusinessHome} />
//       <Drawer.Screen name="Logout" component={LogoutScreen} />
//     </Drawer.Navigator>
//     </AuthProvider>
//   );
// }

// // ===== Main App Component =====
// export default function App() {
//   const [session, setSession] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // Ignore noisy logs
//   useEffect(() => {
//     LogBox.ignoreLogs(['Animated node with tag', 'ViewPropTypes']);
//   }, []);

//   // Fetch session from Supabase
//   useEffect(() => {
//     const fetchSession = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         setSession(session);
//       } catch (error) {
//         console.error('Error fetching session:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchSession();

//     const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//       setIsLoading(false);
//     });

//     return () => {
//       authListener.subscription.unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     if (session) getAllUsers();
//   }, [session]);

//   async function getAllUsers() {
//     try {
//       const { data, error } = await supabase.from('profiles').select('id, username');
//       if (error) {
//         Alert.alert('Error', error.message);
//       } else {
//         setUsers(data ?? []);
//       }
//     } catch (error) {
//       console.error('Error fetching users:', error);
//     }
//   }

//   if (isLoading) return null;

//   return (
//     <AuthProvider>
//     <NavigationContainer>
//       <Stack.Navigator
//         screenOptions={({ navigation, route }) => ({
//           headerShown: !['Auth', 'Account', 'Home', 'Acct'].includes(route.name),
//           headerStyle: {
//             elevation: 0,
//             shadowOpacity: 0,
//             backgroundColor: 'black',
//           },
//           headerShadowVisible: false,
//           gestureEnabled: false,
//           animation: 'none',
//           headerTitle: '',
//           headerLeft: () =>
//             navigation.canGoBack() ? (
//               <Button onPress={() => navigation.goBack()} title="Back" color="#007AFF" />
//             ) : null,
//         })}
//         initialRouteName={session && session.user ? 'Account' : 'Auth'}
//       >
//         <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />

//         <Stack.Screen name="Account">
//           {(props) => <Account {...props} session={session} users={users} />}
//         </Stack.Screen>

//         {/* Drawer-enabled Home */}
//         <Stack.Screen name="Home">
//           {(props) => <HomeDrawer {...props} session={session} users={users} />}
//         </Stack.Screen>

//         <Stack.Screen name="Acct">
//           {(props) => <Account {...props} session={session} users={users} />}
//         </Stack.Screen>

//         {/* Other screens accessible by navigation */}
//         <Stack.Screen name="LoginScr" component={LoginScr} />
//         <Stack.Screen name="VerifyScreen" component={VerifyScreen} />
//         <Stack.Screen name="SportsScreen" component={SportsScreen}/>
//         <Stack.Screen name="ClubArenaScreen" component={ClubArenaScreen} />
//         <Stack.Screen name="GroupExpenseDetail" component={GroupExpenseDetail} />
//         <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
//         <Stack.Screen name="UpdatePassword" component={UpdatePassword} />
//         <Stack.Screen name="home" component={home} />
//         <Stack.Screen name="details" component={details} />
//         <Stack.Screen name="booking" component={booking} />
//         <Stack.Screen name="studio" component={studio} />
//         <Stack.Screen name="deluxe" component={deluxe} />
//         <Stack.Screen name="suite" component={suite} />
//         <Stack.Screen name="start" component={start} />
//         <Stack.Screen name="BH" component={BH} />
//         <Stack.Screen name="BHBooking" component={BHBooking} />
//         <Stack.Screen name="shoots" component={shoots} />
//         <Stack.Screen name="shootsBooking" component={shootsBooking} />
//         <Stack.Screen name="ConferenceRoomBooking" component={ConferenceRoomBookingScreen} />
//         <Stack.Screen name="ConferenceRoomDetails" component={ConferenceRoomDetailsScreen} />
//         <Stack.Screen name="events" component={events} />
//         <Stack.Screen name="BillPaymentsScreen" component={BillPaymentScreen} />
//         <Stack.Screen name="HallDetailsScreen" component={HallDetailsScreen} />
//         <Stack.Screen name="voucher" component={voucher}/>
//         <Stack.Screen name="Lawn" component={Lawn}/>
//         <Stack.Screen name="LawnBooking" component={LawnBooking} />
//         <Stack.Screen name="LawnListScreen" component={LawnListScreen} />
// <Stack.Screen name="Voucher" component={Voucher} />

//       </Stack.Navigator>
//     </NavigationContainer>
//     </AuthProvider>
//   );
// }

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';
import { View, Button, Alert, LogBox, Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { AuthProvider, useAuth } from './src/auth/contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

// Import screens
import home from './src/rooms/home';
import start from './slides/start';
import details from './src/rooms/details';
import booking from './src/rooms/booking';
import studio from './src/rooms/studio';
import deluxe from './src/rooms/deluxe';
import suite from './src/rooms/suite';
import about from './slides/about';
import contact from './slides/contact';
import BH from './src/halls/BanquetHallScreen';
import BHBooking from './src/halls/BHBooking';
import shoots from './slides/shoots';
import shootsBooking from './slides/shootsBooking';
import ConferenceRoomBookingScreen from './slides/ConferenceRoomBookingScreen';
import ConferenceRoomDetailsScreen from './slides/ConferenceRoomDetailsScreen';
import events from './slides/events';
import VerifyScreen from './src/auth/VerifyScreen';
import SportsScreen from './slides/SportsScreen';
import ClubArenaScreen from './slides/ClubArenaScreen';
import BillPaymentScreen from './slides/BillPaymentScreen';
import LoginScr from './src/auth/LoginScr';
import HallDetailsScreen from './src/halls/HallDetailsScreen';
import voucher from './src/rooms/voucher';
import Lawn from './src/lawn/Lawn';
import LawnBooking from './src/lawn/LawnBooking';
import LawnListScreen from './src/lawn/LawnListScreen';
import Voucher from './src/lawn/Voucher';
import InvoiceScreen from './src/shoots/InvoiceScreen';
import BookingConfirmation from './src/shoots/BookingConfirmation';
import HallInvoiceScreen from './src/halls/HallInvoiceScreen';
import aff_club from './src/affClub/aff_club';
import calendar from './src/adminOnly/calender';


// ===== Navigation Setup =====
enableScreens();
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// ===== Custom Drawer Content Component =====
function CustomDrawerContent(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              props.navigation.navigate('LoginScr');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* Header with Image */}
      <View style={styles.drawerHeader}>
        <Image 
          source={require('./assets/psc_home.jpeg')} 
          style={styles.drawerImage}
          resizeMode="cover"
        />
        <Text style={styles.drawerTitle}>PESHAWAR SERVICES CLUB</Text>
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
        )}
      </View>
      
      {/* Default Drawer Items */}
      <DrawerItemList {...props} />
      
      {/* Logout Button */}
      {user && (
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </DrawerContentScrollView>
  );
}

// ===== Member Drawer Navigator =====
function MemberDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { fontSize: 16 },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      initialRouteName="Dashboard"
    >
      <Drawer.Screen name="Dashboard" component={start} />
      <Drawer.Screen name="Rooms" component={home} />
      <Drawer.Screen name="Banquet Halls" component={BH} />
      <Drawer.Screen name="Lawns" component={Lawn} />
      <Drawer.Screen name="Photo Shoots" component={shoots} />
      <Drawer.Screen name="Conference Rooms" component={ConferenceRoomDetailsScreen} />
      <Drawer.Screen name="Sports Facilities" component={SportsScreen} />
      <Drawer.Screen name="Club Arena" component={ClubArenaScreen} />
      <Drawer.Screen name="Events" component={events} />
      <Drawer.Screen name="Bill Payments" component={BillPaymentScreen} />
      <Drawer.Screen name="About Club" component={about} />
      <Drawer.Screen name="Affiliated Clubs" component={aff_club} />
      <Drawer.Screen name="Contact Us" component={contact} />
    </Drawer.Navigator>
  );
}

// ===== Admin Drawer Navigator =====
function AdminDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#007AFF',
        drawerLabelStyle: { fontSize: 16 },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
     initialRouteName='start'
    >

      <Drawer.Screen 
        name="Facility Calendar" 
        component={calendar}
      />
    
      {/* Admin can also access member features */}
      <Drawer.Screen name="start" component={start} />
      <Drawer.Screen name="home" component={home} />
      <Drawer.Screen name="Banquet Halls" component={BH} />
      <Drawer.Screen name="Lawns" component={Lawn} />
      <Drawer.Screen name="Photo Shoots" component={shoots} />
      <Drawer.Screen name="Conference Rooms" component={ConferenceRoomDetailsScreen} />
      <Drawer.Screen name="Sports Facilities" component={SportsScreen} />
    </Drawer.Navigator>
  );
}

// ===== Role-Based Drawer Selector =====
function RoleBasedDrawer() {
  const { user } = useAuth();
  
  // Check if user is admin (you might have SUPER_ADMIN, ADMIN, etc.)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  
  return isAdmin ? <AdminDrawer /> : <MemberDrawer />;
}

// ===== Main App Component =====
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  // Ignore noisy logs
  useEffect(() => {
    LogBox.ignoreLogs(['Animated node with tag', 'ViewPropTypes']);
  }, []);

  // Show nothing while checking auth state
  if (loading) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerShown: !['start', 'LoginScr'].includes(route.name),
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: 'black',
          },
          headerShadowVisible: false,
          gestureEnabled: false,
          animation: 'none',
          headerTitle: '',
          headerLeft: () =>
            navigation.canGoBack() ? (
              <Button onPress={() => navigation.goBack()} title="Back" color="#007AFF" />
            ) : null,
        })}
        initialRouteName={isAuthenticated ? 'start' : 'LoginScr'}
      >
        {/* Auth Screens */}
        <Stack.Screen name="LoginScr" component={LoginScr} options={{ headerShown: false }} />
        <Stack.Screen name="VerifyScreen" component={VerifyScreen} />

        {/* Main Drawer Navigation (Role-based) */}
        <Stack.Screen name="start" component={RoleBasedDrawer} />
        

        {/* Common screens accessible from anywhere */}
        <Stack.Screen name="home" component={home} />
        <Stack.Screen name="details" component={details} />
        <Stack.Screen name="booking" component={booking} />
        <Stack.Screen name="studio" component={studio} />
        <Stack.Screen name="deluxe" component={deluxe} />
        <Stack.Screen name="suite" component={suite} />
        <Stack.Screen name="BHBooking" component={BHBooking} />
        <Stack.Screen name="shootsBooking" component={shootsBooking} />
        <Stack.Screen name="ConferenceRoomBooking" component={ConferenceRoomBookingScreen} />
        <Stack.Screen name="HallDetailsScreen" component={HallDetailsScreen} />
        <Stack.Screen name="voucher" component={voucher} />
        <Stack.Screen name="LawnBooking" component={LawnBooking} />
        <Stack.Screen name="LawnListScreen" component={LawnListScreen} />
        <Stack.Screen name="Voucher" component={Voucher} />
        <Stack.Screen name="Lawn" component={Lawn} />
        <Stack.Screen name="BH" component={BH} />
        <Stack.Screen name="about" component={about} />
        <Stack.Screen name="aff_club" component={aff_club} />
        <Stack.Screen name="BillPaymentScreen" component={BillPaymentScreen} />
        <Stack.Screen name="ClubArenaScreen" component={ClubArenaScreen} />
        <Stack.Screen name="contact" component={contact} />
        <Stack.Screen name="events" component={events} />
        <Stack.Screen name="shoots" component={shoots} />
        <Stack.Screen name="SportsScreen" component={SportsScreen} />
        <Stack.Screen name='InvoiceScreen' component={InvoiceScreen}/>
        <Stack.Screen name='BookingConfirmation' component={BookingConfirmation}/>
        <Stack.Screen name="HallInvoiceScreen" component={HallInvoiceScreen} />
        


      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ===== Root App Component with AuthProvider =====
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  drawerImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 'auto',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});