// screens/BottomTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Chatbot from "../screens/Chatbot"; // Asegúrate de que la ruta sea correcta
import About from "../screens/About"; // Asegúrate de que la ruta sea correcta

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Chatbot" component={Chatbot} />
      <Tab.Screen name="Perfil" component={About} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;