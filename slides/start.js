
// screens/Start.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { useAuth } from '../src/auth/contexts/AuthContext';
import { getUserData, removeAuthData } from '../config/apis';

export default function start({ navigation }) {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user?.name) setUserName(user.name);
    else loadUserData();
  }, [user]);

  const loadUserData = async () => {
    try {
      const data = await getUserData();
      if (data?.name) setUserName(data.name);
    } catch (err) {
      console.error('❌ Error loading user data:', err);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeAuthData();
            navigation.replace('LoginScr');
          } catch (err) {
            console.error('Logout error:', err);
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const facilities = [
    {
      id: 1,
      name: 'Sports',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => navigation.navigate('SportsScreen'),
    },
    { id: 2, name: 'Messing', icon: '🍽️', color: '#8B4513' },
    {
      id: 3,
      name: 'Guest Room',
      image: require('../assets/psc_home.jpeg'),
      onPress: () => navigation.navigate('home'),
    },
    {
      id: 4,
      name: 'Affiliated Clubs',
      image: require('../assets/psc2.jpeg'),
      onPress: () => navigation.navigate('aff_club'),
    },
    {
      id: 5,
      name: 'Banquet Hall',
      image: require('../assets/psc3.jpeg'),
      onPress: () => navigation.navigate('BH'),
    },
    {
      id: 6,
      name: 'Photo Shoot',
      image: require('../assets/bg.jpeg'),
      onPress: () => navigation.navigate('shoots'),
    },
    {
      id: 7,
      name: 'Events',
      icon: '🎭',
      color: '#FF0000',
      image: require('../assets/bg.jpeg'),
      onPress: () => navigation.navigate('events'),
    },
    {
      id: 8,
      name: 'Bill Payments',
      icon: '💳',
      color: '#4169E1',
      image: require('../assets/bg.jpeg'),
      onPress: () => navigation.navigate('BillPaymentsScreen'),
    },
     {
      id: 9,
      name: 'Lawn',
      icon: '💳',
      color: '#4169E1',
      image: require('../assets/bg.jpeg'),
      onPress: () => navigation.navigate('Lawn'),
    },
  ];

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/bg.jpeg')}
        style={styles.loadingBackground}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Checking authentication...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* 🔹 Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.ctext}>Peshawar Services Club</Text>
              <Text style={styles.welcomeText}>
                {userName
                  ? `Welcome ${userName} (${user?.role || 'Member'})`
                  : 'Welcome to the Club'}
              </Text>
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* 🔹 Image Slider */}
          <View style={styles.sliderContainer}>
            <Swiper
              autoplay
              autoplayTimeout={4}
              loop
              showsPagination
              activeDotColor="#A3834C"
            >
              <Image
                source={require('../assets/psc_home.jpeg')}
                style={styles.sliderImage}
              />
              <Image
                source={require('../assets/psc2.jpeg')}
                style={styles.sliderImage}
              />
              <Image
                source={require('../assets/psc3.jpeg')}
                style={styles.sliderImage}
              />
            </Swiper>
          </View>

          {/* 🔹 Facilities Header */}
          <View style={styles.sectionHeader}>
            <View style={styles.line} />
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.line} />
          </View>

          {/* 🔹 Facilities Grid */}
          <View style={styles.facilitiesGrid}>
            {facilities.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                style={styles.facilityCard}
                onPress={
                  facility.onPress
                    ? facility.onPress
                    : () => Alert.alert('Facility', `${facility.name} - Coming Soon!`)
                }
              >
                {facility.image ? (
                  <Image source={facility.image} style={styles.facilityImage} />
                ) : (
                  <View
                    style={[
                      styles.facilityImageIcon,
                      { backgroundColor: facility.color },
                    ]}
                  >
                    <Text style={styles.facilityIcon}>{facility.icon}</Text>
                  </View>
                )}
                <Text style={styles.facilityName}>{facility.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* 🔹 Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[
              styles.navButton,
              activeTab === 'home' && styles.activeNavButton,
            ]}
            onPress={() => setActiveTab('home')}
          >
            <Text
              style={[
                styles.navIcon,
                activeTab === 'home' && styles.activeNavIcon,
              ]}
            >
              🏠
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  loadingBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingContainer: { alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 10, fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: { flex: 1 },
  ctext: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  welcomeText: { fontSize: 14, color: '#000', opacity: 0.8 },
  logoutButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  logoutText: { color: 'white', fontSize: 14, fontWeight: '500' },
  sliderContainer: {
    height: 250,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  sliderImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 25,
  },
  line: { flex: 1, height: 1, backgroundColor: '#A3834C', marginHorizontal: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  facilityCard: {
    width: '45%',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  facilityImage: { width: '100%', height: 120, resizeMode: 'cover' },
  facilityImageIcon: { width: '100%', height: 120, justifyContent: 'center', alignItems: 'center' },
  facilityIcon: { fontSize: 50 },
  facilityName: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center', paddingVertical: 8 },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8D4B8',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDD',
  },
  navButton: { padding: 10 },
  navIcon: { fontSize: 24, color: '#555' },
  activeNavButton: { backgroundColor: '#b48a64', borderRadius: 12 },
  activeNavIcon: { color: '#fff' },
});


// screens/Start.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Image,
//   SafeAreaView,
//   StatusBar,
//   ImageBackground,
//   ActivityIndicator,
// } from 'react-native';
// import Swiper from 'react-native-swiper';
// import { useAuth } from '../src/auth/contexts/AuthContext';
// import { getUserData, removeAuthData } from '../config/apis';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import FontAwesome from 'react-native-vector-icons/FontAwesome';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// export default function start({ navigation }) {
//   const { user, loading } = useAuth();
//   const [activeTab, setActiveTab] = useState('home');
//   const [userName, setUserName] = useState('');

//   useEffect(() => {
//     if (user?.name) setUserName(user.name);
//     else loadUserData();
//   }, [user]);

//   const loadUserData = async () => {
//     try {
//       const data = await getUserData();
//       if (data?.name) setUserName(data.name);
//     } catch (err) {
//       console.error('❌ Error loading user data:', err);
//     }
//   };

//   const handleLogout = async () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             await removeAuthData();
//             navigation.replace('LoginScr');
//           } catch (err) {
//             console.error('Logout error:', err);
//             Alert.alert('Error', 'Failed to logout');
//           }
//         },
//       },
//     ]);
//   };

//   const facilities = [
//   {
//     id: 1,
//     name: 'Sports',
//     image: require('../assets/logo1.png'),
//     icon: 'sports-soccer',
//     iconType: 'material',
//     onPress: () => navigation.navigate('SportsScreen'),
//   },
//   { 
//     id: 2, 
//     name: 'Messing', 
//     image: require('../assets/logo1.png'),
//     icon: 'restaurant',
//     iconType: 'material',
//     onPress: () => navigation.navigate('Messing'),
//   },
//   {
//     id: 3,
//     name: 'Guest Room',
//     image: require('../assets/logo1.png'),
//     icon: 'hotel',
//     iconType: 'material',
//     onPress: () => navigation.navigate('home'),
//   },
//   {
//     id: 4,
//     name: 'Conference Room',
//     image: require('../assets/logo1.png'),
//     icon: 'meeting-room',
//     iconType: 'material',
//     onPress: () => navigation.navigate('ConferenceRoomDetails'),
//   },
//   {
//     id: 5,
//     name: 'Banquet Hall',
//     image: require('../assets/psc_home.jpeg'),
//     icon: 'party-popper',
//     iconType: 'material-community',
//     onPress: () => navigation.navigate('BH'),
//   },
//   {
//     id: 6,
//     name: 'Photo Shoot',
//     image: require('../assets/bg.jpeg'),
//     icon: 'camera-alt',
//     iconType: 'material',
//     onPress: () => navigation.navigate('shoots'),
//   },
//   {
//     id: 7,
//     name: 'Events',
//     image: require('../assets/logo1.png'),
//     icon: 'event',
//     iconType: 'material',
//     onPress: () => navigation.navigate('events'),
//   },
//   {
//     id: 8,
//     name: 'Bill Payments',
//     image: require('../assets/logo1.png'),
//     icon: 'payment',
//     iconType: 'material',
//     onPress: () => navigation.navigate('BillPaymentsScreen'),
//   },
// ];
//   const renderIcon = (facility) => {
//     const iconProps = {
//       size: 50,
//       color: facility.color || '#333',
//     };

//     switch (facility.iconType) {
//       case 'material':
//         return <Icon name={facility.icon} {...iconProps} />;
//       case 'material-community':
//         return <MaterialCommunityIcons name={facility.icon} {...iconProps} />;
//       case 'fontawesome':
//         return <FontAwesome name={facility.icon} {...iconProps} />;
//       default:
//         return <Icon name={facility.icon} {...iconProps} />;
//     }
//   };

//   if (loading) {
//     return (
//       <ImageBackground
//         source={require('../assets/bg.jpeg')}
//         style={styles.loadingBackground}
//         resizeMode="cover"
//       >
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#ffffff" />
//           <Text style={styles.loadingText}>Checking authentication...</Text>
//         </View>
//       </ImageBackground>
//     );
//   }

//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView style={styles.container}>

//         {/* ==================== FIXED SECTION ==================== */}
//         <View style={styles.fixedSection}>

//           {/* 🔹 Notch Header */}
//           <ImageBackground
//             source={require('../assets/logo1.png')}
//             style={styles.notch}
//             imageStyle={styles.notchImage}
//           >
//             {/* Drawer Button - Left */}
//             <TouchableOpacity
//               style={styles.drawerButton}
//               onPress={() => navigation.toggleDrawer()}
//             >
//               <Icon name="menu" size={26} color="#000" />
//             </TouchableOpacity>

//             {/* Title - Center */}
//             <Text style={styles.headerTitle}>Peshawar Services Club</Text>

//             {/* Bell Icon - Right */}
//             <TouchableOpacity
//               style={styles.bellButton}
//               onPress={() => Alert.alert('Notifications', 'No new notifications')}
//             >
//               <Icon name="notifications" size={24} color="#000" />
//             </TouchableOpacity>

//             {/* Welcome Text */}
//             <View>
//               <Text style={styles.usertext}>
//                 {userName
//                   ? `Welcome ${userName}`
//                   : 'Welcome user'}
//               </Text>
//             </View>
//           </ImageBackground>

//           {/* 🔹 Image Slider */}
//           <View style={styles.sliderContainer}>
//             <Swiper
//               autoplay
//               autoplayTimeout={4}
//               loop
//               showsPagination
//               activeDotColor="#A3834C"
//             >
//               <Image
//                 source={require('../assets/psc_home.jpeg')}
//                 style={styles.sliderImage}
//               />
//               <Image
//                 source={require('../assets/psc2.jpeg')}
//                 style={styles.sliderImage}
//               />
//               <Image
//                 source={require('../assets/psc3.jpeg')}
//                 style={styles.sliderImage}
//               />
//             </Swiper>
//           </View>

//           {/* 🔹 Facilities Header */}
//           <View style={styles.sectionHeader}>
//             <View style={styles.line} />
//             <Text style={styles.sectionTitle}>Facilities</Text>
//             <View style={styles.line} />
//           </View>

//         </View>

//         {/* ==================== SCROLLABLE SECTION ==================== */}
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//         >
//           {/* 🔹 Facilities Grid */}
//           <View style={styles.facilitiesGrid}>
//             {facilities.map((facility) => (
//               <TouchableOpacity
//                 key={facility.id}
//                 style={styles.facilityCard}
//                 onPress={
//                   facility.onPress
//                     ? facility.onPress
//                     : () => Alert.alert('Facility', `${facility.name} - Coming Soon!`)
//                 }
//               >
//                 {facility.image ? (
//                   <Image source={facility.image} style={styles.facilityImage} />
//                 ) : (
//                   <View
//                     style={[
//                       styles.facilityImageIcon,
//                       { backgroundColor: facility.color || '#f8f8f8' },
//                     ]}
//                   >
//                     {renderIcon(facility)}
//                   </View>
//                 )}
//                 <Text style={styles.facilityName}>{facility.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={{ height: 30 }} />
//         </ScrollView>

//         {/* 🔹 Bottom Navigation */}
//         <View style={styles.bottomNav}>
//           <TouchableOpacity
//             style={[
//               styles.navButton,
//               activeTab === 'home' && styles.activeNavButton,
//             ]}
//             onPress={() => setActiveTab('home')}
//           >
//             <Icon 
//               name="home" 
//               size={24} 
//               color={activeTab === 'home' ? '#fff' : '#555'} 
//             />
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//   },

//   /* ==================== LOADING ==================== */
//   loadingBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingContainer: {
//     alignItems: 'center',
//   },
//   loadingText: {
//     color: 'white',
//     marginTop: 10,
//     fontSize: 16,
//   },

//   /* ==================== FIXED SECTION ==================== */
//   fixedSection: {
//     backgroundColor: 'white',
//   },

//   notch: {
//     paddingTop: 100,
//     paddingBottom: 40,
//     borderBottomEndRadius: 40,
//     borderBottomStartRadius: 30,
//     alignItems: 'flex-start',
//     justifyContent: 'center',
//     paddingLeft: 20,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   notchImage: {
//     resizeMode: 'cover',
//   },
//   drawerButton: {
//     position: 'absolute',
//     top: 50,
//     left: 20,
//     zIndex: 10,
//     padding: 5,
//   },
//   bellButton: {
//     position: 'absolute',
//     top: 50,
//     right: 20,
//     zIndex: 10,
//     padding: 5,
//   },
//   headerTitle: {
//     position: 'absolute',
//     top: 53,
//     left: 0,
//     right: 0,
//     textAlign: 'center',
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#000',
//     zIndex: 5,
//     lineHeight: 26,
//   },
//   usertext: {
//     marginLeft: 130,
//     fontSize: 14,
//     color: '#000',
//   },

//   sliderContainer: {
//     height: 200,
//     width: '90%',
//     alignSelf: 'center',
//     marginTop: 20,
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   sliderImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },

