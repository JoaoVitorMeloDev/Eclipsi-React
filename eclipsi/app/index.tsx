import { AcademicDemoNotice } from '../components/AcademicDemoNotice';
import { withRouteGuard } from '../components/RouteGuard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { palette } from '../lib/palette';

function WelcomeScreen() {
  const router = useRouter();
  const handleLogin = () => router.push('/auth/login');
  const handleRegister = () => router.push('/auth/cadastro');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.brand}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="EcliPsi"
        />
      </View>

      <View style={styles.panel}>
        <View style={styles.actions}>
          <Text style={styles.title}>Bem-vindo</Text>
          <PrimaryButton
            style={styles.button}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Fazer login</Text>
          </PrimaryButton>

          <PrimaryButton
            style={styles.button}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Fazer um cadastro</Text>
          </PrimaryButton>
          <AcademicDemoNotice />
        </View>
      </View>
    </ScrollView>
  );
}

export default withRouteGuard(WelcomeScreen);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.cream,
  },
  content: {
    flexGrow: 1,
  },
  brand: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  panel: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.indigo,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  actions: {
    width: '100%',
    maxWidth: 440,
    gap: 14,
  },
  title: {
    color: palette.cream,
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderBottomWidth: 4,
    borderBottomColor: palette.wine,
    borderRadius: 14,
    backgroundColor: palette.magenta,
  },
  buttonText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: palette.white,
    textAlign: 'center',
  },
});
