// components/About.js
import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, Linking, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useFocusEffect } from "@react-navigation/native"; // Importa useFocusEffect

const About = () => {
  const videoRef = useRef(null);

  // Reproduce el video cuando la pantalla está enfocada
  useFocusEffect(
    React.useCallback(() => {
      const playVideo = async () => {
        if (videoRef.current) {
          await videoRef.current.loadAsync(require("../assets/mivideo.mp4"), {}, false); // Carga el video
          await videoRef.current.playAsync(); // Reproduce el video
        }
      };
      playVideo();

      return () => {
        if (videoRef.current) {
          videoRef.current.stopAsync(); // Detiene el video
        }
      };
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Sección del video y nombre */}
      <View style={styles.profileContainer}>
        <Video
          ref={videoRef}
          source={require("../assets/mivideo.mp4")} // Ruta al video
          style={styles.video}
          resizeMode="cover"
          isLooping={true} // Repetir el video
          shouldPlay={true} // Reproducir automáticamente
          isMuted={true} // Silenciar el video
        />
        <Text style={styles.profileName}>@david.le0</Text>
      </View>

      {/* Sección "Sobre mí" */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre mí</Text>
        <Text style={styles.sectionText}>
          Soy un Leonardo tratando de sacar 20 en el supletorio de Móviles.
        </Text>
      </View>

      {/* Sección "Habilidades" */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Habilidades</Text>
        <View style={styles.skillsContainer}>
          <Text style={styles.skill}>React</Text>
          <Text style={styles.skill}>React Native</Text>
          <Text style={styles.skill}>Node.js</Text>
        </View>
      </View>

      {/* Sección "Contacto" */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        <View style={styles.contactItem}>
          <Ionicons name="logo-github" size={24} color="black" />
          <Text
            style={styles.contactLink}
            onPress={() => Linking.openURL("https://github.com/")}
          >
            GitHub
          </Text>
        </View>

        <View style={styles.contactItem}>
          <Ionicons name="logo-linkedin" size={24} color="blue" />
          <Text
            style={styles.contactLink}
            onPress={() => Linking.openURL("https://linkedin.com/")}
          >
            Linkedin
          </Text>
        </View>

        {/* Nuevo enlace de Twitch */}
        <View style={styles.contactItem}>
          <Ionicons name="logo-twitch" size={24} color="#9146FF" />
          <Text
            style={styles.contactLink}
            onPress={() => Linking.openURL("https://twitch.com")}
          >
            Twitch
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Estilos
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Permite que el contenido se expanda dentro del ScrollView
    padding: 16,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  profileContainer: {
    alignItems: "center",
    marginTop: 32,
  },
  video: {
    width: 200, // Ancho del video
    height: 200, // Alto del video
    borderRadius: 100, // Hace el video circular
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionText: {
    fontSize: 16,
    marginTop: 8,
    textAlign: "justify",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 8,
  },
  skill: {
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 32,
  },
  contactLink: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3b82f6",
    textDecorationLine: "underline",
  },
});

export default About;