//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 20,
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#A3834C',
//     marginHorizontal: 10,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#000',
//     textAlign: 'center',
//   },

//   /* ==================== SCROLLABLE SECTION ==================== */
//   scrollContent: {
//     paddingBottom: 30,
//   },
//   facilitiesGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//     paddingHorizontal: 10,
//   },
//   facilityCard: {
//     width: '45%',
//     marginBottom: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   facilityImage: {
//     width: '100%',
//     height: 120,
//     resizeMode: 'cover',
//   },
//   facilityImageIcon: {
//     width: '100%',
//     height: 120,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   facilityName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//     textAlign: 'center',
//     paddingVertical: 8,
//   },

//   /* ==================== BOTTOM NAV ==================== */
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#E8D4B8',
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#DDD',
//   },
//   navButton: {
//     padding: 10,
//   },
//   activeNavButton: {
//     backgroundColor: '#b48a64',
//     borderRadius: 12,
//   },
// });


// // screens/Start.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Image,
//   SafeAreaView,
//   StatusBar,
//   ImageBackground,
//   ActivityIndicator,
// } from 'react-native';
// import Swiper from 'react-native-swiper';
// import { useAuth } from '../contexts/AuthContext';
// import { getUserData, removeAuthData } from '../config/apis';

// export default function start({ navigation }) {
//   const { user, loading } = useAuth();
//   const [activeTab, setActiveTab] = useState('home');
//   const [userName, setUserName] = useState('');

