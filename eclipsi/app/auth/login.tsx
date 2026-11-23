import { useRouter } from "expo-router";
import { useState } from "react";
import { api, ApiError, setAuthToken } from "../../lib/api";
import {
    Alert,
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  // Estados para capturar os inputs do formulário
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Função auxiliar para validar o formato do e-mail
  const validarEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr);
  };

  // Lógica de submissão e autenticação adaptada do api.js e script.js
  const handleLogin = async () => {
    setFeedback("");
    const trimmedEmail = email.trim();

    if (!validarEmail(trimmedEmail)) {
      setFeedback("Por favor, insira um e-mail válido.");
      return;
    }

    if (!password) {
      setFeedback("Por favor, digite sua senha.");
      return;
    }
    setLoading(true);

    const payload = {
      email: trimmedEmail,
      senha: password,
    };

    try {
      const data = await api<{
        success?: boolean;
        message?: string;
        token?: string;
        access_token?: string;
        user?: { tipo?: string; role?: string };
      }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.success) {
        const token = data.token ?? data.access_token;
        if (!token) {
          throw new ApiError("O servidor nao retornou o token.", 401);
        }
        await setAuthToken(token);
        const session = await api<{
          success?: boolean;
          user?: { role?: string };
        }>("/api/me");
        const tipo = String(session.user?.role ?? data.user?.tipo ?? data.user?.role ?? "").toLowerCase();
        if (tipo.includes("admin")) router.replace("/profile/admin");
        else if (tipo.includes("med") || tipo.includes("doctor")) router.replace("/profile/medico");
        else router.replace("/profile/user");
      } else {
        setFeedback(data.message || "E-mail ou senha incorretos.");
      }
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Ocorreu um erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Fundo superior (cor clara) */}
      <View pointerEvents="none" style={styles.backgroundTop} />

      {/* Fundo inferior com curva (cor escura) */}
      <View pointerEvents="none" style={styles.backgroundBottom} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.container}>
        {/* Cabeçalho com Logo e Título */}
        <View style={styles.logoTitle}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>EcliPsi</Text>
          <Text style={styles.title}>Login</Text>
        </View>

        {/* Formulário de Login */}
        <View style={styles.register}>
          <View style={styles.registerForm}>
            <View style={styles.sentenceLine}>
              <TextInput
                style={styles.registerInput}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.sentenceLine}>
              <TextInput
                style={styles.registerInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#64748B"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.btnLine}>
              {feedback ? (
                <Text accessibilityRole="alert" style={styles.feedback}>{feedback}</Text>
              ) : null}
              <TouchableOpacity
                style={styles.registerBtn}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#1d0027" />
                    <Text style={styles.btnTextBold}>Entrando...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnTextBold}>Entrar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.backBtnText}>Voltar</Text>
              </TouchableOpacity>

              <Text style={styles.registerP}>
                Ainda não tem conta?{" "}
                <Text
                  style={styles.registerLink}
                  onPress={() => router.push("/auth/cadastro")}
                >
                  Cadastre-se
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#322c8e",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 24,
    paddingBottom: 48,
  },
  backgroundTop: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "#ffeec2",
    zIndex: 0,
  },
  backgroundBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "70%",
    backgroundColor: "#322c8e",
    borderTopLeftRadius: 150, // Adaptação nativa da curva CSS
    borderTopRightRadius: 150,
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    maxWidth: 500,
    width: "90%",
    gap: 25,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    shadowColor: "#0F172A",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 10,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  brandTitle: {
    color: "#322c8e",
    fontSize: 32,
    fontWeight: "900",
  },
  title: {
    color: "#0F172A",
    fontSize: 30,
    fontWeight: "bold",
  },
  register: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  registerForm: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    gap: 25,
    width: "100%",
  },
  sentenceLine: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  btnLine: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  registerInput: {
    padding: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 15,
    backgroundColor: "white",
    fontSize: 16,
    color: "#0F172A",
  },
  registerBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 0,
    borderBottomWidth: 5,
    borderBottomColor: "#7500a8",
    borderRadius: 15,
    backgroundColor: "#d196eb",
    width: "100%",
  },
  btnTextBold: {
    fontWeight: "bold",
    color: "#1d0027",
    fontSize: 16,
  },
  feedback: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    textAlign: "center",
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    fontWeight: "600",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  registerP: {
    color: "#334155",
    marginTop: 5,
  },
  registerLink: {
    color: "rgb(0, 255, 234)",
    fontWeight: "bold",
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    borderWidth: 0,
    borderBottomWidth: 5,
    borderBottomColor: "#4a4a4a",
    borderRadius: 15,
    backgroundColor: "#a8a8a8",
  },
  backBtnText: {
    color: "#1d0027",
    fontWeight: "bold",
    fontSize: 16,
  },
});
