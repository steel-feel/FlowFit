import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import { getStepsData } from '../services/healthkit';
import { StepSample } from '../types/Step';
import { Linking, Button } from 'react-native';
import StepsChart from '../components/StepsChart';

const Home: React.FC = () => {
  const [stepsData, setStepsData] = useState<StepSample[]>([])
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        let data = await getStepsData(start);
        if (data.length !== 0) {
          setStepsData(data); // For testing
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };
    fetchData();
  }, []);

  const openSettings = () => {
    Linking.openURL('app-settings:');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {stepsData.length > 0 && <StepsChart data={stepsData} />}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button title="Open Settings" onPress={openSettings} />
          </View>
        )}

        {!error && stepsData.length === 0 && (
          <Text style={styles.infoText}>
            No steps data available. Make sure 'Steps' is enabled for this app in the
            Health app.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

/// ~~~~~~~~~~~  Define your color palette
const Colors = {
  skyBlue: '#8ecae6ff',
  blueGreen: '#219ebcff',
  prussianBlue: '#023047ff',
  selectiveYellow: '#ffb703ff',
  utOrange: '#fb8500ff',
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.prussianBlue, // Example: title color
  },
  errorContainer: {
    marginVertical: 10,
    backgroundColor: Colors.selectiveYellow, // A soft background for errors/warnings
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: Colors.utOrange, // Using ut-orange for error text
    marginBottom: 8,
  },
  infoText: {
    fontStyle: 'italic',
    marginBottom: 16,
    color: Colors.blueGreen, // Using blue-green for info text
  },
  card: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: Colors.skyBlue, // Changed from '#f0f0f0' to sky-blue for card background
    borderRadius: 8,
  },
});
/// ~~~~~~~~~~~~~


export default Home;