//   useEffect(() => {
//     if (user?.name) setUserName(user.name);
//     else loadUserData();
//   }, [user]);

//   const loadUserData = async () => {
//     try {
//       const data = await getUserData();
//       if (data?.name) setUserName(data.name);
//     } catch (err) {
//       console.error('❌ Error loading user data:', err);
//     }
//   };

//   const handleLogout = async () => {
//     Alert.alert('Logout', 'Are you sure you want to logout?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Logout',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             await removeAuthData();
//             navigation.replace('LoginScr');
//           } catch (err) {
//             console.error('Logout error:', err);
//             Alert.alert('Error', 'Failed to logout');
//           }
//         },
//       },
//     ]);
//   };

//   const facilities = [
//     {
//       id: 1,
//       name: 'Sports',
//       image: require('../assets/psc_home.jpeg'),
//       onPress: () => navigation.navigate('SportsScreen'),
//     },
//     { id: 2, name: 'Messing', icon: '🍽️', color: '#8B4513' },
//     {
//       id: 3,
//       name: 'Guest Room',
//       image: require('../assets/psc_home.jpeg'),
//       onPress: () => navigation.navigate('home'),
//     },
//     {
//       id: 4,
//       name: 'Conference Room',
//       image: require('../assets/psc2.jpeg'),
//       onPress: () => navigation.navigate('ConferenceRoomDetailsScreen'),
//     },
//     {
//       id: 5,
//       name: 'Banquet Hall',
//       image: require('../assets/psc3.jpeg'),
//       onPress: () => navigation.navigate('BH'),
//     },
//     {
//       id: 6,
//       name: 'Photo Shoot',
//       image: require('../assets/bg.jpeg'),
//       onPress: () => navigation.navigate('shoots'),
//     },
//     {
//       id: 7,
//       name: 'Events',
//       icon: '🎭',
//       color: '#FF0000',
//       image: require('../assets/bg.jpeg'),
//       onPress: () => navigation.navigate('events'),
//     },
//     {
//       id: 8,
//       name: 'Bill Payments',
//       icon: '💳',
//       color: '#4169E1',
//       image: require('../assets/bg.jpeg'),
//       onPress: () => navigation.navigate('BillPaymentsScreen'),
//     },
//   ];

