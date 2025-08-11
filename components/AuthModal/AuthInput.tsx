import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
  showUsernameStatus?: boolean;
  usernameCheckLoading?: boolean;
  usernameAvailable?: boolean | null;
}

export const AuthInput = memo(({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  placeholder,
  showUsernameStatus = false,
  usernameCheckLoading = false,
  usernameAvailable = null,
}: AuthInputProps) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={[
          styles.textInput,
          error && styles.textInputError,
          showUsernameStatus && value.length >= 3 && usernameAvailable === true && styles.textInputSuccess,
          showUsernameStatus && value.length >= 3 && usernameAvailable === false && styles.textInputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.inactive}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
      {showUsernameStatus && value.length >= 3 && (
        <View style={styles.usernameStatus}>
          {usernameCheckLoading ? (
            <ActivityIndicator size="small" color={Colors.dark.primary} />
          ) : usernameAvailable === true ? (
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
          ) : usernameAvailable === false ? (
            <Ionicons name="close-circle" size={20} color="#EF4444" />
          ) : null}
        </View>
      )}
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
    {showUsernameStatus && value.length >= 3 && usernameAvailable === true && (
      <Text style={styles.successText}>このユーザー名は利用可能です</Text>
    )}
  </View>
));

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: Colors.dark.card,
    color: Colors.dark.text,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    fontSize: 16,
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  textInputSuccess: {
    borderColor: '#10B981',
  },
  usernameStatus: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  successText: {
    color: '#10B981',
    fontSize: 14,
    marginTop: 4,
  },
});