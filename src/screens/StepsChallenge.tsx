import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions, // Import Dimensions for screen size
} from 'react-native';
import { Contract, BrowserProvider } from 'ethers'; // Re-imported for staking functionality
import {
  AppKitButton,
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit-ethers-react-native';
import { type Provider } from '@reown/appkit-scaffold-utils-react-native';
import contractData from '../services/contractData.json'; // Re-imported for staking functionality
import { ethers } from 'ethers'; // Re-imported for staking functionality
import AsyncStorage from '@react-native-async-storage/async-storage'; // Re-imported for staking functionality
import { useNavigation } from '@react-navigation/native';
import SetWalkingStepsTime from '../components/SetWalkingStepsTime';
// Assuming SetWalkingStepsTime is a component that might open a modal or navigate
// For this example, we'll just make the button trigger an alert.
// import SetWalkingStepsTime from '../components/StepSettings';

// Define your color palette
const Colors = {
  skyBlue: '#8ecae6ff',
  blueGreen: '#219ebcff',
  prussianBlue: '#023047ff',
  selectiveYellow: '#ffb703ff',
  utOrange: '#fb8500ff',
};

// Preset options for steps goals
const presetOptions = [5000, 10000, 15000, 'Custom'] as const;

// Preset options for committing days
const committingDaysOptions = [3, 5, 7] as const;

const { height: screenHeight } = Dimensions.get('window');

const StepsChallenge: React.FC = () => {
  // @ts-ignore
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const [selectedGoal, setSelectedGoal] = useState<number | 'Custom' | null>(null);
  const [customSteps, setCustomSteps] = useState('');
  const [selectedCommittingDays, setSelectedCommittingDays] = useState<number | null>(null); // New state for committing days
  const [balance, setBalance] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('0.01'); // Re-introduced stakeAmount state
  // @ts-ignore
  const navigation = useNavigation();
  const { isConnected } = useAppKitAccount();

  // Function to get the selected steps goal (kept for potential future use)
  const getStepsGoal = (): number | null => {
    if (selectedGoal === 'Custom') {
      const steps = parseInt(customSteps, 10);
      return isNaN(steps) || steps <= 0 ? null : steps;
    }
    return typeof selectedGoal === 'number' ? selectedGoal : null;
  };

  // Function to fetch the user's wallet balance
  const fetchBalance = async () => {
    try {
      if (isConnected && walletProvider) {
        // Using ethers for balance
        const ethersProvider = new BrowserProvider(walletProvider);
        const signer = await ethersProvider.getSigner();
        const rawBalance = await ethersProvider.getBalance(await signer.getAddress());
        setBalance(ethers.formatEther(rawBalance));
      }
    } catch (e) {
      console.error('Error fetching balance:', e);
    }
  };

  // Fetch balance on component mount and when wallet connection changes
  useEffect(() => {
    fetchBalance();
  }, [isConnected, walletProvider]);

  // Handler for the "Walking Reminder" button
  const handleWalkingReminder = () => {
    Alert.alert('Walking Reminder', 'This button would typically set up a notification or navigate to reminder settings.');
    // In a real app, you might navigate to a settings screen:
    // navigation.navigate('ReminderSettings');
  };

  // The handleSetGoal function is re-introduced for staking functionality
  const handleSetGoal = async () => {
    let numberOfDays = selectedCommittingDays; // TODO
    const steps = getStepsGoal();
    const parsedAmount = parseFloat(stakeAmount);

    if (!steps || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid steps goal and stake amount.');
      return;
    }

    try {
      // @ts-ignore
      const ethersProvider = new BrowserProvider(walletProvider);
      const signer = await ethersProvider.getSigner();
      const contract = new Contract(contractData.address, contractData.abi, signer);

      // IMPORTANT: In a real-world scenario, you would call a smart contract function
      // specifically designed for setting a steps goal (e.g., `setStepsGoal`).
      // The `startChallenge` call below is a placeholder from your original code.
      // You'd need to ensure your contract has a function like `setStepsGoal(uint256 _goal, address _user, uint256 _stakeAmount)`
      // or similar.
      const id = await contract.initiateChallenge.staticCall(numberOfDays, ethers.ZeroAddress, {
        value: ethers.parseEther(stakeAmount),
      }); // Placeholder, adapt to your steps goal contract function
      await AsyncStorage.setItem('stepsGoalId', id.toString()); // Changed key to reflect steps goal

      const privateKey = await AsyncStorage.getItem('privateKey');
      let appSigner;
      if (!privateKey) {
        appSigner = await ethers.Wallet.createRandom();
        await AsyncStorage.setItem('privateKey', appSigner.privateKey);
      } else {
        appSigner = new ethers.Wallet(privateKey);
      }

      const tx = await contract.initiateChallenge(numberOfDays, await appSigner.getAddress(), {
        value: ethers.parseEther(stakeAmount),
        type: 0,
      }); // Placeholder, adapt to your steps goal contract function

      Alert.alert('Goal Set!', `You committed to ${steps} steps with ${stakeAmount} FLOW!`);
    } catch (e) {
      console.error('Setting goal error:', e);
      Alert.alert('Error', 'Something went wrong while setting your goal.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      {!isConnected ? (
        <View style={styles.centeredWalletContainer}>
          <AppKitButton />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.walletHeader}>
            <TouchableOpacity
              style={styles.navTitleContainer}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('SignUp');
              }}
            >
              <Text style={styles.navTitle}>FlowFit</Text>
            </TouchableOpacity>

            <View style={styles.walletInfo}>
              <Text style={styles.balanceText}>
                {balance ? `${parseFloat(balance).toFixed(4)} FLOW` : '... FLOW'}
              </Text>
              <AppKitButton />
            </View>
          </View>

          <View style={styles.content}>
            {/* Walking Reminder Button */}
            <SetWalkingStepsTime />

            {/* Steps Goal Section */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Set Your Steps Goal</Text>
              <View style={styles.optionsContainer}>
                {presetOptions.map((opt, idx) => {
                  const isSelected = selectedGoal === opt;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.optionButton, isSelected && styles.optionSelected]}
                      onPress={() => setSelectedGoal(opt)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {typeof opt === 'number' ? `${opt} Steps` : 'Custom'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedGoal === 'Custom' && (
                <>
                  <Text style={styles.cardLabel}>Custom Steps Goal</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter number of steps"
                    keyboardType="numeric"
                    value={customSteps}
                    onChangeText={setCustomSteps}
                    placeholderTextColor={Colors.skyBlue + '80'}
                  />
                </>
              )}
            </View>

            {/* Committing Days Section */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Committing Days</Text>
              <View style={styles.optionsContainer}>
                {committingDaysOptions.map((days, idx) => {
                  const isSelected = selectedCommittingDays === days;
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.optionButton, isSelected && styles.optionSelected]}
                      onPress={() => setSelectedCommittingDays(days)}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {`${days} Days`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Re-introduced the "Amount to Stake" and "Set Goal" button */}
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Amount to Stake (FLOW)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 0.01"
                keyboardType="decimal-pad"
                value={stakeAmount}
                onChangeText={setStakeAmount}
                placeholderTextColor={Colors.skyBlue + '80'}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.stakeButton,
                (!getStepsGoal() || !stakeAmount) && styles.stakeButtonDisabled,
              ]}
              onPress={handleSetGoal}
              disabled={!getStepsGoal() || !stakeAmount}
            >
              <Text style={styles.stakeButtonText}>Set Goal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
};

// Styles using the defined color palette
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 20, // Adjusted paddingTop for iOS status bar
    paddingHorizontal: 15, // Slightly reduced padding for smaller screens
    backgroundColor: '#FFFFFF', // Changed background to white
  },
  centeredWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add some padding at the bottom of the scroll view
  },
  walletHeader: {
    alignItems: 'center',
    marginBottom: 20, // Slightly reduced margin
  },
  navTitleContainer: {
    marginBottom: 10, // Slightly reduced margin
  },
  navTitle: {
    fontSize: 22, // Slightly smaller font size
    fontWeight: '700',
    color: Colors.skyBlue,
    textAlign: 'center',
  },
  walletInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  balanceText: {
    fontSize: 15, // Slightly smaller font size
    color: Colors.skyBlue,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: 0, // Removed negative margin
  },
  title: {
    fontSize: 22, // Slightly smaller font size
    fontWeight: '700',
    marginBottom: 24, // Slightly reduced margin
    textAlign: 'center',
    color: Colors.skyBlue,
  },
  actionButton: {
    backgroundColor: Colors.utOrange,
    paddingVertical: 14, // Slightly reduced padding
    borderRadius: 10, // Slightly smaller border radius
    alignItems: 'center',
    marginBottom: 20, // Margin below the button
  },
  actionButtonText: {
    color: Colors.prussianBlue,
    fontSize: 17, // Slightly smaller font size
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.blueGreen,
    borderRadius: 10, // Slightly smaller border radius
    padding: 14, // Slightly reduced padding
    marginBottom: 15, // Slightly reduced margin
    elevation: 3,
    shadowColor: Colors.prussianBlue,
    shadowOpacity: 0.2,
    shadowRadius: 6, // Slightly reduced shadow radius
    shadowOffset: { width: 0, height: 2 },
  },
  cardLabel: {
    fontSize: 15, // Slightly smaller font size
    fontWeight: '600',
    marginBottom: 10, // Slightly reduced margin
    color: Colors.skyBlue,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Changed to space-between for better distribution
    flexWrap: 'wrap', // Allow wrapping if options don't fit on one line
    marginBottom: 10, // Slightly reduced margin
  },
  optionButton: {
    paddingVertical: 8, // Slightly reduced padding
    paddingHorizontal: 12, // Slightly reduced padding
    borderRadius: 6, // Slightly smaller border radius
    backgroundColor: Colors.prussianBlue,
    minWidth: '30%', // Ensure buttons have a minimum width to distribute well
    alignItems: 'center',
    marginVertical: 4, // Add vertical margin for wrapped items
  },
  optionSelected: {
    backgroundColor: Colors.selectiveYellow,
  },
  optionText: {
    fontSize: 14, // Slightly smaller font size
    color: Colors.skyBlue,
  },
  optionTextSelected: {
    color: Colors.prussianBlue,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.skyBlue,
    borderRadius: 6, // Slightly smaller border radius
    paddingHorizontal: 10, // Slightly reduced padding
    paddingVertical: 8, // Slightly reduced padding
    fontSize: 15, // Slightly smaller font size
    backgroundColor: Colors.prussianBlue,
    color: Colors.skyBlue,
  },
  // Re-introduced stakeButton and stakeButtonDisabled styles
  stakeButton: {
    backgroundColor: Colors.utOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  stakeButtonDisabled: {
    backgroundColor: Colors.selectiveYellow,
  },
  stakeButtonText: {
    color: Colors.prussianBlue,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StepsChallenge;
