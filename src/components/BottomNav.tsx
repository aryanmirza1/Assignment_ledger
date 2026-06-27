import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BookOpenCheck, Files, Home, Settings, WalletCards } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../theme/theme';

const icons = {
  Dashboard: Home,
  Assignments: BookOpenCheck,
  Payments: WalletCards,
  Files: Files,
  Settings: Settings,
};

export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = icons[route.name as keyof typeof icons];
        const options = descriptors[route.key].options;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            accessibilityLabel={options.tabBarAccessibilityLabel}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            key={route.key}
            onPress={onPress}
            style={styles.item}
          >
            <View style={[styles.iconCircle, isFocused && styles.activeCircle]}>
              <Icon color={isFocused ? colors.white : '#9ca3af'} size={isFocused ? 22 : 20} strokeWidth={2.4} />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.activeTabLabel]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.black,
    borderRadius: 999,
    flexDirection: 'row',
    height: 68,
    justifyContent: 'space-around',
    left: 22,
    paddingHorizontal: 8,
    position: 'absolute',
    right: 22,
    ...shadows.card,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    height: 76,
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 999,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  activeCircle: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 56,
    width: 56,
    transform: [{ translateY: -20 }],
    borderWidth: 4,
    borderColor: colors.white,
    ...shadows.card,
  },
  tabLabel: {
    color: '#9ca3af',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: colors.white,
    fontWeight: '900',
    marginTop: -8,
  },
});
