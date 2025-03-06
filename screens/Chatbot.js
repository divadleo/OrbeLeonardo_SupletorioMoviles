import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Button,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import * as XLSX from "xlsx";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

// Función para tomar una muestra aleatoria sin repetición
const randomSample = (array, sampleSize) => {
  const copy = array.slice(); // Creamos una copia del array original
  const sample = []; // Aquí almacenaremos la muestra aleatoria
  const n = Math.min(sampleSize, copy.length); // Aseguramos que no se exceda el tamaño del array
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * copy.length); // Indice aleatorio
    sample.push(copy.splice(randomIndex, 1)[0]); // Extrae el elemento y lo agrega a la muestra
  }
  return sample; // Devolvemos la muestra aleatoria
};

const GeminiChat = () => {
  const [messages, setMessages] = useState([]); // Almacena los mensajes del chat
  const [userInput, setUserInput] = useState(""); // Almacena el mensajes del usuario
  const [loading, setLoading] = useState(false); // Controla el estado de carga
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] }); // Almacena los datos del gráfico
  const [keywordsData, setKeywordsData] = useState([]); // Almacenar los datos de la columna keywords

  const API_KEY = "AIzaSyCOb01j0bMj2d1lT8QBCpxNM2oa3uUrPLY"; // Reemplaza con tu API Key de Gemini

  // Función para enviar mensajes a Gemini
  const fetchGeminiResponse = async (prompt) => {
    try {
      setLoading(true);
      console.log("Enviando pregunta a Gemini:", prompt);
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error en la API: ${response.status} - ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
      console.log("Respuesta de Gemini:", JSON.stringify(data, null, 2));
  
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
      console.log("Texto extraído de la respuesta:", text);
  
      setMessages((prev) => [...prev, { text, user: false }]);
    } catch (error) {
      console.error("Error en la API de Gemini:", error);
      setMessages((prev) => [...prev, { text: `Error: ${error.message}`, user: false }]);
    } finally {
      setLoading(false);
    }
  };

  // Función para seleccionar y procesar el archivo XLSX
  const pickDocument = async () => {
    try {
      console.log("Iniciando selección de archivo...");
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      if (result.canceled) {
        console.log("Selección de archivo cancelada.");
        return;
      }

      const fileUri = result.assets[0].uri;
      console.log("URI del archivo seleccionado:", fileUri);

      // Leer el archivo como base64
      console.log("Leyendo archivo como base64...");
      const b64 = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });
      console.log("Archivo leído como base64 (primeros 100 caracteres):", b64.substring(0, 100));

      // Convertir el archivo base64 a un libro de trabajo
      console.log("Convirtiendo archivo a libro de trabajo...");
      const workbook = XLSX.read(b64, { type: "base64" });
      console.log("Libro de trabajo creado:", workbook);

      // Obtener la primera hoja
      const sheetName = workbook.SheetNames[0];
      console.log("Nombre de la primera hoja:", sheetName);
      const worksheet = workbook.Sheets[sheetName];
      console.log("Datos de la hoja (Keys):", Object.keys(worksheet));
      console.log("Datos de la hoja (Raw):", worksheet);

      // Convertir la hoja a JSON
      console.log("Convirtiendo hoja a JSON...");
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      console.log("Datos convertidos a JSON:", jsonData);

      if (!jsonData || jsonData.length === 0) {
        console.log("El archivo está vacío o no tiene datos válidos.");
        Alert.alert("Error", "El archivo está vacío o no tiene datos válidos.");
        return;
      }

      // Verificar si la columna 'keywords' existe
      const hasKeywordsColumn = jsonData.some((item) => item.keywords);
      if (!hasKeywordsColumn) {
        console.log("No se encontró la columna 'keywords'.");
        Alert.alert("Error", "El archivo no contiene la columna 'keywords'.");
        return;
      }

      // Extraer todos los datos de la columna 'keywords'
      const allKeywords = jsonData
        .map((item) => item.keywords?.toString().toLowerCase())
        .filter((keyword) => keyword);

      if (allKeywords.length === 0) {
        console.log("No se encontraron datos en la columna 'keywords'.");
        Alert.alert("Error", "No se encontraron datos en la columna 'keywords'.");
        return;
      }

      // Tomar una muestra aleatoria de 100 registros (o el total si hay menos)
      const sampleKeywords = randomSample(allKeywords, 100);
      console.log("Muestra aleatoria de 'keywords", sampleKeywords.slice(0, 10));

      // Guardar los datos de keywords en el estado (puedes usarlos si es necesario)
      setKeywordsData(sampleKeywords);

      // Procesar los votos usando la muestra aleatoria
      console.log("Procesando votos...");
      const votos = sampleKeywords.reduce(
        (acc, keyword) => {
          if (keyword.includes("noboa")) acc.Noboa++;
          else if (keyword.includes("luisa")) acc.Luisa++;
          else if (keyword.includes("correa") || keyword.includes("correista")) acc.Luisa++;
          else acc.Nulo++;
          return acc;
        },
        { Noboa: 0, Luisa: 0, Nulo: 0 }
      );

      console.log("Votos procesados:", votos);

      // Actualizar el gráfico
      setChartData({
        labels: ["Votos Noboa", "Votos Luisa", "Votos Nulos"],
        datasets: [{ data: [votos.Noboa, votos.Luisa, votos.Nulo] }],
      });

      // Enviar contexto de votos al chatbot
      fetchGeminiResponse(`Los votos actuales son: Noboa: ${votos.Noboa}, Luisa: ${votos.Luisa}, Nulos: ${votos.Nulo}`);
    } catch (error) {
      console.error("Error al seleccionar el archivo:", error);
      Alert.alert("Error", "Hubo un problema al procesar el archivo.");
    }
  };

  // Función para enviar preguntas al chatbot
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    setMessages((prev) => [...prev, { text: userInput, user: true }]);

    // Incluir el contexto de los votos en la pregunta
    const context = `Los votos actuales son: Noboa: ${chartData.datasets[0].data[0]}, Luisa: ${chartData.datasets[0].data[1]}, Nulos: ${chartData.datasets[0].data[2]}. `;
    fetchGeminiResponse(context + userInput);
    setUserInput("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Análisis de Votos</Text>
      <Button title="Seleccionar Archivo XLSX" onPress={pickDocument} />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Cargando respuesta...</Text>
        </View>
      )}

      {chartData.labels.length > 0 && (
        <BarChart
          data={chartData}
          width={Dimensions.get("window").width - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#f5f5f5",
            backgroundGradientFrom: "#f5f5f5",
            backgroundGradientTo: "#f5f5f5",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          style={{ marginVertical: 20 }}
        />
      )}

      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.user ? styles.userMessage : styles.botMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
      />

      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje..."
        value={userInput}
        onChangeText={setUserInput}
        onSubmitEditing={handleSendMessage}
      />
      <Button title="Enviar" onPress={handleSendMessage} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  loadingContainer: { alignItems: "center", justifyContent: "center", marginVertical: 20 },
  messageContainer: { padding: 10, marginBottom: 10, borderRadius: 10, maxWidth: "80%" },
  userMessage: { alignSelf: "flex-end", backgroundColor: "#4CAF50" },
  botMessage: { alignSelf: "flex-start", backgroundColor: "#E0E0E0" },
  messageText: { fontSize: 16 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginTop: 10 },
});

export default GeminiChat;
