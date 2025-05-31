import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import { useNavigation } from '@react-navigation/native';
// @ts-ignore
import RobotoRegular from '../assets/fonts/RobotoRegular.ttf';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StepSample } from '../types/Step';


interface Props {
  data: StepSample[];
}

const StepsChart: React.FC<Props> = ({ data }) => {
  const [goalSteps, setGoalSteps] = useState<number>(10000); // Default to 10k steps
  const [todayStatus, setTodayStatus] = useState<'✅ On Track' | '❌ Missed' | null>(null);

  // @ts-ignore
  const navigation = useNavigation();

  useEffect(() => {
    const loadStepGoal = async () => {
      const stored = await AsyncStorage.getItem('step_goal');
      if (stored) {
        const goal = parseInt(stored, 10);
        setGoalSteps(goal);
      }

      // Evaluate today's goal status
      const today = new Date().toDateString();
      const todayData = data.find(
        (entry) => new Date(entry.date).toDateString() === today
      );

      if (todayData) {
        setTodayStatus(todayData.steps >= goalSteps ? '✅ On Track' : '❌ Missed');
      } else {
        setTodayStatus('❌ Missed');
      }
    };

    loadStepGoal();
  }, [data]);
  console.log({data});
  const chartData = data
    .map((entry) => ({
      x: new Date(entry.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      y: entry.steps,
    }))
    .slice(-10); // Last 10 days
console.log({chartData});

  const font = useFont(RobotoRegular, 12, (err) => {
    console.error('Font loading error:', err);
  });

  return (
    <View style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity>
          <Text style={styles.backButton}> </Text>
        </TouchableOpacity>
        <Text
          style={styles.navTitle}
          onPress={() => {
            // @ts-ignore
            navigation.navigate("SignUp");
          }}
        >
          Steps Summary
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📈 Step Trend (Last 10 Days)</Text>

        <Text style={styles.goalText}>Daily Step Goal: {goalSteps.toLocaleString()} steps</Text>
        <Text
          style={[
            styles.goalStatus,
            todayStatus === '✅ On Track' ? styles.statusAchieved : styles.statusMissed,
          ]}
        >
          Today's Goal: {todayStatus}
        </Text>

        {data.length === 0 ? (
          <Text style={styles.empty}>No step data available</Text>
        ) : (
          <View style={styles.chartContainer}>
            <CartesianChart
              data={chartData}
              xKey="x"
              yKeys={['y']}
              axisOptions={{ font }}
              domainPadding={{ left: 70, right: 70, top: 350 }}
            >
              {({ points, chartBounds }) => (
                <Bar
                  barWidth={15}
                  points={points.y}
                  chartBounds={chartBounds}
                  animate={{ type: 'spring', duration: 1000 }}
                  color="#4299E1"
                  roundedCorners={{ topLeft: 5, topRight: 5 }}
                />
              )}
            </CartesianChart>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {data
          .slice()
          .reverse()
          .map((entry, idx) => {
            const date = new Date(entry.date).toLocaleDateString();
            const status = entry.steps >= goalSteps ? '✅ Achieved' : '⚠️ Missed';
            return (
              <View style={styles.recordCard} key={`${date}-${idx}`}>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>{date}</Text>
                  <Text
                    style={[
                      styles.statusText,
                      status.includes('Achieved') ? styles.statusAchieved : styles.statusMissed,
                    ]}
                  >
                    {status}
                  </Text>
                </View>
                <Text style={styles.recordItem}>👣 {entry.steps} steps</Text>
              </View>
            );
          })}
      </ScrollView>
    </View>
  );
};


// ~~~~~~~~~ Styles
const Colors = {
    skyBlue: '#8ecae6ff',
    blueGreen: '#219ebcff',
    prussianBlue: '#023047ff',
    selectiveYellow: '#ffb703ff',
    utOrange: '#fb8500ff',
  };
  

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5A67D8',
  },
  backButton: {
    fontSize: 20,
    color: '#4A5568',
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
  chartContainer: {
    height: 320,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  goalStatus: {
    fontSize: 15,
    marginTop: 4,
    fontWeight: '600',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },


  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  //~~~~~~~~~
  statusAchieved: {
    color: Colors.selectiveYellow,
  },
  statusMissed: {
    color: Colors.utOrange,
  },
  recordLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: Colors.prussianBlue,
  },
  recordItem: {
    fontSize: 14,
    color: Colors.blueGreen,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.prussianBlue,
  },
  goalText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.blueGreen,
  },
  








});

export default StepsChart;
