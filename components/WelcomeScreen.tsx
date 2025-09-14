import { AuthModal } from "@/components/AuthModal";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

interface WelcomeScreenProps {
  showAuthModal: boolean;
  onCloseAuthModal: () => void;
}

export const WelcomeScreen = ({
  showAuthModal,
  onCloseAuthModal,
}: WelcomeScreenProps) => {
  return (
    <View className="flex-1 bg-[#121620]">
      <StatusBar style="light" />
      <AuthModal
        visible={showAuthModal}
        forceSignUp={false}
        allowClose={false}
        onClose={onCloseAuthModal}
      />
    </View>
  );
};
