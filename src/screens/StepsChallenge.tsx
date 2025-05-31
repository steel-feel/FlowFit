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
} from 'react-native';
import { Contract, BrowserProvider } from 'ethers';
import {
  AppKitButton,
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit-ethers-react-native';
import { type Provider } from '@reown/appkit-scaffold-utils-react-native';
import contractData from '../services/contractData.json'; // Assuming this has your steps goal contract
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import SetWalkingStepsTime from '../components/StepSettings'

// Define your color palette
const Colors = {
  skyBlue: '#8ecae6ff',
  blueGreen: '#219ebcff',
  prussianBlue: '#023047ff',
  selectiveYellow: '#ffb703ff',
  utOrange: '#fb8500ff',
};

// Preset options for steps goals
const presetOptions = [5000, 10000, 15000, 'Custom'] as const; // Changed to steps goals

const StepsChallenge: React.FC = () => {
  // @ts-ignore
  const { walletProvider } = useAppKitProvider<Provider>('eip155');
  const [selectedGoal, setSelectedGoal] = useState<number | 'Custom' | null>(null); // Renamed state
  const [customSteps, setCustomSteps] = useState(''); // Renamed state
  const [balance, setBalance] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('0.01'); // Amount to stake for the goal
  // @ts-ignore
  const navigation = useNavigation();
  const { isConnected } = useAppKitAccount();

  // Function to get the selected steps goal
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

  // Handler for setting the steps goal and staking
  const handleSetGoal = async () => {
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
      const id = await contract.startChallenge.staticCall(steps, ethers.ZeroAddress, {
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

      const tx = await contract.startChallenge(steps, await appSigner.getAddress(), {
        value: ethers.parseEther(stakeAmount),
        type: 0,
      }); // Placeholder, adapt to your steps goal contract function

      Alert.alert('Goal Set!', `You committed to ${steps} steps with ${stakeAmount} WND!`);
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
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.walletHeader}>
            <TouchableOpacity
              style={styles.navTitleContainer}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('Onboarding');
              }}
            >
              <Text style={styles.navTitle}>FlowFit</Text>
            </TouchableOpacity>

            <View style={styles.walletInfo}>
              <Text style={styles.balanceText}>
                {balance ? `${parseFloat(balance).toFixed(4)} WND` : '... WND'}
              </Text>
              <AppKitButton />
            </View>
          </View>

          {/* This component remains as per original request */}
          <SetWalkingStepsTime />

          <View style={styles.content}>
            <Text style={styles.title}>Set Your Steps Goal</Text>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Select Daily Goal</Text>
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
                    placeholderTextColor={Colors.skyBlue + '80'} // Added placeholder color
                  />
                </>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Amount to Stake (WND)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 0.01"
                keyboardType="decimal-pad"
                value={stakeAmount}
                onChangeText={setStakeAmount}
                placeholderTextColor={Colors.skyBlue + '80'} // Added placeholder color
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
    paddingTop: 100,
    paddingHorizontal: 20,
    backgroundColor: Colors.prussianBlue, // Using a darker background for contrast
  },
  centeredWalletContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  navTitleContainer: {
    marginBottom: 12,
  },
  navTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.skyBlue, // Using skyBlue for the title
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
    fontSize: 16,
    color: Colors.skyBlue, // Balance text in skyBlue
    fontWeight: '500',
  },
  content: {
    flex: 1,
    marginTop: -30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 28,
    textAlign: 'center',
    color: Colors.skyBlue, // Title in skyBlue
  },
  card: {
    backgroundColor: Colors.blueGreen, // Cards in blueGreen
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: Colors.prussianBlue, // Shadow from prussianBlue
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.skyBlue, // Labels in skyBlue
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.prussianBlue, // Option buttons in prussianBlue
  },
  optionSelected: {
    backgroundColor: Colors.selectiveYellow, // Selected option in selectiveYellow
  },
  optionText: {
    fontSize: 15,
    color: Colors.skyBlue, // Option text in skyBlue
  },
  optionTextSelected: {
    color: Colors.prussianBlue, // Selected option text in prussianBlue
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.skyBlue, // Input border in skyBlue
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: Colors.prussianBlue, // Input background in prussianBlue
    color: Colors.skyBlue, // Input text color in skyBlue
  },
  stakeButton: {
    backgroundColor: Colors.utOrange, // Stake button in utOrange
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  stakeButtonDisabled: {
    backgroundColor: Colors.selectiveYellow, // Disabled button in selectiveYellow
  },
  stakeButtonText: {
    color: Colors.prussianBlue, // Button text in prussianBlue
    fontSize: 18,
    fontWeight: '600',
  },
});

export default StepsChallenge;
