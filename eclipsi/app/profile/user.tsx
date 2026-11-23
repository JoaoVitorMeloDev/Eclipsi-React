import React, { useEffect, useState } from 'react';
import { api, ApiError, clearAuthSession, setProfileAvatar, subscribeProfileAvatar } from '../../lib/api';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const avatar = require('../../assets/images/avatar.png');

export default function UserScreen() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('14:00');
  const [bookingFeedback, setBookingFeedback] = useState('');
  const [profileFeedback, setProfileFeedback] = useState('');
  // Estados para navegação entre abas ('home', 'consultas', 'perfil', 'configuracoes')
  const [activeTab, setActiveTab] = useState<'home' | 'consultas' | 'perfil' | 'configuracoes'>('home');

  // Estados dos Modais
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [ratingDoctorName, setRatingDoctorName] = useState('');
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingAppointmentId, setRatingAppointmentId] = useState<number | null>(null);

  // Estados do Perfil e Configurações
  const [profileName, setProfileName] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  // Dados Mockados para Consultas e Médicos
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAvatar = subscribeProfileAvatar(setProfilePhoto);
    const load = async () => {
      try {
        const [profile, doctors, appointments] = await Promise.all([
          api<{ success: boolean; profile: any }>('/api/v1/profile/me'),
          api<{ success: boolean; doctors: any[] }>('/api/v1/doctors'),
          api<{ success: boolean; appointments: any[] }>('/api/v1/appointments'),
        ]);
        setProfileName(profile.profile?.nome || '');
        setProfileBio(profile.profile?.descricao || '');
        setUserEmail(profile.profile?.email || '');
        setUserPhone(profile.profile?.telefone || '');
        setProfilePhoto(profile.profile?.foto || null);
        setProfileAvatar(profile.profile?.foto || null);
        setDoctorsList(doctors.doctors.map((doctor) => ({
          id: doctor.id,
          name: doctor.nome,
          profession: `${doctor.especialidade || 'Profissional'}${doctor.registro ? ` - ${doctor.registro}` : ''}`,
          rating: 'Disponível',
          price: `R$ ${Number(doctor.valor_hora || 0).toFixed(2)} / hora`,
          img: avatar,
          foto: doctor.foto,
          registro: doctor.registro,
          uf: doctor.uf,
          valorHora: doctor.valor_hora,
          bio: doctor.descricao || 'Profissional em saúde mental.',
        })));
        setUpcomingAppointments(appointments.appointments
          .filter((item) => item.status === 'agendada')
          .map((item) => ({
            id: item.id,
            doctor: item.medico_nome,
            specialty: item.especialidade,
            date: new Date(item.data_hora).toLocaleString('pt-BR'),
            price: `R$ ${Number(item.valor).toFixed(2)}`,
            img: avatar,
            status: item.status,
            annotation: item.anotacoes,
          })));
        setCompletedAppointments(appointments.appointments
          .filter((item) => ['concluida', 'realizada'].includes(item.status))
          .map((item) => ({
            id: item.id,
            doctor: item.medico_nome,
            specialty: item.especialidade,
            date: new Date(item.data_hora).toLocaleString('pt-BR'),
            price: `R$ ${Number(item.valor).toFixed(2)}`,
            img: avatar,
            feedback: item.anotacoes,
          })));
      } catch (error) {
        if (error instanceof ApiError) Alert.alert('Erro', error.message);
      } finally {
        setLoading(false);
      }
    };
    load();
    return unsubscribeAvatar;
  }, []);

  const reloadAppointments = async () => {
    const result = await api<{ success: boolean; appointments: any[] }>('/api/v1/appointments');
    setUpcomingAppointments(result.appointments
      .filter((item) => item.status === 'agendada')
      .map((item) => ({
        id: item.id,
        doctor: item.medico_nome,
        specialty: item.especialidade,
        date: new Date(item.data_hora).toLocaleString('pt-BR'),
        price: `R$ ${Number(item.valor).toFixed(2)}`,
        img: avatar,
        status: item.status,
        annotation: item.anotacoes,
      })));
  };

  const chooseProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setProfileFeedback('Permissão para acessar a galeria foi negada.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setProfilePhoto(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
      setProfileAvatar(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : asset.uri);
      setProfileFeedback('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header Superior Fixo */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.burgerBtn} onPress={() => setDrawerOpen(true)}>
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
            <View style={styles.burgerLine} />
          </TouchableOpacity>
          <Image source={require('../../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.logo}>EcliPsi</Text>
        </View>
        <View style={styles.headerRight}>
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#fe9e8e"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Image source={profilePhoto ? { uri: profilePhoto } : avatar} style={styles.profileImg} />
        </View>
      </View>

      {/* Conteúdo Dinâmico Baseado na Aba Ativa */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7500a8" />
            <Text style={styles.loadingText}>Carregando dados...</Text>
          </View>
        ) : (
          <>
        {activeTab === 'home' && (
          <View>
            <Text style={styles.pageTitle}>Página Inicial</Text>
            <Text style={styles.pageSubtitle}>Acompanhe suas consultas agendadas e seu histórico:</Text>

            {/* Próximas Consultas */}
            <View style={styles.homeSection}>
              <Text style={styles.sectionTitle}>
                <FontAwesome5 name="calendar-check" size={16} color="#7500a8" /> Próximas Consultas
              </Text>
              {upcomingAppointments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.appointmentCard}
                  onPress={() => {
                    setSelectedAppointment(item);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Image source={item.img} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDoctorName}>{item.doctor}</Text>
                    <Text style={styles.specialty}>{item.specialty}</Text>
                    <Text style={styles.cardDate}>🗓 {item.date}</Text>
                    <Text style={styles.cardPrice}>💰 {item.price}</Text>
                    <View style={styles.upcomingBadge}>
                      <Text style={styles.upcomingBadgeText}>{item.status}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>Ver detalhes</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sectionDivider} />

            {/* Consultas Realizadas */}
            <View style={styles.homeSection}>
              <Text style={styles.sectionTitle}>
                <FontAwesome5 name="clock" size={16} color="#7500a8" /> Consultas Realizadas
              </Text>
              {completedAppointments.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.appointmentCard}
                  onPress={() => {
                    setSelectedAppointment(item);
                    setDetailsModalVisible(true);
                  }}
                >
                  <Image source={item.img} style={styles.cardImg} />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardDoctorName}>{item.doctor}</Text>
                    <Text style={styles.specialty}>{item.specialty}</Text>
                    <Text style={styles.cardDate}>🗓 {item.date}</Text>
                    <Text style={styles.cardPrice}>💰 {item.price}</Text>
                    <Text style={styles.cardPreview} numberOfLines={2}>{item.feedback}</Text>
                    <View style={styles.cardActions}>
                      <TouchableOpacity style={styles.viewBtn}>
                        <Text style={styles.viewBtnText}>Ver detalhes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rateBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          setRatingDoctorName(item.doctor);
                          setRatingAppointmentId(Number(item.id));
                          setRatingModalVisible(true);
                        }}
                      >
                        <Text style={styles.rateBtnText}>⭐ Avaliar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'consultas' && (
          <View>
            <Text style={styles.pageTitle}>Buscar Consultas</Text>
            <Text style={styles.pageSubtitle}>Encontre o profissional ideal para o seu acompanhamento:</Text>
            {doctorsList
              .filter((doc) => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) return true;
                return `${doc.name} ${doc.profession} ${doc.bio}`.toLowerCase().includes(query);
              })
              .map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.doctorCard}
                onPress={() => {
                  setSelectedDoctor(doc);
                  setBookingFeedback('');
                }}
              >
                <Image source={doc.img} style={styles.cardImg} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardDoctorName}>{doc.name}</Text>
                  <Text style={styles.specialty}>{doc.profession}</Text>
                  <Text style={styles.cardRating}>⭐ {doc.rating}</Text>
                  <Text style={styles.cardPrice}>💰 {doc.price}</Text>
                  <Text style={styles.cardPreview} numberOfLines={2}>{doc.bio}</Text>
                  <TouchableOpacity
                    style={styles.viewDoctorBtn}
                    onPress={async () => {
                      const date = new Date();
                      date.setDate(date.getDate() + 1);
                      date.setHours(14, 0, 0, 0);
                      try {
                        await api('/api/v1/appointments', {
                          method: 'POST',
                          body: JSON.stringify({
                            medico_id: Number(doc.id),
                            data_hora: date.toISOString(),
                            valor: doc.valorHora,
                            status: 'agendada',
                          }),
                        });
                        await reloadAppointments();
                        setActiveTab('consultas');
                        setBookingFeedback('Consulta agendada com sucesso!');
                        Alert.alert('Consulta agendada!', date.toLocaleString('pt-BR'));
                      } catch (error) {
                        Alert.alert('Erro', error instanceof ApiError ? error.message : 'Nao foi possivel agendar.');
                      }
                    }}
                  >
                    <Text style={styles.viewDoctorBtnText}>Agendar amanhã às 14h</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'perfil' && (
          <View>
            <View style={styles.profileHeaderContainer}>
              <Text style={styles.pageTitle}>Meu Perfil</Text>
              <TouchableOpacity
                style={styles.settingsNavBtn}
                onPress={() => setActiveTab('configuracoes')}
              >
                <FontAwesome5 name="cog" size={14} color="#7500a8" />
                <Text style={styles.settingsNavBtnText}>Configurações</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsGroup}>
              <View style={styles.profileAvatarWrapper}>
                <Image source={profilePhoto ? { uri: profilePhoto } : avatar} style={styles.profileAvatarLg} />
                <TouchableOpacity style={styles.avatarUploadBtn} onPress={chooseProfilePhoto}>
                  <Text style={styles.avatarUploadBtnText}>Alterar Foto</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={styles.input}
                  value={profileName}
                  onChangeText={setProfileName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição de si mesmo (Bio)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={profileBio}
                  onChangeText={setProfileBio}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {profileFeedback ? (
                <Text accessibilityRole="alert" style={styles.profileFeedback}>{profileFeedback}</Text>
              ) : null}

              <TouchableOpacity
                style={styles.saveSettingsBtn}
                onPress={async () => {
                  try {
                    await api('/api/v1/profile/me', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        nome: profileName,
                        descricao: profileBio,
                        ...(profilePhoto ? { foto: profilePhoto } : {}),
                      }),
                    });
                    setProfileFeedback('Perfil salvo com sucesso.');
                    Alert.alert('Perfil salvo com sucesso!');
                  } catch (error) {
                    setProfileFeedback(error instanceof ApiError ? error.message : 'Nao foi possivel salvar.');
                  }
                }}
              >
                <Text style={styles.saveSettingsBtnText}>Salvar Perfil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'configuracoes' && (
          <View>
            <View style={styles.settingsHeaderContainer}>
              <TouchableOpacity style={styles.btnBack} onPress={() => setActiveTab('perfil')}>
                <FontAwesome5 name="arrow-left" size={16} color="#7500a8" />
                <Text style={styles.btnBackText}>Voltar</Text>
              </TouchableOpacity>
              <Text style={styles.pageTitle}>Configurações</Text>
            </View>

            <View style={styles.settingsGroup}>
              <Text style={styles.groupTitle}>Informações de Acesso</Text>
              <View style={styles.formGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput style={styles.input} value={userEmail} onChangeText={setUserEmail} />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Telefone</Text>
                <TextInput style={styles.input} value={userPhone} onChangeText={setUserPhone} />
              </View>

              <TouchableOpacity
                style={styles.saveSettingsBtn}
                onPress={async () => {
                  try {
                    await api('/api/v1/profile/me', {
                      method: 'PATCH',
                      body: JSON.stringify({ telefone: userPhone }),
                    });
                    Alert.alert('Configurações salvas!');
                  } catch (error) {
                    Alert.alert('Erro', error instanceof ApiError ? error.message : 'Nao foi possivel salvar.');
                  }
                }}
              >
                <Text style={styles.saveSettingsBtnText}>Salvar Configurações</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>

      <Modal visible={!!selectedDoctor} transparent animationType="fade" onRequestClose={() => setSelectedDoctor(null)}>
        <View style={styles.drawerBackdrop}>
          <TouchableOpacity style={styles.drawerOverlay} onPress={() => setSelectedDoctor(null)} />
          {selectedDoctor ? (
            <View style={styles.doctorModal}>
              <Text style={styles.drawerTitle}>{selectedDoctor.name}</Text>
              <Text style={styles.modalMeta}>{selectedDoctor.profession}</Text>
              {selectedDoctor.registro ? <Text style={styles.modalMeta}>Registro: {selectedDoctor.registro}</Text> : null}
              {selectedDoctor.uf ? <Text style={styles.modalMeta}>UF: {selectedDoctor.uf}</Text> : null}
              <Text style={styles.modalBodyText}>{selectedDoctor.bio}</Text>
              <Text style={styles.modalPrice}>R$ {Number(selectedDoctor.valorHora || 0).toFixed(2)} / consulta</Text>

              <Text style={styles.label}>Data (AAAA-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={bookingDate}
                onChangeText={setBookingDate}
                placeholder="2026-12-01"
                placeholderTextColor="#64748B"
              />
              <Text style={styles.label}>Horário</Text>
              <TextInput
                style={styles.input}
                value={bookingTime}
                onChangeText={setBookingTime}
                placeholder="14:00"
                placeholderTextColor="#64748B"
              />
              {bookingFeedback ? <Text accessibilityRole="alert" style={styles.profileFeedback}>{bookingFeedback}</Text> : null}
              <TouchableOpacity
                style={styles.saveSettingsBtn}
                onPress={async () => {
                  setBookingFeedback('');
                  if (!bookingDate || !bookingTime) {
                    setBookingFeedback('Informe data e horário.');
                    return;
                  }
                  try {
                    const iso = new Date(`${bookingDate}T${bookingTime}:00`).toISOString();
                    await api('/api/v1/appointments', {
                      method: 'POST',
                      body: JSON.stringify({
                        medico_id: Number(selectedDoctor.id),
                        data_hora: iso,
                        valor: selectedDoctor.valorHora,
                        status: 'agendada',
                      }),
                    });
                    await reloadAppointments();
                    setBookingFeedback('Consulta agendada com sucesso!');
                  } catch (error) {
                    setBookingFeedback(error instanceof ApiError ? error.message : 'Não foi possível agendar.');
                  }
                }}
              >
                <Text style={styles.saveSettingsBtnText}>Agendar</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Modal>

      <Modal visible={drawerOpen} transparent animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.drawerBackdrop}>
          <TouchableOpacity style={styles.drawerOverlay} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>EcliPsi</Text>
            {[
              { label: 'Início', tab: 'home' as const },
              { label: 'Minhas Consultas', tab: 'consultas' as const },
              { label: 'Perfil', tab: 'perfil' as const },
            ].map((item) => (
              <TouchableOpacity
                key={item.tab}
                style={styles.drawerItem}
                onPress={() => {
                  setActiveTab(item.tab);
                  setDrawerOpen(false);
                }}
              >
                <Text style={styles.drawerItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.drawerItem, styles.drawerLogout]}
              onPress={async () => {
                await clearAuthSession();
                setDrawerOpen(false);
                router.replace('/auth/login');
              }}
            >
              <Text style={styles.drawerItemText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Navegação Inferior (Bottom Navigation) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
          onPress={() => setActiveTab('home')}
        >
          <FontAwesome5 name="house-user" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'consultas' && styles.navItemActive]}
          onPress={() => setActiveTab('consultas')}
        >
          <FontAwesome5 name="search" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'perfil' && styles.navItemActive]}
          onPress={() => setActiveTab('perfil')}
        >
          <FontAwesome5 name="user" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Modal de Detalhes da Consulta */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setDetailsModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>&times;</Text>
            </TouchableOpacity>
            {selectedAppointment && (
              <View>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selectedAppointment.img }} style={styles.modalImg} />
                  <View>
                    <Text style={styles.cardDoctorName}>{selectedAppointment.doctor}</Text>
                    <Text style={styles.specialty}>{selectedAppointment.specialty}</Text>
                  </View>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.label}>Data: <Text style={styles.normalText}>{selectedAppointment.date}</Text></Text>
                  <Text style={styles.label}>Valor: <Text style={styles.normalText}>{selectedAppointment.price}</Text></Text>
                  {selectedAppointment.feedback && (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.label}>Anotações do profissional:</Text>
                      <Text style={styles.feedbackText}>{selectedAppointment.feedback}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Avaliação */}
      <Modal visible={ratingModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setRatingModalVisible(false)}>
              <Text style={styles.modalCloseText}>&times;</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Avaliar Atendimento</Text>
            <Text style={styles.specialty}>{ratingDoctorName}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 }}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity key={value} onPress={() => setRatingValue(value)}>
                  <Text style={{ fontSize: 24 }}>{value <= ratingValue ? '⭐' : '☆'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Comentário (opcional):</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Como foi sua experiência?"
                value={ratingComment}
                onChangeText={setRatingComment}
                multiline
              />
            </View>
            <TouchableOpacity
              style={styles.saveSettingsBtn}
              onPress={async () => {
                if (!ratingAppointmentId || ratingValue < 1) {
                  Alert.alert('Atenção', 'Selecione uma nota de 1 a 5.');
                  return;
                }
                try {
                  await api('/api/v1/reviews', {
                    method: 'POST',
                    body: JSON.stringify({
                      appointment_id: ratingAppointmentId,
                      nota: ratingValue,
                      comentario: ratingComment,
                    }),
                  });
                  Alert.alert('Avaliação enviada com sucesso!');
                  setRatingModalVisible(false);
                } catch (error) {
                  Alert.alert('Erro', error instanceof ApiError ? error.message : 'Nao foi possivel avaliar.');
                }
              }}
            >
              <Text style={styles.saveSettingsBtnText}>Enviar Avaliação</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Estilização adaptada para StyleSheet do React Native
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffeec2',
  },
  header: {
    backgroundColor: '#322c8e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  burgerBtn: {
    gap: 4,
    padding: 4,
  },
  burgerLine: {
    width: 24,
    height: 3,
    backgroundColor: '#f80174',
    borderRadius: 2,
  },
  logoImage: {
    width: 36,
    height: 36,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    fontSize: 14,
    color: '#fe9e8e',
    width: 120,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#322c8e',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  homeSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7500a8',
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e0b0ff',
    marginVertical: 24,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImg: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardDoctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#322c8e',
  },
  specialty: {
    fontSize: 13,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 13,
    color: '#ff3131',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 13,
    color: '#ff3131',
    marginBottom: 4,
  },
  cardPreview: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  cardRating: {
    fontSize: 13,
    color: '#ff9800',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upcomingBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  upcomingBadgeText: {
    color: '#0d47a1',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewBtn: {
    backgroundColor: '#322c8e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rateBtn: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  rateBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewDoctorBtn: {
    backgroundColor: '#7500a8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  viewDoctorBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#7500a8',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
  },
  navItem: {
    padding: 10,
    opacity: 0.6,
  },
  navItemActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666666',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  modalBody: {
    gap: 8,
  },
  feedbackBox: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7500a8',
    marginTop: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: '#333333',
    lineHeight: 18,
  },
  normalText: {
    fontWeight: 'normal',
    color: '#333333',
  },
  profileHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingsNavBtn: {
    borderWidth: 1,
    borderColor: '#7500a8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsNavBtnText: {
    color: '#7500a8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatarWrapper: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  profileAvatarLg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7500a8',
  },
  avatarUploadBtn: {
    backgroundColor: '#f5dfff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  avatarUploadBtnText: {
    color: '#7500a8',
    fontSize: 12,
    fontWeight: 'bold',
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#444444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveSettingsBtn: {
    backgroundColor: '#7500a8',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  saveSettingsBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  btnBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  btnBackText: {
    color: '#7500a8',
    fontWeight: 'bold',
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7500a8',
    borderBottomWidth: 2,
    borderBottomColor: '#f5dfff',
    paddingBottom: 4,
  },
  loadingContainer: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#475569',
    fontSize: 14,
  },
  profileFeedback: {
    width: '100%',
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    color: '#166534',
    textAlign: 'center',
  },
  drawerBackdrop: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  drawer: {
    width: 280,
    maxWidth: '80%',
    backgroundColor: '#FFFFFF',
    paddingTop: 32,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  drawerTitle: {
    color: '#322c8e',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 24,
  },
  drawerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  drawerItemText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  drawerLogout: {
    marginTop: 16,
    borderBottomWidth: 0,
  },
  doctorModal: {
    width: '92%',
    maxWidth: 520,
    alignSelf: 'center',
    margin: 'auto',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalMeta: {
    color: '#475569',
    marginBottom: 4,
  },
  modalBodyText: {
    color: '#0F172A',
    lineHeight: 20,
    marginVertical: 12,
  },
  modalPrice: {
    color: '#166534',
    fontWeight: '800',
    marginBottom: 12,
  },
});