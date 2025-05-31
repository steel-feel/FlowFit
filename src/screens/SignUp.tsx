import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../AppNavigator';
import { initHealthKit } from '../services/healthkit';
import notifee, { AuthorizationStatus } from '@notifee/react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

const SignUp: React.FC<Props> = ({ navigation }) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      const settings = await notifee.getNotificationSettings();
      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        setPermissionsGranted(true);
      }
    };
    checkPermissions();
  }, []);

  async function grantPermissions() {
    const { authorizationStatus } = await notifee.requestPermission();
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });
    await initHealthKit();

    if (authorizationStatus === AuthorizationStatus.AUTHORIZED) {
      setPermissionsGranted(true);
    } else {
      console.log('Permission denied');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}> Ahoj FlowFit 🚶</Text>
      <Text style={styles.subtitle}>
        Simple FLOW for staying FIT.{'\n'}
        💡 Track. 💰 Commit. 💤 Improve.{'\n\n'}
        Healthy habbits never been this rewarding !
      </Text>

      <TouchableOpacity style={styles.button} onPress={grantPermissions}>
        <Text style={styles.buttonText}>✍️ Grant Permissions</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('StepsChallenge')}
      >
        <Text style={styles.buttonText}>🏁 Start a Steps Challenge</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Home')}>
        <Text style={styles.buttonText}>📈 View Steps Stats</Text>
      </TouchableOpacity>

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
  button: {
    backgroundColor: '#5A67D8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
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
