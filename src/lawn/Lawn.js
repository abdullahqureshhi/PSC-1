import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { lawnAPI } from '../../config/apis'; // You'll need to create this API config

const Lawn = ({ navigation }) => {
  const [lawnCategories, setLawnCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLawnCategories = async () => {
    try {
      console.log('🔄 Loading lawn categories...');
      setError({ message: null, status: null });
      setLoading(true);
      
      // Check if API exists
      if (!lawnAPI || !lawnAPI.getLawnCategories) {
        const errorMsg = 'API configuration error - lawnAPI not found';
        console.error('❌', errorMsg);
        setError({ 
          message: errorMsg, 
          status: null 
        });
        setLoading(false);
        return;
      }

      console.log('📞 Fetching lawn categories data...');
      const categoriesResponse = await lawnAPI.getLawnCategories();
      
      console.log('✅ Response received:', {
        status: categoriesResponse?.status,
        dataLength: categoriesResponse?.data?.length
      });
      
      if (categoriesResponse?.data && Array.isArray(categoriesResponse.data)) {
        console.log(`🌿 Found ${categoriesResponse.data.length} lawn categories`);
        
        const transformedCategories = categoriesResponse.data.map((category, index) => {
          // Get the first lawn in this category to show sample pricing
          const sampleLawn = category.lawns && category.lawns.length > 0 
            ? category.lawns[0] 
            : null;
          
          return {
            id: category.id || index,
            title: category.category || 'Unnamed Category',
            image: category.images && category.images.length > 0 
              ? { uri: category.images[0].url }
              : require('../../assets/logo.jpg'), // Add a default lawn image
            description: `Contains ${category.lawns?.length || 0} lawns`,
            lawnCount: category.lawns?.length || 0,
            samplePrice: sampleLawn ? sampleLawn.memberCharges : 0,
            isActive: true, // Assuming categories are always active
            type: 'lawnCategory',
            onPress: () => handleCategoryPress(category),
          };
        });
        
        setLawnCategories(transformedCategories);
        console.log('✅ Lawn categories loaded successfully');
      } else {
        console.warn('⚠️ No lawn categories found in response:', categoriesResponse);
        setLawnCategories([]);
      }

    } catch (err) {
      console.error('❌ Error loading lawn categories:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      
      let errorMessage = 'Failed to load lawn categories';
      let errorStatus = err.response?.status;
      
      // Handle specific error cases
      if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your authentication or contact administrator.';
        errorStatus = 403;
        
        Alert.alert(
          'Authentication Required',
          'You need proper permissions to access lawns. Please check if you are logged in with the right account.',
          [
            {
              text: 'OK',
              style: 'default',
            },
            {
              text: 'Retry',
              onPress: () => {
                setTimeout(() => handleRetry(), 100);
              }
            }
          ]
        );
        
      } else if (err.response?.status === 401) {
        errorMessage = 'Please login to access lawns';
        errorStatus = 401;
        
        Alert.alert(
          'Login Required',
          'Please login to view lawns.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Optional: Navigate to login screen
                // navigation.navigate('Login');
              }
            }
          ]
        );
        
      } else if (err.code === 'NETWORK_ERROR' || err.message?.includes('Network Error')) {
        errorMessage = 'Network error - Please check your internet connection';
        errorStatus = 'NETWORK_ERROR';
        
      } else if (err.response?.status === 404) {
        errorMessage = 'Lawns endpoint not found - Please contact support';
        errorStatus = 404;
        
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error - Please try again later';
        errorStatus = 500;
        
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError({ 
        message: errorMessage, 
        status: errorStatus 
      });
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('LawnListScreen', {
      categoryId: category.id,
      categoryName: category.category,
    });
  };

  const handleRetry = async () => {
    console.log('🔄 Retrying to fetch lawn categories...');
    setLoading(true);
    setError({ message: null, status: null });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    fetchLawnCategories();
  };

  const onRefresh = () => {
    console.log('🔄 Pull-to-refresh triggered');
    setRefreshing(true);
    setError({ message: null, status: null });
    fetchLawnCategories();
  };

  useEffect(() => {
    fetchLawnCategories();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ImageBackground
          source={require('../../assets/psc_home.jpeg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Lawns</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>
        
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading Lawns...</Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/psc_home.jpeg')}
          style={styles.notch}
          imageStyle={styles.notchImage}
        >
          <View style={styles.notchContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerText}>Lawns</Text>
            <View style={styles.placeholder} />
          </View>
        </ImageBackground>

        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4CAF50']}
                tintColor="#4CAF50"
              />
            }
          >
            {error.message && (
              <View style={[
                styles.errorBanner,
                error.status === 403 && styles.errorBanner403,
                error.status === 401 && styles.errorBanner401
              ]}>
                <View style={styles.errorTextContainer}>
                  <Text style={styles.errorBannerText}>{error.message}</Text>
                  {error.status && (
                    <Text style={styles.errorStatusText}>Error: {error.status}</Text>
                  )}
                </View>
                <View style={styles.errorButtons}>
                  <TouchableOpacity 
                    style={styles.retryButtonSmall} 
                    onPress={handleRetry}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                  {(error.status === 401 || error.status === 403) && (
                    <TouchableOpacity 
                      style={styles.loginButtonSmall} 
                      onPress={() => {
                        Alert.alert(
                          'Need Help?',
                          'Please contact administrator for access to lawns.'
                        );
                      }}
                    >
                      <Text style={styles.loginButtonText}>Get Help</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                🌿 Showing {lawnCategories.length} lawn categories
              </Text>
            </View>

            {lawnCategories.length > 0 ? (
              lawnCategories.map((category) => (
                <TouchableOpacity 
                  key={category.id} 
                  style={styles.card}
                  onPress={category.onPress}
                >
                  <ImageBackground
                    source={category.image}
                    style={styles.cardBackground}
                    imageStyle={styles.cardImage}
                  >
                    <View style={styles.overlay} />
                    <View style={styles.cardContent}>
                      <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>{category.title}</Text>
                        <Text style={styles.cardDescription}>
                          {category.description}
                        </Text>
                        
                        <View style={styles.detailsContainer}>
                          <Text style={styles.detailText}>
                            🏞️ {category.lawnCount} lawns
                          </Text>
                          {category.samplePrice > 0 && (
                            <Text style={styles.detailText}>
                              💰 From: Rs. {category.samplePrice}
                            </Text>
                          )}
                        </View>

                        <View style={styles.statusContainer}>
                          <Text style={styles.statusActive}>
                            ✅ Available for Booking
                          </Text>
                        </View>
                      </View>
                      <View style={styles.arrowContainer}>
                        <Text style={styles.arrowIcon}>›</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))
            ) : (
              !loading && !error && (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    No lawn categories available
                  </Text>
                  <Text style={styles.noDataSubText}>
                    There are currently no lawn categories in the system
                  </Text>
                  <TouchableOpacity 
                    style={styles.retryButton} 
                    onPress={handleRetry}
                  >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                </View>
              )
            )}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  // Info Container
  infoContainer: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  infoText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },
  errorBanner403: {
    backgroundColor: '#fff3cd',
    borderLeftColor: '#ffc107',
  },
  errorBanner401: {
    backgroundColor: '#d1ecf1',
    borderLeftColor: '#0dcaf0',
  },
  errorTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  errorStatusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  errorButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonSmall: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Error and retry styles
  errorBanner: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  retryButtonSmall: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  noDataSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  // Header styles
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
  // Card styles
  card: {
    height: 180,
    width: '100%',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  cardImage: {
    borderRadius: 15,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 6,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 12,
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
  },
  statusContainer: {
    marginTop: 5,
  },
  statusActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4,
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

export default Lawn;