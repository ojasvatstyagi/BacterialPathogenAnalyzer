
import React from "react";
import { View, Text, StyleSheet, Switch, ViewStyle, StyleProp } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { spacing, typography } from "@/constants/theme";

type ProfileOptionProps = {
    icon: any;
    title: string;
    buttonTitle?: string;
    subtitle: string;
    onPress?: () => void;
    variant?: "default" | "danger" | "switch";
    loading?: boolean;
    value?: boolean; // For switch variant
    onValueChange?: (value: boolean) => void; // For switch variant
};

export const ProfileOption: React.FC<ProfileOptionProps> = ({
    icon: Icon,
    buttonTitle,
    title,
    subtitle,
    onPress,
    variant = "default",
    loading = false,
    value,
    onValueChange,
}) => {
    const { colors, isDark } = useTheme();

    const cardStyle: StyleProp<ViewStyle> = [
        styles.optionCard,
        variant === "danger"
            ? {
                borderColor: colors.error + "30",
                backgroundColor: colors.error + "05",
            }
            : {},
        styles.optionCardHover,
    ];

    const buttonStyle: StyleProp<ViewStyle> = [
        styles.actionButton,
        variant === "danger" ? { borderColor: colors.error } : {},
    ];

    return (
        <Card style={cardStyle}>
            <View style={styles.optionContent}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surface : colors.background }]}>
                    <Icon
                        size={24}
                        color={variant === "danger" ? colors.error : colors.primary}
                        style={styles.optionIcon}
                    />
                </View>

                <View style={styles.optionText}>
                    <Text
                        style={[
                            styles.optionTitle,
                            { color: colors.text },
                            variant === "danger" && { color: colors.error },
                        ]}
                    >
                        {title}
                    </Text>
                    <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
                        {subtitle}
                    </Text>
                </View>
            </View>

            {variant === "switch" ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: colors.disabled, true: colors.primary }}
                    thumbColor={colors.surface}
                    ios_backgroundColor={colors.disabled}
                />
            ) : (
                <Button
                    title={variant === "danger" ? "Delete" : buttonTitle}
                    onPress={onPress}
                    variant={variant === "danger" ? "secondary" : "secondary"}
                    size="small"
                    style={buttonStyle}
                    textStyle={variant === "danger" ? { color: colors.error } : undefined}
                    loading={loading}
                />
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.sm,
        padding: spacing.md,
    },
    optionCardHover: {
        // Add hover effect if needed or platform specific styles
    },
    optionContent: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    optionIcon: {
        // Icon styles
    },
    optionText: {
        flex: 1,
        marginRight: spacing.sm,
    },
    optionTitle: {
        ...typography.body,
        fontWeight: "600",
    },
    optionSubtitle: {
        ...typography.caption,
        marginTop: spacing.xs,
    },
    actionButton: {
        minWidth: 80,
    }
});
