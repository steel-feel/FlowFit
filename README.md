![FlowFit Cover Image](./banner.png) 

# 🚶 FlowFit

**Healthy Habit Builder App on the Flow Blockchain**

FlowFit is a React Native mobile app designed to help users develop and stick to healthy habits. It uses the **Flow blockchain** to securely track progress, offering **rewards** for consistent healthy behavior and **penalties** (slashing) for missed goals.

### Key Features

* **Habit Tracking**: Easily monitor and manage your daily habits.
* **Blockchain Integration**: All habit commitments is securely recorded on the Flow blockchain.
* **Motivation through Rewards/Slashing**: Stay motivated with a system that rewards you for maintaining good habits and penalizes you for falling behind.
* **User-Friendly Interface**: The app is intuitively designed for a smooth user experience.

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (version 14 or higher)
* [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
* [React Native CLI](https://reactnative.dev/docs/environment-setup)
* Android Studio or Xcode for mobile development

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/steel-feel/FlowFit.git
   cd FlowFit
   ```

2. **Install Dependencies**

   Using Yarn:

   ```bash
   yarn install
   ```

   Or using npm:

   ```bash
   npm install
   ```

3. 
   **Run on iOS**

   ```bash
    npx react-native run-ios
   ```

   > **Note**: Ensure that you have an emulator or physical device connected.

## Project Structure

* `src/`: Contains the main source code for the application.
* `android/`: Android-specific project files.
* `ios/`: iOS-specific project files.
* `__tests__/`: Contains test files for the application.
* `evm-contracts` : Contains solidity contracts for staking health commitments 

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.

2. Create a new branch:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. Make your changes and commit them:

   ```bash
   git commit -m "Add YourFeature"
   ```

4. Push to your fork:

   ```bash
   git push origin feature/YourFeature
   ```

5. Submit a pull request.

Please ensure your code adheres to the project's coding standards and passes all tests.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For questions or feedback, please open an issue on the [GitHub repository](https://github.com/steel-feel/FlowFit/issues).