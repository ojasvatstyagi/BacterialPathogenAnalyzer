
import React, { createContext, useContext, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { colors as defaultColors, createColors, createShadows } from "@/constants/theme";

type ThemeContextType = {
    isDark: boolean;
    toggleTheme: () => void;
    colors: ReturnType<typeof createColors>;
    shadows: ReturnType<typeof createShadows>;
};

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
    colors: defaultColors,
    shadows: createShadows(false),
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === "dark");

    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem("theme");
            if (storedTheme) {
                setIsDark(storedTheme === "dark");
            } else if (systemColorScheme) {
                setIsDark(systemColorScheme === "dark");
            }
        } catch (error) {
            console.error("Failed to load theme preference:", error);
        }
    };

    const toggleTheme = async () => {
        try {
            const newTheme = !isDark;
            setIsDark(newTheme);
            await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
        } catch (error) {
            console.error("Failed to save theme preference:", error);
        }
    };

    const themeColors = createColors(isDark);
    const themeShadows = createShadows(isDark);

    return (
        <ThemeContext.Provider
            value={{ isDark, toggleTheme, colors: themeColors, shadows: themeShadows }}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            {children}
        </ThemeContext.Provider>
    );
};
