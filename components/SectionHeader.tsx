
import React from "react";
import { Text, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { typography, spacing } from "@/constants/theme";

type SectionHeaderProps = {
    title: string;
};

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
    const { colors } = useTheme();

    return (
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {title}
        </Text>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        ...typography.heading3,
        marginBottom: spacing.md,
    },
});