//   if (loading) {
//     return (
//       <ImageBackground
//         source={require('../assets/bg.jpeg')}
//         style={styles.loadingBackground}
//         resizeMode="cover"
//       >
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#ffffff" />
//           <Text style={styles.loadingText}>Checking authentication...</Text>
//         </View>
//       </ImageBackground>
//     );
//   }

//   return (
//     <>
//       <StatusBar barStyle="dark-content" />
//       <SafeAreaView style={styles.container}>
//         <ScrollView showsVerticalScrollIndicator={false}>
//           {/* 🔹 Header */}
//           <View style={styles.header}>
//             <View style={styles.headerContent}>
//               <Text style={styles.ctext}>Peshawar Services Club</Text>
//               <Text style={styles.welcomeText}>
//                 {userName
//                   ? `Welcome ${userName} (${user?.role || 'Member'})`
//                   : 'Welcome to the Club'}
//               </Text>
//             </View>

//             <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
//               <Text style={styles.logoutText}>Logout</Text>
//             </TouchableOpacity>
//           </View>

//           {/* 🔹 Image Slider */}
//           <View style={styles.sliderContainer}>
//             <Swiper
//               autoplay
//               autoplayTimeout={4}
//               loop
//               showsPagination
//               activeDotColor="#A3834C"
//             >
//               <Image
//                 source={require('../assets/psc_home.jpeg')}
//                 style={styles.sliderImage}
//               />
//               <Image
//                 source={require('../assets/psc2.jpeg')}
//                 style={styles.sliderImage}
//               />
//               <Image
//                 source={require('../assets/psc3.jpeg')}
//                 style={styles.sliderImage}
//               />
//             </Swiper>
//           </View>

