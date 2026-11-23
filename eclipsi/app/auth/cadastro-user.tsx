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

export default function CadastroUserScreen() {
  const router = useRouter();
  // Estados para capturar os dados do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  // Lógica de submissão baseada no seu script.js / api.js
  const handleRegister = async () => {
    setFeedback(null);
    if (!name.trim() || !email.trim() || !password) {
      setFeedback({ text: "Preencha nome, e-mail e senha.", type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback({ text: "Informe um e-mail válido.", type: "error" });
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length !== 10 && phoneDigits.length !== 11) {
      setFeedback({ text: "Telefone deve conter 10 ou 11 dígitos.", type: "error" });
      return;
    }
    if (!gender) {
      setFeedback({ text: "Selecione uma opção de gênero.", type: "error" });
      return;
    }
    if (password !== confirmPassword) {
      setFeedback({ text: "As senhas não coincidem.", type: "error" });
      return;
    }
    setLoading(true);

    const payload = {
      nome: name,
      email: email,
      telefone: phoneDigits || null,
      idade: age ? Number(age) : null,
      genero: gender,
      senha: password,
    };

    try {
      const data = await api<{ success?: boolean; message?: string; token?: string; access_token?: string }>(
        "/api/v1/auth/register/user",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      if (data.success !== false) {
        const token = data.token ?? data.access_token;
        if (token) await setAuthToken(token);
        setFeedback({ text: data.message || "Cadastro realizado com sucesso!", type: "success" });
        router.replace("/auth/login");
      } else {
        setFeedback({ text: data.message || "Nao foi possivel realizar o cadastro.", type: "error" });
      }
    } catch (error) {
      setFeedback({
        text: error instanceof ApiError ? error.message : "Ocorreu um erro ao conectar ao servidor.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.containerMain}>
      {/* Fundos decorativos */}
      <View pointerEvents="none" style={styles.backgroundTop} />
      <View pointerEvents="none" style={styles.backgroundBottom} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
      >
        <View style={styles.container}>
          {/* Logo e Título */}
          <View style={styles.logoTitle}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Cadastro</Text>
          </View>

          {/* Formulário */}
          <View style={styles.register}>
            <View style={styles.registerForm}>
              {/* Nome */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Coloque seu nome"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* E-mail */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Coloque seu email"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Telefone */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Telefone / WhatsApp (DD + número)"
                  placeholderTextColor="#64748B"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(value) => setPhone(formatPhone(value))}
                  maxLength={15}
                />
              </View>

              {/* Idade e Gênero (Lado a lado) */}
              <View style={styles.formRow}>
                <View style={[styles.sentenceLine, { flex: 1 }]}>
                  <TextInput
                    style={styles.registerInput}
                    placeholder="Idade"
                    placeholderTextColor="#64748B"
                    keyboardType="numeric"
                    maxLength={3}
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
                <View style={[styles.sentenceLine, { flex: 1 }]}>
                  <View style={styles.optionGroup}>
                    {["Feminino", "Masculino", "Outro", "Prefiro não informar"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.optionChip, gender === option && styles.optionChipActive]}
                        onPress={() => setGender(option)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.optionChipText, gender === option && styles.optionChipTextActive]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Senha */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Coloque sua senha"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Confirmação de Senha */}
              <View style={styles.sentenceLine}>
                <TextInput
                  style={styles.registerInput}
                  placeholder="Confirme sua senha"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              {/* Botões e Links */}
              <View style={styles.btnLine}>
                {feedback ? (
                  <Text
                    accessibilityRole="alert"
                    style={[styles.feedback, feedback.type === "success" ? styles.feedbackSuccess : styles.feedbackError]}
                  >
                    {feedback.text}
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={styles.registerBtn}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingRow}>
                      <ActivityIndicator color="#1d0027" />
                      <Text style={styles.registerBtnText}>Cadastrando...</Text>
                    </View>
                  ) : (
                    <Text style={styles.registerBtnText}>Cadastrar-se!</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => router.back()}
                >
                  <Text style={styles.backBtnText}>Voltar</Text>
                </TouchableOpacity>

                <Text style={styles.registerP}>
                  Já fez um cadastro?{" "}
                  <Text
                    style={styles.registerLink}
                    onPress={() => router.replace("/auth/login")}
                  >
                    Clique aqui!
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
  containerMain: {
    flex: 1,
    minHeight: "100%",
    backgroundColor: "#322c8e",
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
    height: "80%",
    backgroundColor: "#322c8e",
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    zIndex: 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    minHeight: "100%",
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 48,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
  container: {
    position: "relative",
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "90%",
    maxWidth: 500,
    gap: 20,
  },
  logoTitle: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 8,
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  title: {
    color: "white",
    fontSize: 28,
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
    gap: 18,
    width: "100%",
  },
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  optionGroup: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  optionChip: {
    minHeight: 36,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  optionChipActive: {
    backgroundColor: "#322c8e",
    borderColor: "#322c8e",
  },
  optionChipText: {
    color: "#0F172A",
    fontSize: 12,
  },
  optionChipTextActive: {
    color: "#FFFFFF",
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
    gap: 12,
    width: "100%",
    marginTop: 10,
  },
  registerInput: {
    padding: 12,
    width: "100%",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: 14,
  },
  registerBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    width: "100%",
    borderBottomWidth: 5,
    borderBottomColor: "#7500a8",
    borderRadius: 15,
    backgroundColor: "#d196eb",
  },
  registerBtnText: {
    color: "#1d0027",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: "100%",
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
  registerP: {
    color: "#334155",
    fontSize: 14,
    textAlign: "center",
  },
  registerLink: {
    color: "rgb(0, 255, 234)",
    textDecorationLine: "underline",
  },
  feedback: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  feedbackError: {
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
  },
  feedbackSuccess: {
    color: "#166534",
    backgroundColor: "#DCFCE7",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
