import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
// Assuming RootStackParamList and services are defined in your project
// This import will only resolve if 'AppNavigator' exists in your project.
import { RootStackParamList } from '../AppNavigator';
// This import will only resolve if 'healthkit.ts' exists in your '../services/' directory.
import { initHealthKit } from '../services/healthkit';
// This external library must be installed in your React Native project: npm install @notifee/react-native
import notifee, { AuthorizationStatus } from '@notifee/react-native';

// Get screen width for responsive card sizing
const { width } = Dimensions.get('window');
const cardMargin = 40;
const numColumns = 1; // Number of columns in the grid
const cardWidth = (width - (numColumns + 1) * cardMargin) / numColumns; // Calculate card width dynamically

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUp: React.FC<Props> = ({ navigation }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    // Check notification permissions on component mount
    const checkPermissions = async () => {
      try {
        // notifee.getNotificationSettings() requires @notifee/react-native to be installed.
        const settings = await notifee.getNotificationSettings();
        if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
          setPermissionsGranted(true);
        }
      } catch (error) {
        console.error("Failed to get notification settings:", error);
      }
    };
    checkPermissions();
  }, []);

  // Function to request and grant necessary permissions (Notifications and HealthKit)
  async function grantPermissions() {
    try {
      // Request notification permissions, requires @notifee/react-native to be installed.
      const { authorizationStatus } = await notifee.requestPermission();

      // Create a default notification channel (important for Android, good practice for iOS)
      // Requires @notifee/react-native to be installed.
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      // Initialize HealthKit permissions, requires '../services/healthkit' to exist and export initHealthKit.
      await initHealthKit(); // This function should handle HealthKit specific permission requests

      // Update state based on notification authorization status
      if (authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        setPermissionsGranted(true);
      } else {
        console.log('Notification permission denied');
        // Optionally, show a message to the user that permissions are needed
      }
    } catch (error) {
      console.error("Error granting permissions:", error);
      // Handle errors during permission requests
    }
  }

  // Data for the feature cards, including navigation actions
  const featureCards = [
    {
      id: 'stepsChallenge',
      title: '🏁 My Steps Challenge',
      description: 'Get started with fitness flow.',
      action: () => navigation.replace('StepsChallenge'),
    },
    {
      id: 'viewStepsStats',
      title: '📈 View Steps Stats',
      description: 'Check your steps graph, is it trending ?',
      action: () => navigation.replace('Home'),
    },
    // You can add more feature cards here
    // {
    //   id: 'rewards',
    //   title: '🎁 View Rewards',
    //   description: 'Check your earned rewards and achievements.',
    //   action: () => console.log('Navigate to Rewards'),
    // },
    // {
    //   id: 'profile',
    //   title: '👤 My Profile',
    //   description: 'Manage your personal details and app preferences.',
    //   action: () => console.log('Navigate to Profile'),
    // },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Section */}
      <Text style={styles.title}> Ahoj FlowFit 🚶</Text>
      <Text style={styles.subtitle}>
        Simple FLOW for staying FIT.{'\n\n'}
        Healthy habits never been this rewarding !
      </Text>

      {/* Conditional Rendering based on permissionsGranted */}
      {permissionsGranted ? (
        // Grid layout for feature cards
        <View style={styles.gridContainer}>
          {featureCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              onPress={card.action}
              activeOpacity={0.7} // Provides visual feedback on touch
            >
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // Single card for granting permissions
        <TouchableOpacity style={styles.grantPermissionsButton} onPress={grantPermissions}>
          <Text style={styles.grantPermissionsButtonText}>✍️ Grant Permissions</Text>
          <Text style={styles.grantPermissionsSubtitle}>
            Unlock all features by granting necessary permissions.
          </Text>
        </TouchableOpacity>
      )}

      {/* Footer Note */}
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>💪 Healthy Flow , Stay Fit!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center content horizontally
    paddingHorizontal: 24,
    backgroundColor: '#F9F9F9',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#2D3748',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 26,
  },
  // Styles for the "Grant Permissions" button when it's the only visible element
  grantPermissionsButton: {
    backgroundColor: '#5A67D8',
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%', // Occupy a good portion of the screen width
    maxWidth: 400, // Max width for larger screens
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  grantPermissionsButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  grantPermissionsSubtitle: {
    color: '#E0E7FF',
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  // Grid container for feature cards
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center cards in the grid
    marginHorizontal: -cardMargin, // Compensate for card margins
    marginBottom: 20,
  },
  // Individual card style within the grid
  card: {
    backgroundColor: '#FFFFFF',
    width: cardWidth, // Use calculated width
    margin: cardMargin,
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly', // Distribute content vertically
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 180, // Ensure cards have a consistent minimum height
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 1,
  },
  cardButtonContainer: {
    backgroundColor: '#667EEA',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 'auto', // Push button to bottom of card
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  footerNote: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#718096',
    fontStyle: 'italic',
  },
});

export default SignUp;