//           {/* 🔹 Facilities Header */}
//           <View style={styles.sectionHeader}>
//             <View style={styles.line} />
//             <Text style={styles.sectionTitle}>Facilities</Text>
//             <View style={styles.line} />
//           </View>

//           {/* 🔹 Facilities Grid */}
//           <View style={styles.facilitiesGrid}>
//             {facilities.map((facility) => (
//               <TouchableOpacity
//                 key={facility.id}
//                 style={styles.facilityCard}
//                 onPress={
//                   facility.onPress
//                     ? facility.onPress
//                     : () => Alert.alert('Facility', `${facility.name} - Coming Soon!`)
//                 }
//               >
//                 {facility.image ? (
//                   <Image source={facility.image} style={styles.facilityImage} />
//                 ) : (
//                   <View
//                     style={[
//                       styles.facilityImageIcon,
//                       { backgroundColor: facility.color },
//                     ]}
//                   >
//                     <Text style={styles.facilityIcon}>{facility.icon}</Text>
//                   </View>
//                 )}
//                 <Text style={styles.facilityName}>{facility.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>

//           <View style={{ height: 30 }} />
//         </ScrollView>

//         {/* 🔹 Bottom Navigation */}
//         <View style={styles.bottomNav}>
//           <TouchableOpacity
//             style={[
//               styles.navButton,
//               activeTab === 'home' && styles.activeNavButton,
//             ]}
//             onPress={() => setActiveTab('home')}
//           >
//             <Text
//               style={[
//                 styles.navIcon,
//                 activeTab === 'home' && styles.activeNavIcon,
//               ]}
//             >
//               🏠
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'white' },
//   loadingBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingContainer: { alignItems: 'center' },
//   loadingText: { color: 'white', marginTop: 10, fontSize: 16 },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#f8f8f8',
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   headerContent: { flex: 1 },
//   ctext: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 4 },
//   welcomeText: { fontSize: 14, color: '#000', opacity: 0.8 },
//   logoutButton: {
//     backgroundColor: '#8B4513',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginLeft: 10,
//   },
//   logoutText: { color: 'white', fontSize: 14, fontWeight: '500' },
//   sliderContainer: {
//     height: 250,
//     width: '90%',
//     alignSelf: 'center',
//     marginTop: 20,
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   sliderImage: { width: '100%', height: '100%', resizeMode: 'cover' },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginVertical: 25,
//   },
//   line: { flex: 1, height: 1, backgroundColor: '#A3834C', marginHorizontal: 10 },
//   sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
//   facilitiesGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-around',
//     paddingHorizontal: 10,
//   },
//   facilityCard: {
//     width: '45%',
//     marginBottom: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   facilityImage: { width: '100%', height: 120, resizeMode: 'cover' },
//   facilityImageIcon: { width: '100%', height: 120, justifyContent: 'center', alignItems: 'center' },
//   facilityIcon: { fontSize: 50 },
//   facilityName: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center', paddingVertical: 8 },
//   bottomNav: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#E8D4B8',
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#DDD',
//   },
//   navButton: { padding: 10 },
//   navIcon: { fontSize: 24, color: '#555' },
//   activeNavButton: { backgroundColor: '#b48a64', borderRadius: 12 },
//   activeNavIcon: { color: '#fff' },
// });
