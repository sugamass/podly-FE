import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface AuthSubmitButtonProps {
  isSignUp: boolean;
  isLoading: boolean;
  onPress: () => void;
}

export const AuthSubmitButton = ({ isSignUp, isLoading, onPress }: AuthSubmitButtonProps) => (
  <TouchableOpacity
    className={`p-4 rounded-xl mb-4 mt-2 ${
      isLoading ? 'bg-[#6B7280]' : 'bg-[#4F7CFF]'
    }`}
    onPress={onPress}
    disabled={isLoading}
  >
    {isLoading ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text className="text-white text-center font-bold text-lg">
        {isSignUp ? 'アカウント作成' : 'ログイン'}
      </Text>
    )}
  </TouchableOpacity>
);